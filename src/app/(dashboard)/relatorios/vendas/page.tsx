"use client";

import React, { useState, useTransition } from "react";
import { getResumoGeral } from "@/actions/relatorios";
import { BarChart2, TrendingUp, Users, ShoppingBasket, Box, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";

export default function RelatoriosVendasPage() {
  const [resumo, setResumo] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getResumoGeral();
      if (r.success) setResumo(r.data);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
         <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
              <TrendingUp className="w-8 h-8 text-[#38b473]" /> Análise de Vendas
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Desempenho Comercial do Período Atual</p>
         </div>
         <button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black py-2.5 px-6 rounded-2xl border border-gray-200 text-xs transition-all active:scale-95 group">
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            ATUALIZAR DADOS
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:translate-y-[-5px] transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors">
                  <ShoppingBasket className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
               </div>
               <span className="flex items-center gap-1 text-green-500 text-xs font-black bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <ArrowUpRight className="w-3 h-3" /> 12%
               </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 font-mono">Volume de Pedidos</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter italic">{resumo?.totalVendas || 0}</p>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:translate-y-[-5px] transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-[#38b473] transition-colors">
                  <DollarSign className="w-6 h-6 text-[#38b473] group-hover:text-white transition-colors" />
               </div>
               <span className="flex items-center gap-1 text-red-500 text-xs font-black bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  <ArrowDownRight className="w-3 h-3" /> 4%
               </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 font-mono">Faturamento Total</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter italic">R$ {resumo?.totalFinanceiro?.toFixed(2).replace(".", ",") || "0,00"}</p>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:translate-y-[-5px] transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors">
                  <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
               </div>
               <span className="text-xs font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Média</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 font-mono">Ticket Médio</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter italic">R$ 0,00</p>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:translate-y-[-5px] transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-600 transition-colors">
                  <BarChart2 className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
               </div>
               <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Meta</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 font-mono">Conversão Geral</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter italic">0.0%</p>
         </div>
      </div>

      <div className="bg-[#1a1c23] rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute right-[-50px] bottom-[-50px] w-80 h-80 bg-[#38b473]/10 rounded-full blur-[100px] group-hover:bg-[#38b473]/20 transition-all duration-700" />
         <h4 className="text-2xl font-black italic tracking-tighter mb-4 uppercase">Visão Detalhada</h4>
         <p className="max-w-md text-gray-400 font-medium">Os gráficos comparativos e relatórios de curva ABC estarão disponíveis nesta central analítica assim que as vendas forem processadas através do PDV ou módulo ERP.</p>
         <div className="mt-8 flex gap-4">
            <button className="bg-[#38b473] text-black font-black px-8 py-3 rounded-2xl shadow-xl shadow-green-500/20 active:scale-95 transition-all text-sm uppercase">Exportar PDF</button>
            <button className="bg-white/10 text-white font-black px-8 py-3 rounded-2xl border border-white/10 hover:bg-white/20 transition-all text-sm uppercase">Planilha CSV</button>
         </div>
      </div>
    </div>
  );
}
