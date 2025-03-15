"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  Image,
  Lock,
  LockOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";
import PageContainer from "@/components/page-container";
import DashboardLayout from "@/components/dashboard-layout";
import { DataTable } from "@/components/common/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationCompo from "@/components/common/pagination";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apis from "@/utils/apis";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "@/components/magicui/border-beam";

interface ContentSection {
    title: string;
    content: string;
    image: string;
}

interface Testimonial {
    quote: string;
    author: string;
    position: string;
}

interface Website {
    _id: string;
    title: string;
    clientName: string;
    url: string;
    thumbnailImage: string;
    description: string;
    role: string;
    contentSections: ContentSection[];
    testimonial: Testimonial;
    tags: string[];
    completionDate: string;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
}

interface WebsiteListing {
    data: Website[];
    count: number;
    currentPage: number;
    totalPages: number;
}

function WebsiteTemplate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [websiteListing, setWebsiteListing] = useState<WebsiteListing>({
    data: [],
    count: 0,
    currentPage: 0,
    totalPages: 0,
  });
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const initData = async (loading: boolean) => {
    if (loading) {
      setIsLoading(true);
    }
    let urlSearchParams = new URLSearchParams();
    try {
      if (searchTerm) {
        urlSearchParams.set("search", searchTerm);
      }
      urlSearchParams.set("limit", "10");
      urlSearchParams.set("page", String(params?.pagination || "1"));

      const apiRes: any = await axios.get(
        `/api/website/listing?${urlSearchParams.toString()}`
      );
      setWebsiteListing((prev) => ({
        ...prev,
        data: apiRes?.data?.data,
        count: apiRes?.data?.count,
        currentPage: apiRes?.data?.currentPage,
        totalPages: apiRes?.data?.totalPages,
      }));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const query = searchParams.toString();
    router.push(`/websites/page/${page}?${query}`);
  };
  const handleSearch = (value: string) => {
    let query = new URLSearchParams(searchParams.toString());
    query.set("search", value);
    if (!value) {
      query.delete("search");
    }
    router.replace(`/websites/page/1?${query.toString()}`);
  };
  const handleDeleteEmail = (id: string) => async () => {
    try {
      await axios.delete(`/api/website/${id}`);
      initData(false);
    } catch (error) {
      console.error("Error deleting mail :", error);
    }
  };

  let timeout: NodeJS.Timeout;
  const debounceSearch = (value: string) => {
    setSearchTerm(value);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  useEffect(() => {
    initData(true);
  }, [params?.pagination, searchParams.get("search")]);

const websiteColumns: ColumnDef<Website>[] = [
    {
        id: "index",
        header: ({ column }) => {
            return <span className="w-5 ml-1">Sr. No.</span>;
        },
        cell: ({ row }: { row: any }) => {
            const currentPage = Number(params?.pagination) - 1;
            const itemsPerPage = 10;
            const index = currentPage * itemsPerPage + row.index + 1;
            return <span className="w-5 pl-3">{index}</span>;
        },
    },
    {
        accessorKey: "title",
        header: ({ column }: { column: any }) => {
            return <span className="ml-5">Website Title</span>;
        },
        cell: ({ row }: { row: any }) => (
            <div className="flex items-center gap-2 w-56 ml-4">
                <Avatar className="h-10 w-10 shadow-md border-2 border-white">
                    <AvatarImage
                        className="object-cover"
                        src={row.original.thumbnailImage}
                        alt={row.original.title}
                    />
                    <AvatarFallback>
                        <Image className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">
                        {row.original.title.length > 20
                            ? row.original.title.slice(0, 20) + "..."
                            : row.original.title}
                    </span>
                    <span className="text-gray-500">
                        {row.original.description?.length > 30
                            ? row.original.description.slice(0, 30) + "..."
                            : row.original.description}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ row }: { row: any }) => (
            <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 shadow-md border-2 border-white">
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                <span>{row.original.clientName}</span>
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }: { row: any }) => (
            <Badge variant="secondary">
                {row.original.role}
            </Badge>
        ),
    },
    // {
    //     accessorKey: "url",
    //     header: "Website URL",
    //     cell: ({ row }: { row: any }) => (
    //         <Link href={row.original.url} target="_blank" className="text-blue-500 hover:underline">
    //             {row.original.url}
    //         </Link>
    //     ),
    // },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }: { row: any }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.tags.slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                        {tag}
                    </Badge>
                ))}
                {row.original.tags.length > 3 && (
                    <Badge variant="outline">+{row.original.tags.length - 3}</Badge>
                )}
            </div>
        ),
    },
    {
        accessorKey: "completionDate",
        header: "Completion Date",
        cell: ({ row }: { row: any }) => (
            <span>{dayjs(row.original.completionDate).format("D MMM YYYY")}</span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: any }) => (
            <div className="flex gap-2">
                <Link href={`/websites/${row.original._id}/view`} passHref>
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>

                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[100]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={handleDeleteEmail(row.original._id)}
                            className="text-red-500 cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-4 text-red-500 w-4" />
                            <span className="text-red-500">Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    },
];
  const skeletonColumns = websiteColumns.map((column: any) => ({
    ...column,
    cell: () => <Skeleton className="h-5 p-3 bg-secondary animate-pulse" />,
  }));

  return (
    <PageContainer>
      <div className="space-y-4 grid grid-cols-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
             Website Management
            </h1>
            <p className="text-muted-foreground">
                Manage all your websites for portfolio here.
            </p>
          </div>

          
          <Button variant="outline" className="relative overflow-hidden">
            <Link className="flex gap-2 items-center" href="/websites/create">
              <Plus className=" h-4 w-4" />
              New Website
            </Link>
            <BorderBeam
              size={40}
              initialOffset={20}
              className="from-transparent via-yellow-500  to-transparent"
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
              }}
            />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 ">
            <Search className="absolute left-2 top-2 mt-[2px] h-4 w-4  text-gray-500" />
            <Input
              placeholder="Search by title, client name"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => debounceSearch(e.target.value)}
            />
          </div>
        
        </div>

        {isLoading ? (
          <DataTable
            columns={skeletonColumns}
            data={Array.from({ length: 10 })}
            totalItems={10}
          />
        ) : (
          <DataTable
            columns={websiteColumns}
            data={websiteListing?.data}
            totalItems={10}
          />
        )}
        {websiteListing?.data?.length ? (
          <div className="flex justify-center mt-2">
            <PaginationCompo
              currentPage={Number(params?.pagination) || 1}
              itemsPerPage={Number(searchParams.get("limit")) || 10}
              totalDataCount={websiteListing?.count}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </PageContainer>
  );
}

export default function WebsitePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <WebsiteTemplate />
      </Suspense>
    </DashboardLayout>
  );
}
