import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CustomerSidebar } from "@/components/customer-template/app-sidebar"

export default function Layout({children,}: {children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">

        <CustomerSidebar />

        <main className="flex-1 p-6">
          <SidebarTrigger />
          {children}
        </main>

      </div>
    </SidebarProvider>
  )
}