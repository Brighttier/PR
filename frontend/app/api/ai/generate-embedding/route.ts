import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Generate Vector Embedding
 * POST /api/ai/generate-embedding
 *
 * Generates vector embeddings for text using Google's text embedding model
 * Used for semantic search and intelligent matching
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, taskType = 'SEMANTIC_SIMILARITY' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    // Call Google's text embedding API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{
              text: text
            }]
          },
          taskType: taskType, // RETRIEVAL_QUERY, RETRIEVAL_DOCUMENT, SEMANTIC_SIMILARITY, etc.
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Embedding API error:', errorText);
      throw new Error(`Embedding API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const embedding = data.embedding?.values;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response');
    }

    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);

    return NextResponse.json({
      success: true,
      embedding: embedding,
      dimensions: embedding.length
    });

  } catch (error: any) {
    console.error('Error generating embedding:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate embedding',
        details: error.message
      },
      { status: 500 }
    );
  }
}
