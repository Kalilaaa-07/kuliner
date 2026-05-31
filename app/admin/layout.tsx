import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin-template/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        
        <AppSidebar />

        <main className="flex-1 p-6">
          <SidebarTrigger />
          {children}
        </main>

      </div>
    </SidebarProvider>
  )
}