"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "../app/hooks/useAuth"
import {
  Calendar,
  Clock,
  FileText,
  Home,
  Settings,
  Tag,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/",
      color: "text-sky-500",
    },
    {
      label: "Time Tracker",
      icon: Clock,
      color: "text-sky-500",
      href: "/tracker",
    },
    {
      label: "Projects",
      icon: FileText,
      color: "text-sky-500",
      href: "/projects",
    },
    {
      label: "Clients",
      icon: Users,
      color: "text-sky-500",
      href: "/clients",
    },
    {
      label: "Calendar",
      icon: Calendar,
      color: "text-sky-500",
      href: "/calendar",
    },
    {
      label: "Tags",
      icon: Tag,
      color: "text-sky-500",
      href: "/tags",
    },
    {
      label: "Reports",
      icon: FileText,
      color: "text-sky-500",
      href: "/reports",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r border-white/10",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 px-4 py-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-black">M-Track</h2>
          </div>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition",
                  pathname === route.href
                    ? "bg-white/20 text-black"
                    : "text-black/70 hover:text-black"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  <span className="text-black">{route.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
