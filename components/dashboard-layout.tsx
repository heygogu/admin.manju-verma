"use client"
import { AppSidebar } from '@/components/app-sidebar';
import "@/app/globals.css"

// export const metadata: Metadata = {
//   title: 'Next Shadcn Dashboard Starter',
//   description: 'Basic dashboard with Next.js and Shadcn'
// };

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar>{children}</AppSidebar>
    </>
  );
}