import { NextRequest } from "next/server";
import Website from "@/lib/models/website";
import connectToDatabase from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await connectToDatabase();

    const website = await Website.findById(id);

    if (!website) {
      return new Response(JSON.stringify({ error: "Website template not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: website }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching website template:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch website template" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
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
    } = await request.json();
    
    try {
        await connectToDatabase();
    
        const website = await Website.findById(id);
    
        if (!website) {
        return new Response(JSON.stringify({ error: "Website template not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
        }
    
        website.title = title;
        website.clientName = clientName;
        website.url = url;
        website.thumbnailImage = thumbnailImage;
        website.description = description;
        website.role = role;
        website.contentSections = contentSections || [];
        website.testimonial = testimonial;
        website.tags = tags || [];
        website.completionDate = completionDate || new Date();
        website.featured = featured || false;
    
        const updatedWebsite = await website.save();
    
        return new Response(JSON.stringify({ data: updatedWebsite }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error updating website template:", error);
        return new Response(JSON.stringify({ error: "Failed to update website template" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
        });
    }
    }


    export async function DELETE(
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
        ) {
        const { id } = await params;
    
        try {
        await connectToDatabase();
    
        const website = await Website.findByIdAndDelete(id);
    
        if (!website) {
            return new Response(JSON.stringify({ error: "Website template not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
            });
        }
       
    
        return new Response(JSON.stringify({ data: website }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
        } catch (error) {
        console.error("Error deleting website template:", error);
        return new Response(JSON.stringify({ error: "Failed to delete website template" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
        }
    }