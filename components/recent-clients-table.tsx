"use client";

import { motion } from "framer-motion";
import { Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./common/data-table";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

interface RecentClientsTableProps {
  isLoading?: boolean;
  recentClients?: any;
}
export function RecentClientsTable({
  isLoading = false,
  recentClients,
}: RecentClientsTableProps) {
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
                  <div className="w-56">{row.original?.message}</div>
                </TooltipContent>
              </Tooltip>
              {/* {row.original?.message?.slice(0, 20) + "..."} */}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <Badge variant="default">{"Recent"}</Badge>
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
        </div>
      ),
    },
  ];
  const skeletonColumns = clientColumns.map((column: any) => ({
    ...column,
    cell: () => <Skeleton className="h-5 p-3 bg-secondary animate-pulse" />,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-md border"
    >
      <div>
        {isLoading ? (
          <DataTable
            columns={skeletonColumns}
            data={Array.from({ length: 5 })}
            totalItems={5}
          />
        ) : (
          <DataTable
            columns={clientColumns}
            data={recentClients}
            totalItems={10}
          />
        )}
      </div>
    </motion.div>
  );
}
