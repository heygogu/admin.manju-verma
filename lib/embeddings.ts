import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateEmbedding(text: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  const embedding = await model.embedContent(text);

  return embedding.embedding; // Returns vector array
}
