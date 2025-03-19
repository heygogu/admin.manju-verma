'use client';
import { useEffect, useState } from 'react';
import { Star, Building2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import PageContainer from '@/components/page-container';
import DashboardLayout from '@/components/dashboard-layout';
import { useParams } from 'next/navigation';
import axios from 'axios';

async function getTestimonial(id: string) {
    const res = await axios.get(`/api/testimonials/${id}`);
    return res?.data?.data;
}

 function TestimonialDetail() {
    const [testimonial, setTestimonial] = useState<any>(null);
   const params=useParams();
    useEffect(() => {
        const fetchData = async () => {
            const data = await getTestimonial(String(params?.id));
            setTestimonial(data);
        };
        fetchData();
    }, [params?.id]);

    if (!testimonial) return <div>Loading...</div>;

    return (
        <PageContainer>

        <div className="">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-4xl mx-auto shadow-xl">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative w-32 h-32"
                            >
                                <Image
                                    src={testimonial?.clientImage}
                                    alt={testimonial?.clientName}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </motion.div>

                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold mb-2">{testimonial?.clientName}</h1>
                                <p className="text-gray-600 mb-2">{testimonial?.clientDesignation}</p>
                                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                                    <Building2 className="w-4 h-4 text-gray-600" />
                                    <Link href={testimonial?.companyUrl} className="text-blue-600 hover:underline">
                                        {testimonial?.companyName}
                                    </Link>
                                    <Globe className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex items-center gap-1 justify-center md:justify-start">
                                    {[...Array(5)].map((_, index) => (
                                        <Star
                                            key={index}
                                            className={`w-5 h-5 ${
                                                index < testimonial?.starRating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8"
                        >
                            <div className="relative">
                                <svg
                                    className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 h-16 w-16 text-gray-100"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                </svg>
                                <p className="relative text-xl top-6  italic leading-relaxed">
                                    {testimonial?.testimonial}
                                </p>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
        </PageContainer>
    );
}

export default function TestimonialDetailPage(){
    return (
        
            <DashboardLayout>
                <TestimonialDetail />
            </DashboardLayout>
        
    );
}