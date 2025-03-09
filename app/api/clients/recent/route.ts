
// import Blog from "@/lib/models/blog-post"; // Import your Mongoose Blog model
import Contact from "@/lib/models/contacts";
import connectToDatabase from "@/lib/db";

export async function GET(req: Request) {
  
  try {
    await connectToDatabase(); 

    // Fetch blogs with pagination
    const users = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(); 

    return Response.json({
      data: users,
    
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return Response.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
