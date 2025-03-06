import { NextRequest, NextResponse } from "next/server";
import { upsertDocument } from "@/lib/upload";

export async function POST(req: NextRequest, { params }: { params: { index: string } }) {
  const indexName = params.index;
  const { text } = await req.json(); // Expecting extracted text from frontend

  const response = await upsertDocument(indexName, text);

  return NextResponse.json(response);
}
