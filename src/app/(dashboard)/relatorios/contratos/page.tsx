"use client";

import React from "react";
import { FileSignature, RefreshCcw, DollarSign, Calendar } from "lucide-react";

export default function RelatoriosContratosPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
           <FileSignature className="w-8 h-8 text-[#38b473]" /> Relatório de Contratos
         </h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-black">
          <div className="bg-[#1a1c23] p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute right-[-20px] top-[-20px] opacity-10">
                <RefreshCcw className="w-40 h-40" />
             </div>
             <p className="text-[10px] uppercase font-black text-[#38b473] tracking-[0.3em] mb-2">Churn Rate & Recorrência</p>
             <p className="text-5xl tracking-tighter italic mb-4">0%</p>
             <p className="text-gray-400 max-w-xs text-xs font-bold leading-relaxed">Taxa de cancelamento e retenção de contratos calculada nos últimos 12 meses.</p>
          </div>
          
          <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-center">
             <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.3em] mb-2">MRR (Monthly Recurring Revenue)</p>
             <p className="text-5xl tracking-tighter italic text-gray-900 mb-4">R$ 0,00</p>
             <p className="text-gray-400 max-w-xs text-xs font-bold leading-relaxed">Faturamento recorrente mensal totalizado dos contratos ativos.</p>
          </div>
       </div>
    </div>
  );
}
