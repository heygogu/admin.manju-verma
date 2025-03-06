import { NextRequest, NextResponse } from "next/server";
import { initPinecone } from "@/lib/pinecone";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest, { params }: { params: { index: string } }) {
  const indexName = params.index;
  const { query } = await req.json();
  const embedding: number[] = await generateEmbedding(query) as unknown as number[];
//   const embedding: number[] = await generateEmbedding(query);
  const pinecone = await initPinecone();
  const index = pinecone.Index(indexName);

  const results = await index.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  return NextResponse.json({ results: results.matches.map(match => match.metadata) });
}
