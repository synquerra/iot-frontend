"use client"

import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-4 px-4">
        <Button
          className="sm:hidden"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <MenuIcon size={32} className="size-6" />
        </Button>
        <div className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-slate-900 p-1 backdrop-blur-lg shadow-sm">
          <img
            src="/images/logo.png"
            alt="Company Logo"
            className="max-h-12"
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

        {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
