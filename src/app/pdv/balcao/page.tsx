"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { PDVForm } from "@/components/forms/PDVForm";

export default function PDVPage() {
  const router = useRouter();
  
  return (
    <div className="bg-gray-100 min-h-screen">
       <PDVForm tipo="balcao" onClose={() => router.push("/vendas/balcao")} />
    </div>
  );
}
