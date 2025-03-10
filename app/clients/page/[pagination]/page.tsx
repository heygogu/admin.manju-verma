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
  Trash,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import dayjs from "dayjs";
import PageContainer from "@/components/page-container";
import DashboardLayout from "@/components/dashboard-layout";
import { DataTable } from "@/components/common/data-table";

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
import {toast} from "sonner"
import { set } from "mongoose";
interface Client {
  name: string;
  email: string;
  message: string;
  subject: string;
  createdAt: string;
  updatedAt: string;

  __v: number;
  _id: string;
}

interface ClientListing {
  data: Client[];
  count: number;
  currentPage: number;
  totalPages: number;
}

function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clientListing, setClientListing] = useState<ClientListing>({
    data: [],
    count: 0,
    currentPage: 0,
    totalPages: 0,
  });
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const handleSearch = (value: string) => {
    
    let query = new URLSearchParams(searchParams.toString());
    query.set("search", value);
    if(!value){
      query.delete("search")
    }
    router.replace(`/clients/page/1?${query.toString()}`);
  };

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
        `/api/clients?${urlSearchParams.toString()}`
      );
    
      console.log(apiRes);
      setClientListing((prev) => ({
        ...prev,
        data: apiRes.data.data,
        count: apiRes.data.count,
        currentPage: apiRes.data.currentPage,
        totalPages: apiRes.data.totalPages,
      }));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const query= searchParams.toString()
    router.push(`/clients/page/${page}?${query}`);
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const apiRes=await axios.delete("/api/clients/"+id)
      console.log(apiRes,"apiRes")
      toast.success("User data deleted successfully")
      await initData(false)
    } catch (error) {
      toast.error("Failed to delete user data")
      
    }
  }

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
  }, [params?.pagination,searchParams.get("search")]);

  const clientColumns: ColumnDef<any>[] = [
    {
      id: "index",
      header: ({ column }) => {
        return <span className="w-5 ml-1">Sr. No.</span>;
      },
      cell: ({ row }: { row: any }) => {
        return <span className="w-5 pl-3">{row?.index + 1}</span>;
      },
    },

    {
      accessorKey: "name",
      header: "Client",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 shadow-md border-2 border-white">
            <AvatarImage
              className="object-cover"
              src=""
              alt={row.original?.name}
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="block">{row.original?.name}</span>
            <span className="text-muted-foreground">{row.original?.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Query",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{row.original?.subject}</div>
            <div className="text-sm text-muted-foreground cursor-pointer">
              <Tooltip>
                <TooltipTrigger>
                  <span>{row.original?.message?.slice(0, 20) + "..."}</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                <div className="w-56">
                    {row.original?.message}
                </div>
                
                </TooltipContent>
              </Tooltip>
              {/* {row.original?.message?.slice(0, 20) + "..."} */}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: { row: any }) => (
        <div>
          {dayjs(row.original?.createdAt).format("DD MMM YYYY, h:mm A ")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Link href={`/clients/${row.original?._id}/view`} passHref>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          
              <Button variant="ghost" size="icon"
                onClick={()=>handleDeleteClient(row.original?._id)}
                className="text-red-500 cursor-pointer"
              >
                <Trash2 className=" h-4 w-4" />
               
              </Button>
            
        </div>
      ),
    },
  ];
  const skeletonColumns = clientColumns.map((column: any) => ({
    ...column,
    cell: () => <Skeleton className="h-5 p-3 bg-secondary animate-pulse" />,
  }));

  return (
    <PageContainer>
      <div className="space-y-4 grid grid-cols-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client queries and interactions.
            </p>
          </div>
        </div>
        

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 ">
            <Search className="absolute left-2 bottom-[11px] h-4 w-4  text-gray-500" />
            <Input
              placeholder="Search by client name..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => debounceSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {/* <Select>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select> */}
            {/* <Select>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select> */}
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
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
              columns={clientColumns}
              data={clientListing?.data}
              totalItems={10}
            />
          )}
       
        {clientListing?.data?.length ? (
          <div className="flex justify-center mt-2">
            <PaginationCompo
              currentPage={Number(params?.pagination) || 1}
              itemsPerPage={Number(searchParams.get("limit")) || 10}
              totalDataCount={clientListing?.count}
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
