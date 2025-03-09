import { NextResponse } from "next/server";
import Blog from "@/lib/models/blog-post"; // Import your Mongoose Blog model
import connectToDatabase from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
  try {
    await connectToDatabase(); 

    // Get query params

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Search query
    const searchQuery = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } }, 
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Fetch blogs with pagination
    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Optimize MongoDB query

    // Count total blogs matching the search
    const totalBlogs = await Blog.countDocuments(searchQuery);

    return NextResponse.json({
      data: blogs,
      count: totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
