"use client";

import React from "react";
import { DollarSign, PieChart, TrendingUp, TrendingDown, Calendar, Filter, Download } from "lucide-react";

export default function RelatoriosFinanceiroPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
              <PieChart className="w-8 h-8 text-[#38b473]" /> Saúde Financeira
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">DRE Gerencial e Fluxo de Caixa</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <TrendingUp className="w-20 h-20 text-green-500" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Receitas Acumuladas</p>
            <p className="text-3xl font-black text-green-600 tracking-tighter italic">R$ 0,00</p>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 w-fit px-2 py-0.5 rounded-full border border-green-100">
               +0% vs mês anterior
            </div>
         </div>

         <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <TrendingDown className="w-20 h-20 text-red-500" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Despesas Operacionais</p>
            <p className="text-3xl font-black text-red-600 tracking-tighter italic">R$ 0,00</p>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-gray-400 bg-gray-50 w-fit px-2 py-0.5 rounded-full border border-gray-100">
               Estável
            </div>
         </div>

         <div className="bg-[#1a1c23] p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <DollarSign className="w-20 h-20" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo em Caixa</p>
            <p className="text-3xl font-black tracking-tighter italic">R$ 0,00</p>
            <button className="mt-6 w-full bg-[#38b473] text-black font-black py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all">Ver Conciliação</button>
         </div>
      </div>
    </div>
  );
}
