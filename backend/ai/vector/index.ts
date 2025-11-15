/**
 * Vector Search Index Management
 * Export all vector-related functions
 */

export {
  generateJobEmbedding,
  generateCandidateEmbedding,
  generateTextEmbedding,
  cosineSimilarity,
  similarityToMatchScore,
} from './embeddings';

export {
  findSimilarCandidates,
  findSimilarJobs,
  calculateMatchScore,
  batchCalculateMatchScores,
  searchTalentPool,
} from './search';
