"use client";

import React from "react";
import { Box, Package, Activity, Search, Filter } from "lucide-react";

export default function RelatoriosEstoquePage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
              <Box className="w-8 h-8 text-[#38b473]" /> Inventário & Giro
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Análise de Movimentação e Auditoria de Estoque</p>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center justify-center text-center opacity-60">
             <Package className="w-12 h-12 text-gray-300 mb-4" />
             <h4 className="text-xl font-black text-gray-800 tracking-tighter uppercase italic">Curva ABC de Produtos</h4>
             <p className="text-sm font-medium text-gray-400 max-w-xs mt-2">Identifique os itens que mais geram receita e os que possuem maior giro.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center justify-center text-center opacity-60">
             <Activity className="w-12 h-12 text-gray-300 mb-4" />
             <h4 className="text-xl font-black text-gray-800 tracking-tighter uppercase italic">Ruptura de Estoque</h4>
             <p className="text-sm font-medium text-gray-400 max-w-xs mt-2">Visualize produtos que ficaram sem estoque no último período.</p>
          </div>
       </div>
    </div>
  );
}
