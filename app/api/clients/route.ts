
import Contact from "@/lib/models/contacts"; // Import your Mongoose Blog model
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
            { name: { $regex: search, $options: "i" } }, 
            { message: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Fetch blogs with pagination
    const users = await Contact.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Optimize MongoDB query

    // Count total blogs matching the search
    const totalUsers = await Contact.countDocuments(searchQuery);

    return Response.json({
      data: users,
      count: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return Response.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
