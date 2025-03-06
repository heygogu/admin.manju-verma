"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  BarChart3,
  MessageSquare
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { motion } from "framer-motion";
// import { TeamSwitcher } from "@/components/team-switcher"
// import ProjectLogo from "@/app/assets/images/project-logo.png"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"


// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,

    },
    {
      title: "Clients",
      icon: Users,
      url: "/clients",
    },
    {
      title: "Blog",
      icon: FileText,
      url: "/blog",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      url: "/analytics",
    },
    {
      title: "AI Chat",
      icon: MessageSquare,
      url: "/chat",
    },
    {
      title: "Settings",
      icon: Settings,
      url: "/settings",
    },
    

  ],


  currentPage: {
    parent: "Home",
    title: "Dashboard",
  },
}

export function AppSidebar({
  children
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme()
  return (
    <SidebarProvider className=''>

      <Sidebar collapsible="icon" >
        <SidebarHeader className="flex items-center justify-center mt-2">
          {/* <TeamSwitcher teams={data.teams} /> */}
          {/* <Image src={ProjectLogo} height={100} width={200} alt="Project Logo" className="" ></Image> */}
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="">
        <header className="flex  h-16 shrink-0 bg-secondary items-center gap-2 transition-[width,height] ease-linear ">
          <div className="flex items-center w-full gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <SidebarSeparator orientation="vertical" className="mr-2 h-4" />
           
            <div className="flex items-center gap-2 flex-1">

            
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild> */}
              

                <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="ml-auto rounded-full" variant="outline" size="icon">
                  <motion.div
                    initial={{ rotate: theme === "light" ? 0 : 90, scale: theme === "light" ? 1 : 0 }}
                    animate={{ rotate: theme === "light" ? 0 : 90, scale: theme === "light" ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  </motion.div>
                  <motion.div
                    initial={{ rotate: theme === "light" ? -90 : 0, scale: theme === "light" ? 0 : 1 }}
                    animate={{ rotate: theme === "light" ? -90 : 0, scale: theme === "light" ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute"
                  >
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  </motion.div>
                  <span className="sr-only">Toggle theme</span>
                </Button>
              {/* </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            </div>
          </div>
        </header>
        {/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div> */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}