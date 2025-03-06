import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryKnowledgeBase } from "@/lib/query";

export async function POST(req: NextRequest, { params }: { params: { index: string } }) {
  const indexName = params.index;
  const { query } = await req.json();

  // Retrieve relevant documents from the knowledge base
  const contextDocs = await queryKnowledgeBase(indexName, query);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const response = await model.generateContent(
     `Using this knowledge base:\n${contextDocs}\n\nAnswer: ${query}`,
  );


  
  return NextResponse.json({ answer: response });
}
