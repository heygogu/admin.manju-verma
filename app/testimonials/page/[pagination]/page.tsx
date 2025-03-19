"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRightFromLine,
    ArrowUpToLine,
  CircleArrowOutUpRight,
  Eye,
  Image,
  MoreHorizontal,
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

import PaginationCompo from "@/components/common/pagination";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Testimonial {
    _id: string;
    clientName: string;
    clientImage: string;
    clientDesignation: string;
    companyName: string;
    companyUrl: string;
    testimonial: string;
    isCompany: boolean;
    starRating: number;
    createdAt: string;
    updatedAt: string;
}

interface TestimonialListing {
    data: Testimonial[];
    count: number;
    currentPage: number;
    totalPages: number;
}

function TestimonialListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testimonialListing, setTestimonialListing] = useState<TestimonialListing>({
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
        `/api/testimonials?${urlSearchParams.toString()}`
      );
      setTestimonialListing((prev) => ({
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
    router.push(`/testimonials/page/${page}?${query}`);
  };
  const handleSearch = (value: string) => {
    let query = new URLSearchParams(searchParams.toString());
    query.set("search", value);
    if (!value) {
      query.delete("search");
    }
    router.replace(`/testimonials/page/1?${query.toString()}`);
  };
  const handleDeleteEmail = (id: string) => async () => {
    try {
      await axios.delete(`/api/testimonials/${id}`);
      initData(false);
    } catch (error) {
      console.error("Error deleting testimoial :", error);
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

const testimonialColumns: ColumnDef<Testimonial>[] = [
    {
        id: "index",
        header: () => <span className="">Sr. No.</span>,
        cell: ({ row }) => {
            const currentPage = Number(params?.pagination) - 1;
            const itemsPerPage = 10;
            const index = currentPage * itemsPerPage + row.index + 1;
            return <span className="w-5 pl-3">{index}</span>;
        },
    },
    {
       
        header: "Client Details",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 w-56 truncate">
                <Avatar className="h-10 w-10 shadow-md border-2 border-white">
                    <AvatarImage
                        className="object-cover"
                        src={row.original.clientImage}
                        alt={row.original.clientName}
                    />
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.clientName}</span>
                    <span className="text-gray-500">{row.original.clientDesignation}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <span>{row.original.companyName}</span>
                <Link href={row.original.companyUrl} target="_blank" className="text-sm text-blue-500 hover:underline">
                    <Badge className="">Visit Website <CircleArrowOutUpRight/></Badge>
                </Link>
            </div>
        ),
    },
    {
        accessorKey: "testimonial",
        header: "Testimonial",
        cell: ({ row }) => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                <span className="max-w-md">
                    {row.original.testimonial.length > 50
                        ? row.original.testimonial.slice(0, 50) + "..."
                        : row.original.testimonial}
                </span>

                    </TooltipTrigger>
                    <TooltipContent className="w-60">
                        {row.original.testimonial}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
    },
    {
        accessorKey: "starRating",
        header: "Rating",
        cell: ({ row }) => (
            <div className="flex gap-1">
                {Array.from({ length: row.original.starRating }).map((_, index) => (
                    <span key={index} className="text-yellow-400">★</span>
                ))}
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Date Added",
        cell: ({ row }) => (
            <span>{dayjs(row.original.createdAt).format("D MMM YYYY")}</span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Link href={`/testimonials/${row.original._id}`} passHref>
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
  const skeletonColumns = testimonialColumns.map((column: any) => ({
    ...column,
    cell: () => <Skeleton className="h-5 p-3 bg-secondary animate-pulse" />,
  }));

  return (
    <PageContainer>
      <div className="space-y-4 grid grid-cols-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
             Client Testimonials
            </h1>
            <p className="text-muted-foreground">
                Manage all your client testimonials here.
            </p>
          </div>

          
          <Button variant="outline" className="relative overflow-hidden">
            <Link className="flex gap-2 items-center" href="/testimonials/create">
              <Plus className=" h-4 w-4" />
              New Testimonial
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
            columns={testimonialColumns}
            data={testimonialListing?.data}
            totalItems={10}
          />
        )}
        {testimonialListing?.data?.length ? (
          <div className="flex justify-center mt-2">
            <PaginationCompo
              currentPage={Number(params?.pagination) || 1}
              itemsPerPage={Number(searchParams.get("limit")) || 10}
              totalDataCount={testimonialListing?.count}
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

export default function TestimonialPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <TestimonialListing />
      </Suspense>
    </DashboardLayout>
  );
}
