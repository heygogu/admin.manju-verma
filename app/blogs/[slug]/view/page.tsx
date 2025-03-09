// app/blog/[slug]/page.tsx
"use client"
import { Metadata } from 'next';
import BlogPost from '@/components/BlogPost';
import PageContainer from '@/components/page-container';
import DashboardLayout from '@/components/dashboard-layout';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { set } from 'mongoose';


// Server-side data fetching function



export default function BlogPostPage() {
  const params = useParams();
  const [post,setPost] = useState(null);
  async function getBlogPostBySlug(slug: string) {
    try {
      // Use absolute URL for server-side fetching
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`);
      console.log('response', response?.data);
      // return response?.data;
      setPost(response?.data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw new Error('Failed to fetch blog post');
    }
  }

  useEffect(() => {
    getBlogPostBySlug(String(params?.slug));
  }, []);
  
  return (
    <DashboardLayout>
      <PageContainer>
        <BlogPost post={post} />
      </PageContainer>
    </DashboardLayout>
  );
}