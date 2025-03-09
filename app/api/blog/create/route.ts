import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import BlogPost, { IBlogPost } from '@/lib/models/blog-post'; // Adjust the import path as necessary
import connectToDatabase from '@/lib/db';

export const POST = async (req: NextRequest) => {
    const { title, excerpt, content, coverImage, author, status, tags } = await req.json();

    if (!title || !excerpt || !content || !author) {
        return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        await connectToDatabase()

        const newBlogPost: IBlogPost = new BlogPost({
            title,
            excerpt,
            content,
            coverImage,
            author,
            status,
            tags,
        });

        const savedBlogPost = await newBlogPost.save();

        return Response.json(savedBlogPost, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    } finally {
        mongoose.connection.close();
    }
};