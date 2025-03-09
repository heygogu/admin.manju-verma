
import connectToDatabase from "@/lib/db";
import mongoose from "mongoose";
import Blog from "@/lib/models/blog-post";

export async function GET(req: Request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Debug mongoose connection state
    console.log("MongoDB Connection State:", mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`MongoDB not connected, state: ${mongoose.connection.readyState}`);
    }

    // Log available models
    console.log("Registered Models:", Object.keys(mongoose.models));
    
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Create search query
    const searchQuery = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } }, 
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    console.log("Executing MongoDB query with:", { searchQuery, skip, limit });
    
    // Fetch blogs with pagination
    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(`Successfully retrieved ${blogs.length} blogs`);

    // Count total blogs matching the search
    const totalBlogs = await Blog.countDocuments(searchQuery);

    return Response.json({
      data: blogs,
      count: totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return Response.json({ 
      error: "Failed to fetch blogs", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}