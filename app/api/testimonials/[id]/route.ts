import { NextRequest } from "next/server";
import Testimonial from "@/lib/models/testimonial";
import connectToDatabase from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await connectToDatabase();

        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return new Response(JSON.stringify({ error: "testimonial  not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ data: testimonial }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching testimonial:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch testimonial" }), {
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

        const email = await Testimonial.findByIdAndDelete(id);

        if (!email) {
            return new Response(JSON.stringify({ error: "Testimonial not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

       

        return new Response(JSON.stringify({ data: email }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error deleting email template:", error);
        return new Response(JSON.stringify({ error: "Failed to delete testimonial" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}