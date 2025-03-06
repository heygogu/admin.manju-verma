"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for clients
const mockClients = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    company: "Acme Inc.",
    status: "New",
    date: "2023-03-15T09:24:00",
    message: "I'm interested in your services for my business.",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    company: "Tech Solutions",
    status: "Contacted",
    date: "2023-03-14T14:30:00",
    message: "Can you provide a quote for website development?",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.b@example.com",
    company: "Global Enterprises",
    status: "Pending",
    date: "2023-03-13T11:15:00",
    message: "Looking for consultation on digital marketing strategy.",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.d@example.com",
    company: "Creative Studios",
    status: "Resolved",
    date: "2023-03-12T16:45:00",
    message: "Thank you for your proposal. We'd like to proceed.",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert.w@example.com",
    company: "Wilson & Co",
    status: "New",
    date: "2023-03-11T10:00:00",
    message: "Need assistance with branding for our new product line.",
  },
]

const statusColors = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Pending: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

interface RecentClientsTableProps {
  isLoading?: boolean
}

export function RecentClientsTable({ isLoading = false }: RecentClientsTableProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedClients.length === mockClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(mockClients.map((client) => client.id))
    }
  }

  const toggleSelectClient = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter((clientId) => clientId !== id))
    } else {
      setSelectedClients([...selectedClients, id])
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-md border"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedClients.length === mockClients.length}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all clients"
              />
            </TableHead>
            <TableHead>
              <div className="flex items-center">
                Client
                <Button variant="ghost" size="sm" className="ml-1 h-8 p-0">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <div className="flex items-center">
                Date
                <Button variant="ghost" size="sm" className="ml-1 h-8 p-0">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Checkbox
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => toggleSelectClient(client.id)}
                  aria-label={`Select ${client.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[client.status as keyof typeof statusColors]}>
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(client.date)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  )
}

