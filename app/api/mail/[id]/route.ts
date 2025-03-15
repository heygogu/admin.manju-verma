import { NextRequest } from "next/server";
import Email from "@/lib/models/email";
import connectToDatabase from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await connectToDatabase();

        const email = await Email.findById(id);

        if (!email) {
            return new Response(JSON.stringify({ error: "Email template not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ data: email }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching email template:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch email template" }), {
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
        thumbnailImage,
        description,
        emailType,
        industry,
        emailContent,
        subject,
        results,
        tags,
        completionDate,
        featured
    } = await request.json();

    try {
        await connectToDatabase();

        const email = await Email.findById(id);

        if (!email) {
            return new Response(JSON.stringify({ error: "Email template not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        email.title = title;
        email.clientName = clientName;
        email.thumbnailImage = thumbnailImage;
        email.description = description;
        email.emailType = emailType;
        email.industry = industry;
        email.emailContent = emailContent;
        email.subject = subject;
        email.results = results || {};
        email.tags = tags || [];
        email.completionDate = completionDate || new Date();
        email.featured = featured || false;

        const updatedEmail = await email.save();

        return new Response(JSON.stringify({ data: updatedEmail }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error updating email template:", error);
        return new Response(JSON.stringify({ error: "Failed to update email template" }), {
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

        const email = await Email.findByIdAndDelete(id);

        if (!email) {
            return new Response(JSON.stringify({ error: "Email template not found" }), {
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
        return new Response(JSON.stringify({ error: "Failed to delete email template" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}