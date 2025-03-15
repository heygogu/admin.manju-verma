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


export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {

  const { id } = await params;
  const {
    title,
    clientName,
    url,
    thumbnailImage,
    description,
    role,
    contentSections,
    testimonial,
    tags,
    completionDate,
    featured
  } = await req.json();

  if (!id) {
    return Response.json({ message: "Blog ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      id,
      {
        title,
        clientName,
        url,
        thumbnailImage,
        description,
        role,
        contentSections: contentSections || [],
        testimonial,
        tags: tags || [],
        completionDate: completionDate || new Date(),
        featured: featured || false
      },
      { new: true }
    );

    if (!updatedBlogPost) {
      return Response.json({ message: "Blog post not found" }, { status: 404 });
    }

    return Response.json(updatedBlogPost, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}