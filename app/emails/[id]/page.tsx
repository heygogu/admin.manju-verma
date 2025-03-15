"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  TagIcon,
  Building,
  Loader2,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";
import DashboardLayout from "@/components/dashboard-layout";
import PageContainer from "@/components/page-container";

// This would be replaced with your actual data fetching
const fetchEmail = async (id: string) => {
  // Replace with your actual API call
  // For demo purposes, returning dummy data
  try {
    
    const apiResponse = await axios.get(`/api/mail/${id}`);
    console.log(apiResponse?.data,"apiResponse");
    return apiResponse?.data?.data;
  } catch (error) {
    
  }
//   return {
//     _id: id,
//     title: "Summer Collection Launch",
//     clientName: "Sunshine Apparel",
//     thumbnailImage: "/placeholder.svg?height=600&width=1200",
//     description:
//       "A promotional email campaign announcing the launch of the summer collection, highlighting key products and special offers.",
//     emailType: "Promotional",
//     industry: "Fashion",
//     subject:
//       "Introducing Our Vibrant Summer Collection - 20% Off for Early Birds!",
//     emailContent: `
//       <h1>Summer is Calling!</h1>
//       <p>Dear [Customer Name],</p>
//       <p>The sun is shining, and our new Summer Collection is here to brighten your wardrobe!</p>
//       <p>Discover vibrant colors, breathable fabrics, and styles that will keep you cool and fashionable all season long.</p>
//       <h2>Highlights from our collection:</h2>
//       <ul>
//         <li>Breezy linen shirts in 5 new colors</li>
//         <li>Lightweight cotton dresses perfect for beach days</li>
//         <li>Sustainable swimwear made from recycled materials</li>
//         <li>Accessories that add the perfect summer touch</li>
//       </ul>
//       <p><strong>Early Bird Special: 20% OFF your first purchase from the new collection!</strong></p>
//       <p>Use code: SUMMER20 at checkout. Valid until June 15th.</p>
//       <p>Shop now and be ready for the sunny days ahead!</p>
//       <p>Warmly,<br>The Sunshine Apparel Team</p>
//     `,
//     results: {
//       openRate: 32.5,
//       clickRate: 18.7,
//       conversionRate: 4.2,
//       notes:
//         "This campaign performed 15% better than industry average, with particularly strong engagement from the 25-34 age demographic.",
//     },
//     tags: [
//       "Summer Collection",
//       "Fashion",
//       "Promotional",
//       "Discount",
//       "New Arrivals",
//     ],
//     completionDate: "2023-05-10T00:00:00.000Z",
//     featured: true,
//   };
};

 function EmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [email, setEmail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEmail = async () => {
      try {
        const data = await fetchEmail(params.id as string);
        setEmail(data);
      } catch (error) {
        console.error("Failed to fetch email:", error);
      } finally {
        setLoading(false);
      }
    };

    getEmail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
       <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Email not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <PageContainer>

    <div className="grid grid-cols-1">
      {/* Hero Section */}

      <div className="relative h-[40vh] w-full">
        <Image
          src={
            email?.thumbnailImage ||
            "/placeholder.svg?height=600&width=1200"
          }
          alt={email?.title}
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
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 border-none">
            {email?.emailType}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {email?.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{email?.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(email?.completionDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="capitalize">{email?.industry}</span>
              </div>
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
              <h2 className="text-2xl font-bold mb-4">
                Email Campaign Overview
              </h2>
              <p className=" mb-8">{email?.description}</p>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Email Subject</h3>
                <div className="bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff20] rounded-lg p-4">
                
                  <p className="text-lg">{email?.subject}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Email Content</h3>
                <div className="bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff20] rounded-lg p-6 overflow-hidden">
                  <div className="prose prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{ __html: email?.emailContent }}
                    />
                  </div>
                </div>
              </div>

              {email?.results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-bold mb-4">Campaign Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#ffffff08] border-[#ffffff20]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">
                          Open Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-cyan-400">
                          {email?.results?.openRate}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#ffffff08] border-[#ffffff20]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">
                          Click Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-cyan-400">
                          {email?.results?.clickRate}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#ffffff08] border-[#ffffff20]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">
                          Conversion Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-cyan-400">
                          {email?.results?.conversionRate}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {email?.results.notes && (
                    <div className="mt-4 p-4 bg-[#ffffff05] rounded-lg border border-[#ffffff10]">
                      <p className="text-sm">{email?.results?.notes}</p>
                    </div>
                  )}
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
                <h3 className="text-lg font-bold mb-4">Email Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Client</p>
                    <p>{email?.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Industry</p>
                    <p className="capitalize">{email?.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email Type</p>
                    <p>{email?.emailType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Sent Date</p>
                    <p>{new Date(email?.completionDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff20] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="h-4 w-4" />
                  <h3 className="text-lg font-bold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {email?.tags?.map((tag: string, index: number) => (
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

export default function EmailPage(){
    return <DashboardLayout>
        <EmailDetailPage />
    </DashboardLayout>
}