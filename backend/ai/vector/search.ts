/**
 * Vector Search Implementation
 * Search for similar candidates or jobs using vector embeddings
 */

import { firestore } from 'firebase-admin';
import { cosineSimilarity, similarityToMatchScore } from './embeddings';

interface SearchResult {
  id: string;
  data: any;
  similarity: number;
  matchScore: number;
}

/**
 * Find candidates similar to a job
 * @param jobEmbedding - Vector embedding of the job
 * @param companyId - Company ID to filter candidates
 * @param limit - Maximum number of results
 * @param minScore - Minimum match score threshold (0-100)
 */
export async function findSimilarCandidates(
  jobEmbedding: number[],
  companyId: string,
  limit: number = 10,
  minScore: number = 50
): Promise<SearchResult[]> {
  try {
    // Get all applications for the company with embeddings
    const applicationsSnapshot = await firestore()
      .collection('applications')
      .where('companyId', '==', companyId)
      .where('embedding', '!=', null)
      .get();

    const results: SearchResult[] = [];

    applicationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.embedding && Array.isArray(data.embedding)) {
        const similarity = cosineSimilarity(jobEmbedding, data.embedding);
        const matchScore = similarityToMatchScore(similarity);

        if (matchScore >= minScore) {
          results.push({
            id: doc.id,
            data: data,
            similarity: similarity,
            matchScore: matchScore,
          });
        }
      }
    });

    // Sort by match score (highest first) and limit results
    results.sort((a, b) => b.matchScore - a.matchScore);
    return results.slice(0, limit);
  } catch (error) {
    console.error('Error finding similar candidates:', error);
    throw new Error('Failed to find similar candidates');
  }
}

/**
 * Find jobs similar to a candidate
 * @param candidateEmbedding - Vector embedding of the candidate
 * @param limit - Maximum number of results
 * @param minScore - Minimum match score threshold (0-100)
 */
export async function findSimilarJobs(
  candidateEmbedding: number[],
  limit: number = 10,
  minScore: number = 50,
  filterCompanyId?: string
): Promise<SearchResult[]> {
  try {
    // Build query for open jobs with embeddings
    let query = firestore()
      .collection('jobs')
      .where('status', '==', 'Open')
      .where('embedding', '!=', null);

    if (filterCompanyId) {
      query = query.where('companyId', '==', filterCompanyId);
    }

    const jobsSnapshot = await query.get();

    const results: SearchResult[] = [];

    jobsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.embedding && Array.isArray(data.embedding)) {
        const similarity = cosineSimilarity(candidateEmbedding, data.embedding);
        const matchScore = similarityToMatchScore(similarity);

        if (matchScore >= minScore) {
          results.push({
            id: doc.id,
            data: data,
            similarity: similarity,
            matchScore: matchScore,
          });
        }
      }
    });

    // Sort by match score (highest first) and limit results
    results.sort((a, b) => b.matchScore - a.matchScore);
    return results.slice(0, limit);
  } catch (error) {
    console.error('Error finding similar jobs:', error);
    throw new Error('Failed to find similar jobs');
  }
}

/**
 * Calculate match score between a specific job and candidate
 * @param jobEmbedding - Job embedding
 * @param candidateEmbedding - Candidate embedding
 */
export function calculateMatchScore(
  jobEmbedding: number[],
  candidateEmbedding: number[]
): number {
  const similarity = cosineSimilarity(jobEmbedding, candidateEmbedding);
  return similarityToMatchScore(similarity);
}

/**
 * Batch calculate match scores for multiple candidates against a job
 */
export async function batchCalculateMatchScores(
  jobEmbedding: number[],
  applicationIds: string[]
): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  try {
    // Fetch applications in batches (Firestore 'in' query limit is 10)
    const batchSize = 10;
    for (let i = 0; i < applicationIds.length; i += batchSize) {
      const batch = applicationIds.slice(i, i + batchSize);

      const applicationsSnapshot = await firestore()
        .collection('applications')
        .where(firestore.FieldPath.documentId(), 'in', batch)
        .get();

      applicationsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.embedding && Array.isArray(data.embedding)) {
          const matchScore = calculateMatchScore(jobEmbedding, data.embedding);
          results.set(doc.id, matchScore);
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error batch calculating match scores:', error);
    throw new Error('Failed to calculate match scores');
  }
}

/**
 * Search candidates in talent pool by text query
 */
export async function searchTalentPool(
  queryText: string,
  companyId: string,
  limit: number = 20
): Promise<SearchResult[]> {
  try {
    // This is a simplified text search
    // In production, you'd generate embedding for queryText and use vector search
    const talentPoolSnapshot = await firestore()
      .collection('talentPool')
      .where('companyId', '==', companyId)
      .get();

    const results: SearchResult[] = [];

    talentPoolSnapshot.forEach((doc) => {
      const data = doc.data();

      // Simple text matching (in production, use embeddings)
      const searchableText = [
        data.name || '',
        data.skills?.join(' ') || '',
        data.experience?.map((e: any) => e.title).join(' ') || '',
      ].join(' ').toLowerCase();

      if (searchableText.includes(queryText.toLowerCase())) {
        results.push({
          id: doc.id,
          data: data,
          similarity: 1, // Placeholder
          matchScore: 100, // Placeholder
        });
      }
    });

    return results.slice(0, limit);
  } catch (error) {
    console.error('Error searching talent pool:', error);
    throw new Error('Failed to search talent pool');
  }
}
