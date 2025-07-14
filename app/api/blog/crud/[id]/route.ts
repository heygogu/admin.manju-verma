import { NextRequest } from "next/server";
import mongoose from "mongoose";
import BlogPost from "@/lib/models/blog-post"; // Adjust the import path as necessary
import connectToDatabase from "@/lib/db";

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  if (!id) {
    return Response.json({ message: "Blog ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const deletedBlogPost = await BlogPost.findByIdAndDelete(id);

    if (!deletedBlogPost) {
      return Response.json({ message: "Blog post not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Blog post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  } finally {
  }
};


export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  console.log("@GOT this id", id)

  if (!id) {
    return Response.json({ message: "Blog ID is required" }, { status: 400 })
  }

  try {
    await connectToDatabase()
    const blogPost = await BlogPost.findById(id)

    if (!blogPost) {
      return Response.json({ message: "Blog post not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: blogPost }, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update blog post by ID
export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const { title, excerpt, content, coverImage, tags, author, status, featured } = await req.json()

  if (!id) {
    return Response.json({ message: "Blog ID is required" }, { status: 400 })
  }

  try {
    await connectToDatabase()
    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      id,
      {
        title,
        excerpt,
        content,
        tags: tags || [],
        author,
        status: status || "published",
        featured: featured || false,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedBlogPost) {
      return Response.json({ message: "Blog post not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: updatedBlogPost }, { status: 200 })
  } catch (error) {
    console.error("Error updating blog post:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
