import { NextRequest } from "next/server";
import Contact from "@/lib/models/contacts"; // Import your Mongoose Blog model
import connectToDatabase from "@/lib/db";

export async function GET(req: NextRequest,  {params}: {params: Promise<{ id: string }>}) {
    const { id } = await params;
  try {
    await connectToDatabase(); // Connect to MongoDB

    const query = await Contact.findById(
       id
    )
    return Response.json({
      data: query,
    
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return Response.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest,  {params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
try {
  await connectToDatabase(); // Connect to MongoDB

  const query = await Contact.findByIdAndDelete(
     id
  )
 return Response.json({
    data: query,
  
  });
} catch (error) {
  console.error("Error deleting client:", error);
  return Response.json({ error: "Failed to delete client" }, { status: 500 });
}
}
