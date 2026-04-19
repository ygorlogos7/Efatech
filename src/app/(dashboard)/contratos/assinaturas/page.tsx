"use client";

import React, { useState, useTransition } from "react";
import { getAssinaturas } from "@/actions/contratos";
import { RefreshCw, Search, PlusCircle, User, CreditCard } from "lucide-react";

export default function AssinaturasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getAssinaturas();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Assinaturas e Recorrência</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Nova Assinatura
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-10 h-10 text-gray-200 mb-2" />
            <span className="text-sm font-bold text-gray-400">Pendente</span>
         </div>
         <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-[#38b473] hover:text-[#38b473] cursor-pointer transition-colors">
            <PlusCircle className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Configurar Plano de Recorrência</span>
         </div>
      </div>
    </div>
  );
}
