"use client";

import React from "react";
import { Wrench, ClipboardList, Clock, Search, Filter } from "lucide-react";

export default function RelatoriosOSPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 italic">
         <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
           <Wrench className="w-8 h-8 text-[#38b473]" /> Desempenho de Serviços (OS)
         </h2>
       </div>

       <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-gray-200/50 border border-gray-100 text-gray-400 group cursor-pointer hover:border-[#38b473]/30 transition-all border-dashed border-4">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
             <ClipboardList className="w-10 h-10 opacity-20" />
          </div>
          <h5 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-1">Métricas de Atendimento</h5>
          <p className="max-w-xs mx-auto font-medium">Os tempos de execução e produtividade dos técnicos serão consolidados nesta visão analítica.</p>
       </div>
    </div>
  );
}
