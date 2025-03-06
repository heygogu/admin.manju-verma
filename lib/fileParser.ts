import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(fileBuffer: Buffer, fileType: string): Promise<string> {
  if (fileType === "pdf") {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } else if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else if (fileType === "txt") {
    return fileBuffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }
}
