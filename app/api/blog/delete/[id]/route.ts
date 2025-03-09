import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import BlogPost from '@/lib/models/blog-post'; // Adjust the import path as necessary
import connectToDatabase from '@/lib/db';

export const config = {
    api: {
        bodyParser: true,
    },
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ message: 'Blog ID is required' }, { status: 400 });
    }

    try {
        await connectToDatabase();

        const deletedBlogPost = await BlogPost.findByIdAndDelete(id);

        if (!deletedBlogPost) {
            return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Blog post deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    } finally {
        mongoose.connection.close();
    }
};