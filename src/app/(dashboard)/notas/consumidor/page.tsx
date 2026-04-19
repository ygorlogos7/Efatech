"use client";

import React, { useState, useTransition } from "react";
import { getNotas } from "@/actions/notas";
import { LayoutGrid, Search, Filter, PlusCircle, CheckCircle2, Clock } from "lucide-react";

export default function NotasConsumidorPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getNotas("consumidor");
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Notas do Consumidor (NFCe)</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Emitir Nova NFCe
        </button>
      </div>

      <div className="bg-white px-6 py-10 rounded-md shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-5 text-gray-300">
           <LayoutGrid className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-bold text-gray-700">Ponto de Venda (PDV)</h4>
        <p className="text-gray-400 max-w-sm mt-1">Integre seu frente de caixa para emitir cupons fiscais eletrônicos automaticamente em cada venda.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Vendas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
           </div>
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Emitido</p>
              <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
           </div>
        </div>
      </div>
    </div>
  );
}
