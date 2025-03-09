"use client"
import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/page-container';
import DashboardLayout from '@/components/dashboard-layout';
import { motion } from 'framer-motion';
import { Mail, User, Calendar, MessageSquare, Clock, ChevronDown, ChevronUp, Star, Flag } from 'lucide-react';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import axios from 'axios';

import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => {
    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-1 w-full" />
                </header>
                <div className="rounded-xl shadow-xl overflow-hidden border">
                    <div className="py-3 px-6 flex justify-between items-center">
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="p-6">
                        <div className="mb-8 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-3">
                                    <Skeleton className="h-12 w-12 rounded-lg mr-4" />
                                    <div>
                                        <Skeleton className="h-6 w-32 mb-1" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-8 w-32 rounded-lg" />
                        </div>
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <Skeleton className="h-12 w-12 rounded-lg mr-4" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ClientQueryPage = () => {
    const [clientQuery, setQueryDetails] = useState() as any;
  const [isExpanded, setIsExpanded] = useState(true);
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const initData = async () => {
    setLoading(true)
    try {
     const apiRes=await axios.get("/api/clients/"+params?._id)
     
        setQueryDetails(apiRes?.data?.data)
    } catch (error) {
      
    }finally{
        setLoading(false)
    }
  }

  useEffect(()=>{
initData()
  },[])

  return (
    <PageContainer>
    {loading ? <LoadingSkeleton /> :(

    <div className=" p-6 ">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto "
      >
        <header className="mb-8">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold  mb-2"
          >
            Client Query Details
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 "
          />
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className=" rounded-xl shadow-xl overflow-hidden border"
        >
          {/* Status bar */}
          <div className=" py-3 px-6 flex justify-between items-center">
            {/* <div className="flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-green-400 mr-2"></span>
              <span className="text-primary font-medium">{clientQuery.status}</span>
            </div> */}
            <div className="flex items-center">
              <Flag size={14} className=" mr-1" />
              <span className=" text-sm">{"High"}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Client info */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex-1">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center mb-3"
                >
                  <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                    <User size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold ">{clientQuery?.name}</h2>
                    <p className=" flex items-center">
                      <Mail size={14} className="mr-1" />
                      {clientQuery?.email}
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center border rounded-lg px-4 py-2"
              >
                <Calendar size={16} className="text-indigo-600 mr-2" />
                <span className="text-sm ">{dayjs(clientQuery?.createdAt).format("DD MMM YYYY, h:mm A")}</span>
              </motion.div>
            </div>

            {/* Query content */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-4">
                  <MessageSquare size={24} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  {clientQuery?.subject}
                </h3>
              </div>
              
              <div className=" rounded-lg p-6 border ">
                <p className=" leading-relaxed">
                  {isExpanded 
                    ? clientQuery?.message 
                    : `${clientQuery?.message?.substring(0, 150)}${clientQuery?.message?.length > 150 ? '...' : ''}`
                  }
                </p>
                
                {clientQuery?.message?.length > 150 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 flex items-center text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={16} className="mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-1" />
                        Read more
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Action buttons */}
           
          </div>

          {/* Footer */}
          <div className=" px-6 py-4 border-t">
            <div className="flex justify-between items-center">
              <p className=" text-sm">Query ID: {clientQuery?._id}</p>
              <div className="flex gap-3">
                <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                  <Star size={18} />
                </button>
                <button className="text-gray-500 hover:text-red-600 transition-colors">
                  <Flag size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
    )}

    </PageContainer>
  );
};

export default function ClientQueryPagePage(){
    return (
        <DashboardLayout>
            <ClientQueryPage />
        </DashboardLayout>
    )
};