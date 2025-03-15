"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  User,
  TagIcon,
  Quote,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import axios from "axios";
import PageContainer from "@/components/page-container";
import DashboardLayout from "@/components/dashboard-layout";

// This would be replaced with your actual data fetching
const fetchWebsite = async (id: string) => {
  // Replace with your actual API call
  // For demo purposes, returning dummy data
try {
    const apiResponse= await axios.get(`/api/website/${id}`);
    return apiResponse?.data?.data;
} catch (error) {
    
}
};

function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getWebsite = async () => {
      try {
        const data = await fetchWebsite(params.id as string);
        setWebsite(data);
      } catch (error) {
        console.error("Failed to fetch website:", error);
      } finally {
        setLoading(false);
      }
    };

    getWebsite();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* <div className="w-16 h-16 border-t-4 border-b-4 border-cyan-500 rounded-full animate-spin"></div> */}
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Website not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <PageContainer>

    <div className="grid grid-cols-1">
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={
            website?.thumbnailImage || "/placeholder.svg"
          }
          alt={website?.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute top-4 left-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className=""
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {website?.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{website?.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(website?.completionDate).toLocaleDateString()}
                </span>
              </div>
              <a
                href={website?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visit Website</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 md:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
              <p className=" mb-8">{website?.description}</p>

              {website?.contentSections.map((section: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="mb-12"
                >
                  <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                  <div
                    className={`grid grid-cols-1 ${
                      index % 2 === 0
                        ? "md:grid-cols-[2fr_1fr]"
                        : "md:grid-cols-[1fr_2fr]"
                    } gap-6 items-center`}
                  >
                    <div className={index % 2 === 0 ? "order-1" : "order-2"}>
                      <p className="">{section.content}</p>
                    </div>
                    <div className={index % 2 === 0 ? "order-2" : "order-1"}>
                      <div className="relative h-64 overflow-hidden rounded-lg">
                        <Image
                          src={section.image || "/placeholder.svg"}
                          alt={section.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {website?.testimonial && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff20] rounded-lg p-6 my-8"
                >
                  <div className="flex items-start gap-4">
                    <Quote className="h-8 w-8 text-cyan-400 shrink-0 mt-1" />
                    <div>
                      <p className="text-lg italic mb-4">
                        {website?.testimonial.quote}
                      </p>
                      <div>
                        <p className="font-medium">
                          {website?.testimonial.author}
                        </p>
                        <p className="text-sm text-gray-400">
                          {website?.testimonial.position}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="sticky top-8"
            >
              <div className="bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff20] rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="capitalize">{website?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Client</p>
                    <p>{website?.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Completed</p>
                    <p>
                      {new Date(website?.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Website</p>
                    <a
                      href={website?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Visit Site <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff20] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="h-4 w-4" />
                  <h3 className="text-lg font-bold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {website?.tags.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      className=""
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </PageContainer>
  );
}

export default function WebsiteDetails() {
   return <DashboardLayout>
    <WebsiteDetailPage />
   </DashboardLayout>
}