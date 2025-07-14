"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Edit,
  Edit2,
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

interface BlogPost {
  author: string;
  content: string;
  coverImage: string;
  createdAt: string;
  excerpt: string;
  publishDate: string;
  slug: string;
  status: string;
  tags: string[];
  title: string;
  updatedAt: string;
  views: number;
  __v: number;
  _id: string;
}

interface BlogListing {
  data: BlogPost[];
  count: number;
  currentPage: number;
  totalPages: number;
}

function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blogListing, setBlogListing] = useState<BlogListing>({
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
        `/api/blog?${urlSearchParams.toString()}`
      );
      setBlogListing((prev) => ({
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
    router.push(`/blogs/page/${page}?${query}`);
  };
  const handleSearch = (value: string) => {
    let query = new URLSearchParams(searchParams.toString());
    query.set("search", value);
    if (!value) {
      query.delete("search");
    }
    router.replace(`/blogs/page/1?${query.toString()}`);
  };
  const handleDeleteBlog = (id: string) => async () => {
    try {
      await axios.delete(`/api/blog/crud/${id}`);
      initData(false);
    } catch (error) {
      console.error("Error deleting blog:", error);
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

  const blogColumns: ColumnDef<any>[] = [
    {
      id: "index",
      header: ({ column }) => {
        return <span className='w-5 ml-1'>Sr. No.</span>;
      },
      cell: ({ row }: { row: any }) => {
        const currentPage = Number(params?.pagination) - 1;
        const itemsPerPage = 10;
        const index = currentPage * itemsPerPage + row.index + 1;
        return <span className='w-5 pl-3'>{index}</span>;
      },
    },
    {
      accessorKey: "title",
      header: ({ column }: { column: any }) => {
        return <span className=' ml-5'>Title</span>;
      },
      cell: ({ row }: { row: any }) => (
        <div className='flex items-center gap-2 w-56 ml-4'>
          <Avatar className='h-10 w-10 shadow-md border-2 border-white'>
            <AvatarImage
              className='object-cover'
              src={row?.original?.coverImage}
              alt={row.original.title}
            />
            <AvatarFallback>
              <Image className='h-4 w-4' />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>
              {row.original?.title?.length > 20
                ? row.original?.title?.slice(0, 20) + "..."
                : row.original.title}
            </span>
            <span className='text-gray-500'>
              {row.original.excerpt?.length > 30
                ? row.original?.excerpt?.slice(0, 30) + "..."
                : row.original.excerpt}
            </span>
          </div>
        </div>
      ),
    },

    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }: { row: any }) => (
        <div className='flex items-center gap-2'>
          <Avatar className='h-10 w-10 shadow-md border-2 border-white'>
            <AvatarImage
              className='object-cover'
              src=''
              alt={row.original.author}
            />
            <AvatarFallback>
              <User className='h-4 w-4' />
            </AvatarFallback>
          </Avatar>
          <span>{row.original?.author}</span>
        </div>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }: { row: any }) => (
        <div className='flex flex-wrap gap-1'>
          {row.original?.tags
            ?.slice(0, 5)
            ?.map((tag: string, index: number) => (
              <Badge key={index} variant='default'>
                {tag}
              </Badge>
            ))}
          {row.original?.tags?.length > 5 && (
            <Badge variant='default'>+{row.original?.tags?.length - 5}</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <Badge
          variant={
            row.original.status === "published" ? "default" : "destructive"
          }
          className={`shadow-md ${
            row.original?.status === "published"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
          {row.original.status === "published"
            ? "Published"
            : row.original.status === "draft"
            ? "Draft"
            : "Unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "Published Date",
      header: "Published Date",
      cell: ({ row }: { row: any }) => (
        <span>
          {dayjs(row.original.publishDate).format("D MMM YYYY, h:mm A")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <div className='flex gap-2'>
          <Link href={`/blogs/${row.original?.slug}/view`} passHref>
            <Button variant='ghost' size='icon'>
              <Eye className='h-4 w-4' />
            </Button>
          </Link>

          <Link href={`/blogs/${row.original?._id}/edit`} passHref>
            <Button variant='ghost' size='icon'>
              <Edit2 className='h-4 w-4' />
            </Button>
          </Link>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <Button variant='ghost' size='icon'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='z-[100]'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {/* <DropdownMenuItem className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onClick={handleDeleteBlog(row.original?._id)}
                className='text-red-500 cursor-pointer'>
                <Trash2 className='mr-2 h-4 text-red-500 w-4' />
                <span className='text-red-500'>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
  const skeletonColumns = blogColumns.map((column: any) => ({
    ...column,
    cell: () => <Skeleton className='h-5 p-3 bg-secondary animate-pulse' />,
  }));

  return (
    <PageContainer>
      <div className='space-y-4 grid grid-cols-1'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Blog Management
            </h1>
            <p className='text-muted-foreground'>
              Create, edit, and manage your blog posts.
            </p>
          </div>

          <Button variant='outline' className='relative overflow-hidden'>
            <Link className='flex gap-2 items-center' href='/blogs/new'>
              <Plus className=' h-4 w-4' />
              New Blog
            </Link>
            <BorderBeam
              size={40}
              initialOffset={20}
              className='from-transparent via-yellow-500  to-transparent'
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
              }}
            />
          </Button>
        </div>

        <div className='flex flex-col md:flex-row gap-4'>
          <div className='relative flex-1 '>
            <Search className='absolute left-2 top-2 mt-[2px] h-4 w-4  text-gray-500' />
            <Input
              placeholder='Search by blog title or description...'
              className='pl-9'
              value={searchTerm}
              onChange={(e) => debounceSearch(e.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Select>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='published'>Published</SelectItem>
                <SelectItem value='deleted'>Deleted</SelectItem>
              </SelectContent>
            </Select>
            {/* <Select>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select> */}
            <Button
              className='relative overflow-hidden'
              variant='outline'
              size='icon'>
              <Filter className='h-4 w-4' />
              {/* <BorderBeam
        duration={6}
        size={400}
        className="from-transparent via-red-500 to-transparent"
      />
     */}
              <BorderBeam
                size={20}
                initialOffset={20}
                reverse
                className='from-transparent via-blue-500  to-transparent'
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 20,
                }}
              />
            </Button>
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
            columns={blogColumns}
            data={blogListing?.data}
            totalItems={10}
          />
        )}
        {blogListing?.data?.length ? (
          <div className='flex justify-center mt-2'>
            <PaginationCompo
              currentPage={Number(params?.pagination) || 1}
              itemsPerPage={Number(searchParams.get("limit")) || 10}
              totalDataCount={blogListing?.count}
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

export default function Blog() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <BlogPage />
      </Suspense>
    </DashboardLayout>
  );
}
