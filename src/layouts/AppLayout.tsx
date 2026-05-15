import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="[--header-height:calc(theme(spacing.14))] overflow-hidden">
            <SidebarProvider className="flex flex-col h-screen">
                <SiteHeader />

                <div className="flex flex-1 overflow-hidden">
                    <AppSidebar />

                    <SidebarInset className="flex-1 min-w-0 overflow-hidden">
                        <main className="h-full w-full min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5">
                            <Outlet />
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}