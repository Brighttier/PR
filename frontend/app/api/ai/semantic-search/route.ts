import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * API Route: Semantic Search for Candidates
 * POST /api/ai/semantic-search
 *
 * Performs semantic search on candidate profiles using vector embeddings
 * Finds candidates similar to a search query or job description
 */

interface CosineSearchResult {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  similarity: number;
  matchScore: number;
  profile: any;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchQuery, companyId, topK = 10, minSimilarity = 0.7 } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'searchQuery is required' },
        { status: 400 }
      );
    }

    // 1. Generate embedding for the search query
    const queryEmbeddingResponse = await fetch(`${request.nextUrl.origin}/api/ai/generate-embedding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: searchQuery,
        taskType: 'RETRIEVAL_QUERY'
      })
    });

    if (!queryEmbeddingResponse.ok) {
      throw new Error('Failed to generate query embedding');
    }

    const queryEmbeddingData = await queryEmbeddingResponse.json();
    const queryEmbedding: number[] = queryEmbeddingData.embedding;

    console.log(`✅ Generated ${queryEmbedding.length}-dimensional query embedding`);

    // 2. Fetch all candidate profiles with embeddings
    const usersRef = collection(db, 'users');
    let candidatesQuery;

    if (companyId) {
      // If searching within a company's candidate pool
      candidatesQuery = query(
        usersRef,
        where('role', '==', 'candidate'),
        where('companyId', '==', companyId)
      );
    } else {
      // Global search across all candidates
      candidatesQuery = query(
        usersRef,
        where('role', '==', 'candidate')
      );
    }

    const candidatesSnapshot = await getDocs(candidatesQuery);

    console.log(`📊 Found ${candidatesSnapshot.size} candidate profiles to search`);

    // 3. Calculate cosine similarity for each candidate
    const results: CosineSearchResult[] = [];

    for (const doc of candidatesSnapshot.docs) {
      const userData = doc.data();
      const profile = userData.profile || {};
      const candidateEmbedding = profile.embedding;

      // Skip candidates without embeddings
      if (!candidateEmbedding || !Array.isArray(candidateEmbedding)) {
        continue;
      }

      try {
        const similarity = cosineSimilarity(queryEmbedding, candidateEmbedding);

        // Only include results above minimum similarity threshold
        if (similarity >= minSimilarity) {
          results.push({
            candidateId: doc.id,
            candidateName: userData.displayName || profile.parsedResume?.personalInfo?.fullName || 'Unknown',
            candidateEmail: userData.email || profile.parsedResume?.personalInfo?.email || '',
            similarity: similarity,
            matchScore: Math.round(similarity * 100), // Convert to percentage
            profile: {
              summary: profile.summary,
              skills: profile.skills,
              careerLevel: profile.careerLevel,
              totalExperienceYears: profile.totalExperienceYears,
              location: profile.parsedResume?.personalInfo?.location
            }
          });
        }
      } catch (error) {
        console.warn(`Error calculating similarity for candidate ${doc.id}:`, error);
        continue;
      }
    }

    // 4. Sort by similarity (highest first) and limit to topK
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, topK);

    console.log(`✅ Found ${topResults.length} matching candidates (similarity >= ${minSimilarity})`);
    if (topResults.length > 0) {
      console.log(`   Top match: ${topResults[0].candidateName} (${topResults[0].matchScore}% similarity)`);
    }

    return NextResponse.json({
      success: true,
      results: topResults,
      totalCandidatesSearched: candidatesSnapshot.size,
      totalMatches: results.length,
      topK: topResults.length,
      searchQuery: searchQuery,
      minSimilarity: minSimilarity
    });

  } catch (error: any) {
    console.error('Error in semantic search:', error);

    return NextResponse.json(
      {
        error: 'Semantic search failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
