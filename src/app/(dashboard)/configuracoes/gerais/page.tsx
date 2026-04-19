"use client";

import React from "react";
import { Settings, Globe, Clock, ShieldCheck, Save, Laptop, Sparkles } from "lucide-react";

export default function ConfigGeraisPage() {
  return (
    <div className="space-y-8 max-w-5xl">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-3">
            <div className="bg-[#38b473] p-3 rounded-2xl shadow-xl shadow-[#38b473]/30">
               <Settings className="w-6 h-6 text-white animate-[spin_5s_linear_infinite]" />
            </div>
            <div>
               <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Preferências do Sistema</h2>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Customize seu ambiente de trabalho</p>
            </div>
         </div>
         <button className="bg-[#1a1c23] hover:bg-black text-white font-black py-3 px-10 rounded-2xl shadow-2xl shadow-black/20 text-sm active:scale-95 transition-all flex items-center gap-2 group">
            <Save className="w-4 h-4 text-gray-500 group-hover:text-[#38b473] transition-colors" />
            CONSERVAR AJUSTES
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
             <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Regionalização</span>
                <Globe className="w-4 h-4 text-gray-300" />
             </div>
             <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">Fuso Horário Padrão</label>
                  <select className="w-full bg-gray-50 px-4 py-3 text-sm border-2 border-gray-50 rounded-xl focus:border-[#38b473] focus:bg-white transition-all font-bold text-gray-700">
                     <option>America/Sao_Paulo (UTC-03:00)</option>
                     <option>UTC (Greenwich Mean Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">Unidade Monetária Principal</label>
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border-2 border-gray-50">
                     <span className="font-black text-[#38b473]">R$</span>
                     <span className="text-sm font-bold text-gray-700 flex-1">Real Brasileiro (BRL)</span>
                     <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
             <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Experiência do Usuário</span>
                <Sparkles className="w-4 h-4 text-[#38b473] animate-pulse" />
             </div>
             <div className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#38b473]/20 transition-all cursor-pointer group">
                   <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-gray-400 group-hover:text-[#38b473] transition-colors" />
                      <span className="text-sm font-black text-gray-700">Interface Dark Mode</span>
                   </div>
                   <div className="w-12 h-6 bg-gray-300 rounded-full relative p-1 shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full transition-all" />
                   </div>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                   <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                   <div className="text-xs text-blue-700 leading-relaxed font-bold">
                      Suas preferências de interface são sincronizadas em todos os dispositivos logados na sua conta Efatech.
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
