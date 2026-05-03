import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { PageTitleUpdater } from "@/components/providers/PageTitleUpdater";
import { PageTransition } from "@/components/providers/PageTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f4f7f6]">
        {/* Top Header Navigation */}
        <Header userName={session.user.name || undefined} userEmail={session.user.email || undefined} />
        
        {/* Body with Sidebar and Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          
          <main className="flex-1 overflow-auto p-4 sm:p-6 text-gray-800 relative z-0">
            <PageTitleUpdater />
            <PageTransition>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
