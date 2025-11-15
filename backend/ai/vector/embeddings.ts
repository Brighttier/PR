/**
 * Vector Embeddings Generation using Vertex AI
 * Generates embeddings for jobs and candidates for semantic search
 */

import { VertexAI } from '@google-cloud/vertexai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
const location = 'us-central1';

const vertexAI = new VertexAI({ project: projectId, location: location });

// Initialize the embedding model
const textEmbeddingModel = vertexAI.preview.getGenerativeModel({
  model: 'text-embedding-004',
});

/**
 * Generate embedding for job description
 */
export async function generateJobEmbedding(jobData: {
  title: string;
  description: string;
  requiredSkills: string[];
  department?: string;
  experienceLevel?: string;
}): Promise<number[]> {
  try {
    // Combine job information into a single text for embedding
    const jobText = `
Title: ${jobData.title}
Department: ${jobData.department || 'Not specified'}
Experience Level: ${jobData.experienceLevel || 'Not specified'}
Required Skills: ${jobData.requiredSkills.join(', ')}
Description: ${jobData.description}
    `.trim();

    const request = {
      contents: [{ role: 'user', parts: [{ text: jobText }] }],
    };

    const result = await textEmbeddingModel.generateContent(request);
    const embedding = result.response.candidates[0].content.parts[0].embedding;

    return embedding.values;
  } catch (error) {
    console.error('Error generating job embedding:', error);
    throw new Error('Failed to generate job embedding');
  }
}

/**
 * Generate embedding for candidate profile
 */
export async function generateCandidateEmbedding(candidateData: {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    field: string;
  }>;
  summary?: string;
}): Promise<number[]> {
  try {
    // Combine candidate information into a single text for embedding
    const experienceText = candidateData.experience
      .map(exp => `${exp.title} at ${exp.company}: ${exp.description}`)
      .join('\n');

    const educationText = candidateData.education
      .map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`)
      .join('\n');

    const candidateText = `
Skills: ${candidateData.skills.join(', ')}
Summary: ${candidateData.summary || 'Not provided'}
Experience:
${experienceText}
Education:
${educationText}
    `.trim();

    const request = {
      contents: [{ role: 'user', parts: [{ text: candidateText }] }],
    };

    const result = await textEmbeddingModel.generateContent(request);
    const embedding = result.response.candidates[0].content.parts[0].embedding;

    return embedding.values;
  } catch (error) {
    console.error('Error generating candidate embedding:', error);
    throw new Error('Failed to generate candidate embedding');
  }
}

/**
 * Generate embedding for any generic text
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  try {
    const request = {
      contents: [{ role: 'user', parts: [{ text }] }],
    };

    const result = await textEmbeddingModel.generateContent(request);
    const embedding = result.response.candidates[0].content.parts[0].embedding;

    return embedding.values;
  } catch (error) {
    console.error('Error generating text embedding:', error);
    throw new Error('Failed to generate text embedding');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
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

/**
 * Convert similarity score to match percentage (0-100)
 */
export function similarityToMatchScore(similarity: number): number {
  // Cosine similarity ranges from -1 to 1
  // We map this to 0-100 percentage
  // For our use case, we treat negative similarities as 0
  const normalized = Math.max(0, (similarity + 1) / 2);
  return Math.round(normalized * 100);
}
