import { Pinecone } from "@pinecone-database/pinecone";

let pinecone: Pinecone | null = null;

export async function initPinecone() {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
}
