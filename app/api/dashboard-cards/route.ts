import BlogPost from "@/lib/models/blog-post";
import Contact from "@/lib/models/contacts";
import connectToDatabase from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(eq: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(eq.url);
    const type = searchParams.get("type") || "today";

    const getDateRange = (type: string) => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date(now); // Create a new Date object to avoid modifying 'now'

      switch (type) {
        case "weekly":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "monthly":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "yearly":
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "today":
        default:
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0); // Set start time to the beginning of the day
          endDate.setHours(23, 59, 59, 999); // Set end time to the end of the day
          break;
      }

      return { startDate, endDate };
    };

    const { startDate, endDate } = getDateRange(type);
    console.log(
      "Start Date:",
      startDate.toISOString(),
      "End Date:",
      endDate.toISOString()
    );

    const [blogPosts, contacts] = await Promise.all([
      BlogPost.find({ createdAt: { $gte: startDate, $lte: endDate } }),
      Contact.find({ createdAt: { $gte: startDate, $lte: endDate } }),
    ]);

    const totalClients = contacts.length;
    const totalBlogPosts = blogPosts.length;
    const totalPageViews = blogPosts.reduce((acc, post) => acc + post.views, 0);

    const stats = [
      {
        title: "Total Clients",

        value: totalClients.toString(),
      },
      {
        title: "Blog Posts",

        value: totalBlogPosts.toString(),
      },
      {
        title: "Page Views",

        value: totalPageViews.toString(),
      },
    ];

    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return Response.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
