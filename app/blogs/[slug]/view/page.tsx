// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import BlogPost from '@/components/BlogPost';
import PageContainer from '@/components/page-container';
import DashboardLayout from '@/components/dashboard-layout';
import axios from 'axios';

// Define params type
type BlogPostParams = {
  params: {
    slug: string;
  };
};

// Server-side data fetching function
async function getBlogPostBySlug(slug: string) {
  try {
    // Use absolute URL for server-side fetching
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/blog/${slug}`);
    console.log('response', response?.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw new Error('Failed to fetch blog post');
  }
}

// Generate metadata for SEO
// export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
//   const post = await getBlogPostBySlug(params.slug);
  
//   return {
//     title: post.title,
//     description: post.excerpt,
//     openGraph: {
//       title: post.title,
//       description: post.excerpt,
//       images: [{ url: post.coverImage }],
//     },
//   };
// }

// Server Component that receives params directly
export default async function BlogPostPage({ params }: BlogPostParams) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  return (
    <DashboardLayout>
      <PageContainer>
        <BlogPost post={post} />
      </PageContainer>
    </DashboardLayout>
  );
}