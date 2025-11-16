import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * API Route: Match Jobs to Candidate
 * POST /api/ai/match-jobs
 *
 * Analyzes candidate profile and finds matching jobs
 * Uses AI to calculate match scores based on skills, experience, and preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 1. Get candidate profile from Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const profile = userData.profile || {};
    const parsedResume = profile.parsedResume || {};

    // Extract candidate data
    const candidateSkills = [
      ...(parsedResume.skills?.technical || []),
      ...(parsedResume.skills?.tools || []),
      ...(parsedResume.skills?.frameworks || []),
      ...(profile.skills || [])
    ];

    const candidateExperience = parsedResume.totalExperienceYears || 0;
    const candidateLevel = parsedResume.careerLevel || 'entry';
    const candidateSummary = parsedResume.summary || '';
    const candidatePreferences = profile.preferences || {};

    // 2. Fetch all open jobs from Firestore
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, where('status', '==', 'Open'));
    const jobsSnapshot = await getDocs(jobsQuery);

    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'No open jobs available at this time'
      });
    }

    // 3. Use AI to score each job match
    const jobMatchPromises = jobs.map(async (job: any) => {
      try {
        const matchResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert job matching AI. Calculate how well this candidate matches this job posting.

CANDIDATE PROFILE:
- Skills: ${candidateSkills.join(', ')}
- Experience: ${candidateExperience} years
- Career Level: ${candidateLevel}
- Summary: ${candidateSummary}
- Preferred Job Types: ${candidatePreferences.desiredJobTitles?.join(', ') || 'Not specified'}
- Remote Preference: ${candidatePreferences.remotePreference || 'any'}

JOB POSTING:
- Title: ${job.title}
- Department: ${job.department || 'Not specified'}
- Required Skills: ${job.requiredSkills?.join(', ') || 'Not specified'}
- Experience Level: ${job.experienceLevel || 'Not specified'}
- Job Type: ${job.type || 'Full-time'}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description?.substring(0, 500) || 'Not specified'}

INSTRUCTIONS:
1. Calculate a match score from 0-100 based on:
   - Skills overlap (40% weight)
   - Experience level alignment (30% weight)
   - Job preferences match (20% weight)
   - Career trajectory fit (10% weight)

2. Identify strengths and gaps
3. Provide a brief recommendation reason (2-3 sentences)

OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "matchScore": number (0-100),
  "recommendation": "strong_match" | "good_match" | "potential_match" | "not_recommended",
  "strengths": ["string"],
  "gaps": ["string"],
  "reason": "string"
}`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json'
            }
          })
        });

        if (matchResponse.ok) {
          const matchData = await matchResponse.json();
          const matchText = matchData.candidates?.[0]?.content?.parts?.[0]?.text;

          if (matchText) {
            const matchResult = JSON.parse(matchText);
            return {
              jobId: job.id,
              jobTitle: job.title,
              company: job.companyName || 'Company',
              location: job.location,
              type: job.type,
              department: job.department,
              ...matchResult
            };
          }
        }

        // Fallback if AI matching fails
        return {
          jobId: job.id,
          jobTitle: job.title,
          company: job.companyName || 'Company',
          location: job.location,
          type: job.type,
          department: job.department,
          matchScore: 50,
          recommendation: 'potential_match',
          strengths: [],
          gaps: [],
          reason: 'Match calculated using basic criteria'
        };
      } catch (error) {
        console.error(`Error matching job ${job.id}:`, error);
        return null;
      }
    });

    const allMatches = await Promise.all(jobMatchPromises);
    const validMatches = allMatches.filter(match => match !== null);

    // 4. Sort by match score and filter top recommendations
    const sortedMatches = validMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Get top 10 matches with score >= 60%
    const topRecommendations = sortedMatches
      .filter(match => match.matchScore >= 60)
      .slice(0, 10);

    console.log(`✅ Generated ${topRecommendations.length} job recommendations for user ${userId}`);
    console.log(`   Top match: ${topRecommendations[0]?.jobTitle} (${topRecommendations[0]?.matchScore}%)`);

    return NextResponse.json({
      success: true,
      recommendations: topRecommendations,
      totalJobsAnalyzed: jobs.length,
      message: `Found ${topRecommendations.length} matching jobs`
    });

  } catch (error: any) {
    console.error('Error matching jobs:', error);

    return NextResponse.json(
      {
        error: 'Failed to match jobs',
        details: error.message
      },
      { status: 500 }
    );
  }
}
