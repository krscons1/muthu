"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface SidebarToggleProps {
  onClick?: () => void;
}

export function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="text-white hover:bg-white/10 -ml-1"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}
