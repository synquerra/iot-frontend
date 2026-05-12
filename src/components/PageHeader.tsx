import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="hidden sm:block text-[9px] text-muted-foreground font-semibold uppercase tracking-wider opacity-70">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
