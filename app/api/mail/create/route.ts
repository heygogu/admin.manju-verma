
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import Email from "@/lib/models/email"; // Adjust the import path to your email model
import connectToDatabase from "@/lib/db";

export const POST = async (req: NextRequest) => {
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
    } = await req.json();

    if (!title || !clientName || !thumbnailImage || !description || !emailType || !industry || !emailContent || !subject) {
        return Response.json(
            { message: "Missing required fields" },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();
        const newEmail = new Email({
            title,
            clientName,
            thumbnailImage,
            description,
            emailType,
            industry,
            emailContent,
            subject,
            results: results || {
                openRate: 0,
                clickRate: 0,
                conversionRate: 0,
                notes: ""
            },
            tags: tags || [],
            completionDate: completionDate || new Date(),
            featured: featured || false
        });

        const savedEmail = await newEmail.save();

        return Response.json(savedEmail, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return Response.json({ message: error?.message }, { status: 500 });
    }
};
