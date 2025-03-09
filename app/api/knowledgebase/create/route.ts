import { NextRequest } from "next/server";
import { initPinecone } from "@/lib/pinecone";

export async function POST(req: NextRequest) {
  const { indexName } = await req.json();
  if (!indexName) {
    return Response.json({ error: "Index name is required" }, { status: 400 });
  }

  const pinecone = await initPinecone();
  
  // Create index only if it doesn't exist
  const existingIndexes = await pinecone.listIndexes();
  if (existingIndexes?.indexes?.some((idx:any) => idx.name === indexName)) {
    return Response.json({ message: "Knowledge base already exists" });
  }

  // Let's try using the vectorDimension property which might be the correct one
  // await pinecone.createIndex({
  //   name: indexName,
  //   spec: {
  //     vectorDimension: 768, // Using the possible correct property name
  //     metric: "cosine",
  //   }
  // });

  // return Response.json({ message: `Knowledge base '${indexName}' created!` });
}