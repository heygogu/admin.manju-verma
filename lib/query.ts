import { initPinecone } from "./pinecone";
import { generateEmbedding } from "./embeddings";
import { RecordValues } from "@pinecone-database/pinecone/dist/data/vectors/types";

export async function queryKnowledgeBase(indexName: string, query: string) {
  const pinecone = await initPinecone();
  const index = pinecone.Index(indexName);

  // Convert query text to embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search for relevant documents
  const results = await index.query({
    vector: queryEmbedding as unknown as RecordValues,
    topK: 5, // Retrieve top 5 relevant documents
    includeMetadata: true,
  });

  // Extract text from the retrieved documents
  return results.matches.map(match => match.metadata?.text).join("\n\n");
}
