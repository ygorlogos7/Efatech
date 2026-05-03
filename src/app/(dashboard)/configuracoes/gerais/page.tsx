"use client";

import React from "react";
import { Settings, Globe, ShieldCheck, Save, Laptop, Sparkles, Clock, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";

export default function ConfigGeraisPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-5xl">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-[#38b473] p-3 rounded-2xl shadow-xl shadow-[#38b473]/30 shrink-0">
                <Settings className="w-6 h-6 text-white animate-[spin_5s_linear_infinite]" />
             </div>
             <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight italic leading-tight">Preferências do Sistema</h2>
                <p className="text-[10px] sm:text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Customize seu ambiente de trabalho</p>
             </div>
          </div>
          <button className="w-full sm:w-auto bg-[#1a1c23] hover:bg-black text-white font-black py-3 px-6 sm:px-10 rounded-2xl shadow-2xl shadow-black/20 text-sm active:scale-95 transition-all flex items-center justify-center gap-2 group">
             <Save className="w-4 h-4 text-gray-500 group-hover:text-[#38b473] transition-colors" />
             CONSERVAR AJUSTES
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
             <div className="bg-gray-50 dark:bg-slate-800/50 px-8 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Regionalização</span>
                <Globe className="w-4 h-4 text-gray-300 dark:text-slate-600" />
             </div>
             <div className="p-8 space-y-6">
                <div>
                   <label className="block text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase mb-2 ml-1">Fuso Horário Padrão</label>
                   <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#38b473] transition-colors pointer-events-none">
                        <Clock className="w-4 h-4" />
                     </div>
                     <select className="w-full bg-gray-50 dark:bg-slate-900 pl-11 pr-10 py-3 text-sm border-2 border-gray-50 dark:border-slate-800 rounded-xl focus:border-[#38b473] focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-gray-700 dark:text-slate-200 appearance-none cursor-pointer">
                        <option>Brasília (UTC-03:00)</option>
                        <option>Manaus (UTC-04:00)</option>
                        <option>Londres (UTC+00:00)</option>
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <ChevronDown className="w-4 h-4" />
                     </div>
                   </div>
                 </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase mb-2 ml-1">Unidade Monetária Principal</label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 px-4 py-3 rounded-xl border-2 border-gray-50 dark:border-slate-800">
                     <span className="font-black text-[#38b473]">R$</span>
                     <span className="text-sm font-bold text-gray-700 dark:text-slate-200 flex-1">Real Brasileiro (BRL)</span>
                     <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
             <div className="bg-gray-50 dark:bg-slate-800/50 px-8 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Experiência do Usuário</span>
                <Sparkles className="w-4 h-4 text-[#38b473] animate-pulse" />
             </div>
             <div className="p-8 space-y-6">
                <div 
                   onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                   className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border-2 border-transparent hover:border-[#38b473]/20 transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-3">
                      <Laptop className={`w-5 h-5 transition-colors ${theme === "dark" ? "text-[#38b473]" : "text-gray-400 dark:text-slate-500 group-hover:text-[#38b473]"}`} />
                      <span className="text-sm font-black text-gray-700 dark:text-slate-200">Interface Dark Mode</span>
                   </div>
                   <div className={`w-12 h-6 rounded-full relative p-1 shadow-inner transition-colors ${theme === "dark" ? "bg-[#38b473]" : "bg-gray-300"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`} />
                   </div>
                </div>
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                   <ShieldCheck className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                   <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-bold">
                      Suas preferências de interface são sincronizadas em todos os dispositivos logados na sua conta Efatech.
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
