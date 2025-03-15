import { NextRequest } from "next/server";
import mongoose from "mongoose";
import WebsitePost from "@/lib/models/website"; // Adjust the import path as necessary
import connectToDatabase from "@/lib/db";

export const POST = async (req: NextRequest) => {
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
    } = await req.json();

    if (!title || !clientName || !url || !thumbnailImage || !description || !role) {
        return Response.json(
            { message: "Missing required fields" },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();
        const newWebsite = new WebsitePost({
            title,
            clientName,
            url,
            thumbnailImage,
            description,
            role,
            contentSections: contentSections || [],
            testimonial,
            tags: tags || [],
            completionDate: completionDate || new Date(),
            featured: featured || false
        });

        const savedWebsite = await newWebsite.save();

        return Response.json(savedWebsite, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return Response.json({ message: error?.message }, { status: 500 });
    }
};