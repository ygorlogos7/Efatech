import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { PageTransition } from "@/components/providers/PageTransition";

export default async function PDVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Garantir que só usuários logados acessem o PDV
  if (!session?.user || session.error === "SessionRevoked") {
    redirect("/login");
  }

  return (
    <NotificationProvider>
      <PageTransition>
        <div className="min-h-screen bg-[#f2f2f2]">
          {children}
        </div>
      </PageTransition>
    </NotificationProvider>
  );
}
