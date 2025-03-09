import { NextRequest, NextResponse } from "next/server";
// import { upsertDocument } from "@/lib/upload";

export async function POST(req: NextRequest,  {params}: {params: Promise<{ index: string }>}) {
  const index = await params;
  const { text } = await req.json(); // Expecting extracted text from frontend

  // const response = await upsertDocument(index, text);

  // return NextResponse.json(response);
}
