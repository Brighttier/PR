import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * API Route: Parse Resume
 * POST /api/ai/parse-resume
 *
 * Triggers AI resume parsing after resume upload
 * Extracts structured data and updates user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, resumeUrl } = body;

    if (!userId || !resumeUrl) {
      return NextResponse.json(
        { error: 'userId and resumeUrl are required' },
        { status: 400 }
      );
    }

    // Download resume from Firebase Storage
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      throw new Error(`Failed to download resume: ${response.statusText}`);
    }

    const resumeBlob = await response.blob();
    const arrayBuffer = await resumeBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Import PDF parser dynamically (only when needed)
    const pdfParse = (await import('pdf-parse')).default;

    // Extract text from PDF
    let resumeText = '';
    if (resumeBlob.type === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      resumeText = pdfData.text;
    } else {
      // For DOC/DOCX files, use text extraction
      // For now, just use toString as placeholder
      resumeText = buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.trim().length < 100) {
      throw new Error('Could not extract text from resume');
    }

    // Call Gemini AI to parse resume
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert resume parser. Extract ALL relevant information from the provided resume text into structured JSON format.

INSTRUCTIONS:
1. Extract ALL personal information (name, email, phone, LinkedIn, GitHub, etc.)
2. Parse work experience with exact dates, company names, and detailed responsibilities
3. Extract education history with degrees, institutions, and dates
4. Identify ALL technical skills, soft skills, tools, and frameworks mentioned
5. Extract certifications with issuing organizations and dates
6. Identify personal or academic projects if mentioned
7. Calculate total years of professional experience
8. Infer career level based on experience and roles

IMPORTANT:
- Use ISO date format (YYYY-MM-DD) for all dates
- If a date is approximate or only year/month, use "YYYY-MM" or "YYYY"
- Mark current positions with "current: true" and no endDate
- Categorize skills into technical vs soft skills appropriately
- Be thorough - don't skip any information
- If information is not present, omit the field rather than guessing

OUTPUT FORMAT:
Return ONLY valid JSON with this structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedIn": "string",
    "github": "string",
    "portfolio": "string"
  },
  "summary": "string",
  "experience": [{
    "title": "string",
    "company": "string",
    "location": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "current": boolean,
    "description": "string",
    "responsibilities": ["string"]
  }],
  "education": [{
    "degree": "string",
    "field": "string",
    "institution": "string",
    "graduationDate": "YYYY-MM-DD"
  }],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "tools": ["string"],
    "frameworks": ["string"]
  },
  "totalExperienceYears": number,
  "careerLevel": "entry" | "mid" | "senior" | "lead" | "executive"
}

RESUME TEXT:
${resumeText}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API failed: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const parsedResumeText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!parsedResumeText) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON response
    const parsedResume = JSON.parse(parsedResumeText);

    // Generate skill suggestions based on experience and existing skills
    let skillSuggestions: string[] = [];
    try {
      const skillSuggestionResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a career development expert. Based on this candidate's resume, suggest ADDITIONAL skills they might have acquired but didn't list.

CANDIDATE DATA:
- Experience: ${JSON.stringify(parsedResume.experience)}
- Current Skills: ${JSON.stringify(parsedResume.skills)}
- Career Level: ${parsedResume.careerLevel}

INSTRUCTIONS:
1. Analyze their job responsibilities and titles
2. Identify commonly associated skills they likely have but didn't mention
3. Suggest 5-10 relevant skills they might have missed
4. Focus on transferable skills, soft skills, and complementary technical skills
5. Return ONLY a JSON array of skill names (strings)

IMPORTANT:
- Only suggest skills likely acquired through their work experience
- Don't suggest skills too far from their domain
- Focus on valuable, in-demand skills
- Avoid duplicating skills they already listed

OUTPUT FORMAT:
Return ONLY a JSON array like: ["Skill 1", "Skill 2", "Skill 3"]`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json'
          }
        })
      });

      if (skillSuggestionResponse.ok) {
        const suggestionData = await skillSuggestionResponse.json();
        const suggestionsText = suggestionData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (suggestionsText) {
          skillSuggestions = JSON.parse(suggestionsText);
        }
      }
    } catch (error) {
      console.warn('Skill suggestion generation failed (non-critical):', error);
      // Continue without suggestions if this fails
    }

    // Generate vector embedding for semantic search
    let embedding: number[] | null = null;
    try {
      const candidateSkills = [
        ...(parsedResume.skills?.technical || []),
        ...(parsedResume.skills?.tools || []),
        ...(parsedResume.skills?.frameworks || [])
      ];

      // Create comprehensive text representation for embedding
      const embeddingText = `
        ${parsedResume.summary || ''}

        Skills: ${candidateSkills.join(', ')}

        Experience: ${parsedResume.experience?.map((e: any) =>
          `${e.title} at ${e.company} - ${e.description || ''}`
        ).join('. ') || ''}

        Education: ${parsedResume.education?.map((edu: any) =>
          `${edu.degree} in ${edu.field} from ${edu.institution}`
        ).join('. ') || ''}

        Career Level: ${parsedResume.careerLevel}
        Total Experience: ${parsedResume.totalExperienceYears} years
      `.trim();

      const embeddingResponse = await fetch(`${request.nextUrl.origin}/api/ai/generate-embedding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: embeddingText,
          taskType: 'RETRIEVAL_DOCUMENT'
        })
      });

      if (embeddingResponse.ok) {
        const embeddingResult = await embeddingResponse.json();
        embedding = embeddingResult.embedding;
        console.log(`✅ Generated ${embeddingResult.dimensions}-dimensional embedding vector`);
      }
    } catch (error) {
      console.warn('Embedding generation failed (non-critical):', error);
      // Continue without embedding if this fails
    }

    // Update user profile in Firestore with parsed data and embedding
    const userRef = doc(db, 'users', userId);
    const updateData: any = {
      'profile.parsedResume': parsedResume,
      'profile.skills': [
        ...(parsedResume.skills?.technical || []),
        ...(parsedResume.skills?.tools || []),
        ...(parsedResume.skills?.frameworks || [])
      ],
      'profile.skillSuggestions': skillSuggestions,
      'profile.summary': parsedResume.summary || '',
      'profile.totalExperienceYears': parsedResume.totalExperienceYears || 0,
      'profile.careerLevel': parsedResume.careerLevel || 'entry',
      updatedAt: new Date()
    };

    // Add embedding if successfully generated
    if (embedding) {
      updateData['profile.embedding'] = embedding;
      updateData['profile.embeddingDimensions'] = embedding.length;
    }

    await updateDoc(userRef, updateData);

    console.log(`✅ Resume parsed successfully for user ${userId}`);
    console.log(`✅ Generated ${skillSuggestions.length} skill suggestions`);
    if (embedding) {
      console.log(`✅ Stored ${embedding.length}-dimensional vector embedding for semantic search`);
    }

    return NextResponse.json({
      success: true,
      parsedData: parsedResume,
      skillSuggestions: skillSuggestions,
      embeddingGenerated: !!embedding,
      message: 'Resume parsed successfully'
    });

  } catch (error: any) {
    console.error('Error parsing resume:', error);

    return NextResponse.json(
      {
        error: 'Failed to parse resume',
        details: error.message
      },
      { status: 500 }
    );
  }
}
