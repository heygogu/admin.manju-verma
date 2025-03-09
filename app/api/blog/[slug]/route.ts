import { NextRequest, NextResponse } from "next/server";
import Blog from "@/lib/models/blog-post"; // Import your Mongoose Blog model
import connectToDatabase from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = await params;
  try {
    await connectToDatabase(); // Connect to MongoDB

    const blog = await Blog.findOne(
        { slug: slug }
    )
    return NextResponse.json({
      data: blog,
    
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
