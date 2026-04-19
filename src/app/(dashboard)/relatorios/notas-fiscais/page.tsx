"use client";

import React from "react";
import { Receipt, FileText, CheckCircle2, AlertCircle, BarChart, Download, DollarSign } from "lucide-react";

export default function RelatoriosNotasFiscaisPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
              <Receipt className="w-8 h-8 text-[#38b473]" /> Balanço de Notas Fiscais
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Status de Transmissão e Impostos Computados</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-center gap-4 group">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#38b473] group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sucesso na Sefaz</p>
            </div>
            <div>
               <p className="text-4xl font-black text-gray-900 tracking-tighter italic">0</p>
               <p className="text-[10px] font-black text-gray-400 uppercase">Notas autorizadas no mês</p>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-center gap-4 group italic">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6" />
               </div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest not-italic">Rejeições</p>
            </div>
            <div>
               <p className="text-4xl font-black text-red-600 tracking-tighter italic">0</p>
               <p className="text-[10px] font-black text-gray-400 uppercase not-italic">Notas com erro ou pendência</p>
            </div>
         </div>

         <div className="bg-[#1a1c23] p-8 rounded-[40px] shadow-2xl text-white flex flex-col justify-between">
            <div>
               <p className="text-[10px] font-black text-[#38b473] uppercase tracking-[0.3em] mb-1">Previsão de Impostos</p>
               <p className="text-3xl font-black tracking-tighter italic">R$ 0,00</p>
            </div>
            <div className="mt-6 flex items-center gap-2">
               <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38b473] w-0" />
               </div>
               <span className="text-[10px] font-black text-gray-500">0%</span>
            </div>
            <button className="mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all">Consolidar Impostos (Simples Nacional)</button>
         </div>
      </div>
    </div>
  );
}
