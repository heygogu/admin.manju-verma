"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import PageContainer from "@/components/page-container";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import { ConfettiButton } from "@/components/magicui/confetti";
import { Bot, Notebook, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogEditor from "@/components/blog-editor";
import { Label } from "@/components/ui/label";
import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import MultipleSelector from "@/components/MultiSelector";
import { FileUploader } from "@/components/file-uploader";
import { useUploadFile } from "@/hooks/use-upload-file";
import { createBlog, uploadImage } from "./actions";
import { useRouter } from "next/navigation";
import { BorderBeam } from "@/components/magicui/border-beam";
import AIChat from "@/components/common/AIChat";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Description is required"),
  coverImage: z.instanceof(File).optional(),
});

function BlogPage() {
  const OPTIONS = [
    { value: "react", label: "React" },
    { value: "javascript", label: "JavaScript" },
    { value: "nextjs", label: "Next.js" },
    { value: "tailwindcss", label: "Tailwind CSS" },
    { value: "typescript", label: "TypeScript" },
    { value: "nodejs", label: "Node.js" },
    { value: "expressjs", label: "Express.js" },
    { value: "mongodb", label: "MongoDB" },
    { value: "postgresql", label: "PostgreSQL" },
    { value: "graphql", label: "GraphQL" },
    { value: "apollo", label: "Apollo" },
    { value: "prisma", label: "Prisma" },
    { value: "vercel", label: "Vercel" },
    { value: "netlify", label: "Netlify" },
    { value: "aws", label: "AWS" },
    { value: "azure", label: "Azure" },
    { value: "docker", label: "Docker" },
    { value: "kubernetes", label: "Kubernetes" },
  ];

  // Fixed: Use consistent variable naming
  const [blogContent, setBlogContent] = useState("");
  const router = useRouter();
  const [aiVisible, setAiVisible] = useState(false);

  const { onUpload, progresses, uploadedFiles, isUploading } = useUploadFile(
    "imageUploader",
    {
      defaultUploadedFiles: [],
    }
  );

  const [imageUploadPending, startImageTransition] = useTransition();
  const [formPending, startFormTransition] = useTransition();
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [blogTags, setBlogTags] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      excerpt: "",
      coverImage: undefined,
    },
  });

  // Fixed: Use useCallback to prevent unnecessary re-renders
  const handleBlogContentChange = useCallback((content: string) => {
    setBlogContent(content);
  }, []);

  const onSubmit = async (data: any) => {
    console.log(data);
    if (imageUploadPending) {
      toast.error("Please wait while we upload the cover image");
      return;
    }
    if (!data.coverImage) {
      toast.error("Please upload a cover image");
      return;
    }
    if (!data.title || !data.excerpt || !blogContent) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const payload = {
        title: data.title,
        tags: blogTags,
        excerpt: data.excerpt,
        content: blogContent,
        coverImage: coverImageUrl,
        author: "Manju Verma",
        status: "published",
      };

      startFormTransition(async () => {
        const result = await createBlog(payload);
        if (result.success) {
          router.replace("/blogs/page/1");
          toast.success("Blog created successfully!");
        } else {
          toast.error("Could not create blog", {
            description: result?.error,
          });
        }
      });
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Could not create blog", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <PageContainer>
      <div className='space-y-8'>
        <div className='flex justify-between items-center'>
          <div>
            <div className='flex items-center gap-2'>
              <Notebook className='h-7 w-7 text-primary' />
              <CardTitle className='text-2xl'>Create Blog</CardTitle>
            </div>
            Start writing your next blog post here.
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setAiVisible(!aiVisible);
              }}
              className='relative overflow-hidden'>
              <Bot className='h-4 w-4' /> {aiVisible ? "Disable" : "Use"} AI
              <BorderBeam
                size={40}
                initialOffset={20}
                className='from-transparent via-blue-500 to-transparent'
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 20,
                }}
              />
            </Button>
            {aiVisible && (
              <Select
                defaultValue='gemini'
                onValueChange={(value) => console.log(value)}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select AI Model' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='gemini'>Gemini</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className='grid grid-cols-12 gap-3'>
          {/* Blog Form */}
          <div
            className={`${
              aiVisible ? "col-span-12 lg:col-span-7" : "col-span-12"
            }`}>
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>
                      Title<span className='text-red-400'>*</span>
                    </Label>
                    <Controller
                      name='title'
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                    {errors?.title && (
                      <p className='text-red-500 text-sm'>
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='excerpt'>
                      Description<span className='text-red-400'>*</span>
                    </Label>
                    <Controller
                      name='excerpt'
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                    {errors?.excerpt && (
                      <p className='text-red-500 text-sm'>
                        {errors.excerpt.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='tags'>Tags</Label>
                    <MultipleSelector
                      onChange={(value: any) => {
                        setBlogTags(value.map((item: any) => item.value));
                      }}
                      defaultOptions={OPTIONS}
                      placeholder='Select/Make Tags...'
                      creatable
                      emptyIndicator={
                        <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
                          no results found.
                        </p>
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='coverImage'>
                      Cover Image<span className='text-red-400'>*</span>
                    </Label>
                    <Controller
                      name='coverImage'
                      control={control}
                      render={({ field }) => (
                        <FileUploader
                          value={field.value ? [field.value] : []}
                          onValueChange={async (files) => {
                            field.onChange(files[0]);
                            if (!files[0]) return;

                            try {
                              const formData = new FormData();
                              formData.append("image", files[0]);
                              startImageTransition(async () => {
                                const result = await uploadImage({ formData });
                                if (result.success) {
                                  toast.success(
                                    "Cover Image Uploaded successfully!"
                                  );
                                  setCoverImageUrl(
                                    result.data?.data?.secure_url
                                  );
                                  return result.data?.data?.secure_url;
                                } else {
                                  toast.error("Could not upload cover image", {
                                    description:
                                      result.error || "Error uploading image.",
                                  });
                                }
                              });
                            } catch (error) {
                              console.error("Error uploading image:", error);
                              return null;
                            }
                          }}
                          maxFileCount={1}
                          maxSize={4 * 1024 * 1024}
                          progresses={progresses}
                          disabled={isUploading}
                        />
                      )}
                    />
                    {errors?.coverImage && (
                      <p className='text-red-500 text-sm'>
                        {errors.coverImage.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label className='' htmlFor='content'>
                      Content<span className='text-red-400'>*</span>
                    </Label>
                    {/* Fixed: Removed initialContent prop and used proper onChange */}
                    <BlogEditor
                      onChange={handleBlogContentChange}
                      placeholder='Start writing your amazing blog post...'
                      height='400px'
                    />
                  </div>

                  {blogContent && coverImageUrl ? (
                    <ConfettiButton
                      type='submit'
                      disabled={formPending}
                      className='flex ml-auto'>
                      {formPending ? (
                        <span>
                          <Loader className='mr-1 animate-spin' />
                        </span>
                      ) : (
                        ""
                      )}
                      Submit
                    </ConfettiButton>
                  ) : null}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          {aiVisible ? <AIChat aiVisible={aiVisible} /> : ""}
        </div>
      </div>
    </PageContainer>
  );
}

export default function Blog() {
  return (
    <DashboardLayout>
      <BlogPage />
    </DashboardLayout>
  );
}
