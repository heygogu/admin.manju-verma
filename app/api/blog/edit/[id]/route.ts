import { NextRequest } from "next/server";
import mongoose from "mongoose";
import BlogPost from "@/lib/models/blog-post"; // Adjust the import path as necessary

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { title, excerpt, content, coverImage, author, status, tags } =
    await req.json();

  if (!id) {
    return Response.json({ message: "Missing blog post ID" }, { status: 400 });
  }

  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI!);

    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      id,
      { title, excerpt, content, coverImage, author, status, tags },
      { new: true }
    );

    if (!updatedBlogPost) {
      return Response.json({ message: "Blog post not found" }, { status: 404 });
    }

    return Response.json(updatedBlogPost, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  } finally {
  }
};
