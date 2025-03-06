"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Eye, FileText, MessageSquare, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentClientsTable } from "@/components/recent-clients-table"
import PageContainer from "@/components/page-container"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const stats = [
    {
      title: "Total Clients",
      value: "2,853",
      change: "+12.5%",
      icon: Users,
      description: "New clients this month",
    },
    {
      title: "Blog Posts",
      value: "42",
      change: "+8.2%",
      icon: FileText,
      description: "Published articles",
    },
    {
      title: "Page Views",
      value: "89.6K",
      change: "+24.3%",
      icon: Eye,
      description: "Monthly traffic",
    },
    {
      title: "Chat Sessions",
      value: "356",
      change: "+18.7%",
      icon: MessageSquare,
      description: "AI interactions",
    },
  ]

  return (
    <PageContainer>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your admin activities and client interactions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <div className="mt-2 flex items-center text-xs font-medium text-green-600">
                  {stat.change}
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Client Inquiries</h2>
        <RecentClientsTable isLoading={isLoading} />
      </div>
    </div>
    </PageContainer>
  )
}

