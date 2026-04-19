"use client";

import React, { useState, useTransition } from "react";
import { getLocacoes } from "@/actions/contratos";
import { ArrowLeftRight, Search, PlusCircle, Calendar, Truck } from "lucide-react";

export default function LocacoesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getLocacoes();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-4 text-3xl font-bold text-gray-900">
        <h2>Gestão de Locações</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Nova Locação
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-12 text-center text-gray-500">
         <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <ArrowLeftRight className="w-10 h-10" />
         </div>
         <h4 className="text-xl font-bold text-gray-700">Contratos de Pequena e Longa Duração</h4>
         <p className="max-w-xs mx-auto mt-1">Gerencie locações de equipamentos, veículos ou espaços com controle de período e faturamento.</p>
      </div>
    </div>
  );
}
