"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Eye,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentClientsTable } from "@/components/recent-clients-table";
import PageContainer from "@/components/page-container";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import { NumberTicker } from "@/components/magicui/number-ticker";

const DashboardCardSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16 mt-1" />
              <Skeleton className="h-4 w-full mt-1" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const [recentClients, setRecentClients] = useState([]);
  const [dashboardCards, setDashboardCards] = useState([]) as any;
  const [type, setType] = useState("today");

  const fetchDashboardCards = async (type: string) => {
    try {
      const apiRes = await axios.get("api/dashboard-cards?type=" + type);
      console.log(apiRes, "apiRes");
      setDashboardCards(apiRes?.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  const fetchRecentClients = async () => {
    try {
      const apiRes = await axios.get("api/clients/recent");

      setRecentClients(apiRes?.data?.data);
    } catch (error) {
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentClients();
    fetchDashboardCards("today");
  }, []);

  return (
    <PageContainer>
      <div className="space-y-8 grid grid-cols-1">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
              </h1>
            <p className="text-muted-foreground">
              Overview of your admin activities and client interactions.
            </p>
          </div>
          <div>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                fetchDashboardCards(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <DashboardCardSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-3 ">
            {Array.isArray(dashboardCards) && dashboardCards.length
              ? dashboardCards?.map((stat, index) => (
                  <motion.div
                    key={stat?.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: isLoading ? 0 : 1,
                      y: isLoading ? 20 : 0,
                    }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                        <CardTitle className="text-sm font-medium ">
                          {stat?.title}
                        </CardTitle>
                        {stat?.title === "Total Clients" ? (
                          <Users className="h-6 w-6 text-blue-500" />
                        ) : stat?.title === "Blog Posts" ? (
                          <FileText className="h-6 w-6 text-green-500" />
                        ) : (
                          <Eye className="h-6 w-6 text-purple-500" />
                        )}
                      </CardHeader>
                      <CardContent className="">
                        {/* <div className="text-3xl font-bold ">{stat?.value}</div> */}
                        <NumberTicker
                          delay={0}
                          value={stat?.value}
                          className="whitespace-pre-wrap text-3xl font-medium tracking-tighter text-black dark:text-white"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {type === "today"
                            ? "Today"
                            : type === "weekly"
                            ? "This Week"
                            : type === "monthly"
                            ? "This Month"
                            : "This Year"}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {stat?.description}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              : ""}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Client Inquiries</h2>
          <RecentClientsTable
            isLoading={isTableLoading}
            recentClients={recentClients}
          />
        </div>
      </div>
    </PageContainer>
  );
}

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardCardSkeleton />}>
        <DashboardPage />
      </Suspense>
    </DashboardLayout>
  );
}
