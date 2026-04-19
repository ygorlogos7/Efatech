"use client";

import React from "react";
import { LineChart, Search, Calendar, Landmark, Banknote, History } from "lucide-react";

export default function FluxoCaixaPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h2>
        <div className="flex gap-2">
           <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            <History className="w-4 h-4" /> Histórico
          </button>
          <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
            <Calendar className="w-4 h-4" /> Período
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Landmark className="w-6 h-6" /></div>
             <div>
               <p className="text-sm text-gray-500 font-medium italic">Saldo Bancário</p>
               <h3 className="text-2xl font-bold text-gray-900 tracking-tight">R$ 45.230,00</h3>
             </div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
             <span className="text-gray-500">Saldo amanhã (Previsto)</span>
             <span className="font-bold text-green-600">R$ 46.100,00</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Banknote className="w-6 h-6" /></div>
             <div>
               <p className="text-sm text-gray-500 font-medium italic">Caixa Físico</p>
               <h3 className="text-2xl font-bold text-gray-900 tracking-tight">R$ 1.250,50</h3>
             </div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
             <span className="text-gray-500">Sangrias hoje</span>
             <span className="font-bold text-red-500">R$ 120,00</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><LineChart className="w-6 h-6" /></div>
             <div>
               <p className="text-sm text-gray-500 font-medium italic">Total Geral</p>
               <h3 className="text-2xl font-bold text-gray-900 tracking-tight">R$ 46.480,50</h3>
             </div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
             <span className="text-gray-500">Variação Mensal</span>
             <span className="font-bold text-green-600">+12%</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-20 text-center">
         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
           <LineChart className="w-8 h-8" />
         </div>
         <h4 className="text-xl font-bold text-gray-700">Monitor de Fluxo</h4>
         <p className="text-gray-400 max-w-sm mt-1">Carregando dados consolidados dos últimos 30 dias. Os gráficos de tendência aparecerão aqui.</p>
      </div>
    </div>
  );
}
