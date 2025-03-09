import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import BlogPost from '@/lib/models/blog-post'; // Adjust the import path as necessary

export const config = {
    api: {
        bodyParser: true,
    },
};

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;
    const { title, excerpt, content, coverImage, author, status, tags } = await req.json();

    if (!id) {
        return NextResponse.json({ message: 'Missing blog post ID' }, { status: 400 });
    }

    try {
        await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI!);

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(
            id,
            { title, excerpt, content, coverImage, author, status, tags },
            { new: true }
        );

        if (!updatedBlogPost) {
            return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
        }

        return NextResponse.json(updatedBlogPost, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    } finally {
        mongoose.connection.close();
    }
};