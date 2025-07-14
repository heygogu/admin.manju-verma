"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import QuillContentRenderer from "./QuillContentRenderer";

const BlogPost = ({ post }: any) => {
  if (!post?.data) return null;

  const {
    content,
    coverImage,
    publishDate,
    tags,
    title,
    updatedAt,
    views,
    author,
  } = post?.data;

  // Format dates
  const publishedDate = new Date(publishDate);
  const formattedPublishDate = publishedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className='min-h-screen'>
      <main className='container mx-auto px-4 py-8 max-w-4xl'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='space-y-8'>
          {/* Hero Section */}
          <motion.div variants={itemVariants} className='relative'>
            <div className='rounded-2xl overflow-hidden aspect-video relative shadow-xl'>
              <Image
                src={coverImage || "/placeholder.svg"}
                alt={title}
                fill
                className='object-cover transition-transform rounded-2xl duration-700 hover:scale-105'
                priority
              />
            </div>

            <div className='absolute bottom-0 left-0 w-full p-6'>
              <div className='flex flex-wrap gap-2 mb-2'>
                {tags?.map((tag: string, index: number) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className='bg-indigo-500 text-white text-xs px-2 py-1 rounded-full'>
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Post Meta */}
          <motion.div variants={itemVariants} className='space-y-4'>
            <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white'>
              {title}
            </h1>

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg'>
                  {author?.charAt(0)}
                </div>
                <div>
                  <p className='font-medium text-gray-900 dark:text-white'>
                    {author}
                  </p>
                  <div className='flex items-center text-gray-500 dark:text-gray-400 text-sm'>
                    <Calendar size={14} className='mr-1' />
                    <span>{formattedPublishDate}</span>
                  </div>
                </div>
              </div>

              <div className='flex space-x-4 text-gray-500 dark:text-gray-400 text-sm'>
                <div className='flex items-center'>
                  <Clock size={14} className='mr-1' />
                  <span>Updated {timeAgo}</span>
                </div>
                <div className='flex items-center'>
                  <Eye size={14} className='mr-1' />
                  <span>{views?.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Article Content - Using QuillContentRenderer */}
          <motion.div
            variants={itemVariants}
            className='text-gray-800 dark:text-gray-200'>
            <QuillContentRenderer
              content={content}
              className='text-lg leading-relaxed'
            />
          </motion.div>

          {/* Tags */}
          <motion.div
            variants={itemVariants}
            className='pt-8 border-t border-gray-200 dark:border-gray-800'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
              Related Topics
            </h3>
            <div className='flex flex-wrap gap-2'>
              {tags?.map((tag: string, index: number) => (
                <motion.div key={index}>
                  <Link
                    href={`/tag/${tag?.toLowerCase().replace(/\s+/g, "-")}`}
                    className='inline-block'>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className='bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full transition duration-200 inline-flex items-center'>
                      <Tag size={14} className='mr-1' />
                      {tag}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default BlogPost;
