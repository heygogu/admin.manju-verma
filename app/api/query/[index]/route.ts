import { NextRequest } from "next/server";
import { initPinecone } from "@/lib/pinecone";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest,  {params}: {params: Promise<{ index: string }>}) {
  const {index} = await params;
  const { query } = await req.json();
  const embedding: number[] = await generateEmbedding(query) as unknown as number[];
//   const embedding: number[] = await generateEmbedding(query);
  const pinecone = await initPinecone();
  const i = pinecone.Index(index);

  const results = await i.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  return Response.json({ results: results.matches.map(match => match.metadata) });
}
