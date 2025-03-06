import { NextRequest, NextResponse } from "next/server";
import { initPinecone } from "@/lib/pinecone";

export async function GET() {
  const pinecone = await initPinecone();
  const existingIndexes = await pinecone.listIndexes();

  return NextResponse.json({ knowledgeBases: existingIndexes.indexes ? existingIndexes.indexes.map((idx:any) => idx.name) : [] });
}
