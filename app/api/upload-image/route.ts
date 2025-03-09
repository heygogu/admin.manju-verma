import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert buffer to readable stream
    const stream = Readable.from(buffer);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.pipe(uploadStream);
    });

    return NextResponse.json({
      message: "Upload successful",
      data: uploadResponse,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
