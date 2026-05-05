"use client"

import { MenuIcon, ChevronRight, LayoutDashboard, Settings, Terminal, Map, Bell, Package, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"

const pathConfigs = [
  { pattern: /^\/devices\/settings(\/.*)?$/, label: "Device Settings", icon: Settings },
  { pattern: /^\/devices\/testing(\/.*)?$/, label: "Device Testing", icon: Terminal },
  { pattern: /^\/devices\/geofencing(\/.*)?$/, label: "Geofencing", icon: Map },
  { pattern: /^\/devices\/telemetry(\/.*)?$/, label: "Telemetry", icon: Activity },
  { pattern: /^\/devices\/fota(\/.*)?$/, label: "FOTA Updates", icon: Package },
  { pattern: /^\/devices\/list(\/.*)?$/, label: "Device Fleet", icon: LayoutDashboard },
  { pattern: /^\/devices\/[^\/]+$/, label: "Device Overview", icon: LayoutDashboard },
  { pattern: /^\/alerts(\/.*)?$/, label: "Alerts & Errors", icon: Bell },
  { pattern: /^\/$/, label: "Dashboard", icon: LayoutDashboard },
];

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const location = useLocation()
  const pathname = location.pathname
  
  const currentPath = pathConfigs.find(c => c.pattern.test(pathname)) || { label: "Command Center", icon: LayoutDashboard }

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-[--header-height] w-full items-center gap-4 px-4">
        <Button
          className="sm:hidden"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <MenuIcon size={32} className="size-6" />
        </Button>

        <div className="hidden sm:inline-flex items-center justify-center rounded-xl border border-border/60 bg-slate-900 p-1 backdrop-blur-lg shadow-sm">
          <img
            src="/images/logo.png"
            alt="Company Logo"
            className="max-h-10"
          />
        </div>

        <Button
          className="hidden sm:flex"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <MenuIcon size={32} className="size-6" />
        </Button>

        {/* Breadcrumb Section */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="hidden md:flex h-4 w-px bg-border/60 mx-1" />
          <div className="flex items-center gap-1.5 min-w-0">
            <currentPath.icon className="h-4 w-4 text-primary/60 shrink-0" />
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hidden xs:block">System</span>
              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/20 hidden xs:block" />
              <span className="text-[11px] font-black uppercase tracking-widest text-foreground truncate">
                {currentPath.label}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
