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
  
  const currentPath = pathConfigs.find(c => c.pattern.test(pathname)) || { label: "Dashboard", icon: LayoutDashboard }

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-3 sm:gap-3 sm:px-4">
        {/* Mobile: Menu toggle */}
        <Button
          className="sm:hidden flex-shrink-0"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <MenuIcon className="size-5" />
        </Button>

        {/* Desktop: Logo */}
        <div className="hidden sm:inline-flex items-center justify-center rounded-xl border border-border/60 bg-slate-900 p-1 backdrop-blur-lg shadow-sm flex-shrink-0">
          <img
            src="/images/logo.png"
            alt="Synquerra"
            className="max-h-9"
          />
        </div>

        {/* Desktop: Sidebar toggle */}
        <Button
          className="hidden sm:flex flex-shrink-0"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <MenuIcon className="size-5" />
        </Button>

        {/* Divider */}
        <div className="h-5 w-px bg-border/60 flex-shrink-0" />

        {/* Breadcrumb — always visible */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <currentPath.icon className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
          <div className="flex items-center gap-1 min-w-0">
            <span className="hidden xs:block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 flex-shrink-0">
              System
            </span>
            <ChevronRight className="hidden xs:block h-3 w-3 text-muted-foreground/30 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide text-foreground truncate">
              {currentPath.label}
            </span>
          </div>
        </div>

        {/* Right: Theme toggle */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
