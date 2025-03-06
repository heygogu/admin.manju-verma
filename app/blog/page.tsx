"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageContainer from "@/components/page-container";
import DashboardLayout from "@/components/dashboard-layout";

// Mock data for blog posts
const mockPosts = [
  {
    id: "1",
    title: "Getting Started with Next.js and shadcn/ui",
    excerpt: "Learn how to build beautiful UIs with Next.js and shadcn/ui components.",
    coverImage: "/placeholder.svg?height=400&width=600",
    status: "published",
    publishDate: "2023-03-15",
    readTime: "5 min",
  },
  {
    id: "2",
    title: "Advanced Framer Motion Animations",
    excerpt: "Take your web animations to the next level with Framer Motion.",
    coverImage: "/placeholder.svg?height=400&width=600",
    status: "published",
    publishDate: "2023-03-10",
    readTime: "8 min",
  },
  {
    id: "3",
    title: "Implementing AI Features in Your Web App",
    excerpt: "A guide to integrating AI capabilities into your web applications.",
    coverImage: "/placeholder.svg?height=400&width=600",
    status: "draft",
    publishDate: "",
    readTime: "12 min",
  },
  {
    id: "4",
    title: "Optimizing MongoDB Performance",
    excerpt: "Best practices for scaling and optimizing MongoDB in production.",
    coverImage: "/placeholder.svg?height=400&width=600",
    status: "draft",
    publishDate: "",
    readTime: "10 min",
  },
];

function BlogPage() {
  const [activeTab, setActiveTab] = useState("published");
  
  const publishedPosts = mockPosts.filter(post => post.status === "published");
  const draftPosts = mockPosts.filter(post => post.status === "draft");
  
  return (
    <PageContainer>

    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your blog posts.
          </p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="published" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="published">
            Published
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
              {publishedPosts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
              {draftPosts.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="published" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedPosts.map((post, index) => (
              <BlogPostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="drafts" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {draftPosts.map((post, index) => (
              <BlogPostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </PageContainer>
  );
}

interface BlogPostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    coverImage: string;
    status: string;
    publishDate: string;
    readTime: string;
  };
  index: number;
}

function BlogPostCard({ post, index }: BlogPostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          {post.status === "draft" && (
            <Badge className="absolute right-2 top-2 bg-yellow-500">Draft</Badge>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            {post.publishDate && (
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(post.publishDate).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {post.readTime}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/blog/${post.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <FileText className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/blog/${post.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
export default function Blog(){
  return (
    <DashboardLayout>
      <BlogPage />
    </DashboardLayout>
  )
}