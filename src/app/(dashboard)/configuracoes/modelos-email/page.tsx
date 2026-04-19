"use client";

import React from "react";
import { Mail, PlusCircle, Layout, Code, FileText, Send } from "lucide-react";

export default function ModelosEmailGeraisPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
            <Mail className="w-8 h-8 text-[#38b473]" /> Modelos de E-mail
          </h2>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Configuração de mensageria integrada</p>
        </div>
        <button className="bg-[#1a1c23] hover:bg-black text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-black/20 text-sm transition-all flex items-center gap-2">
           <PlusCircle className="w-4 h-4" /> NOVO MODELO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group hover:border-[#38b473] transition-all cursor-pointer">
           <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100 group-hover:bg-[#38b473]/5 transition-colors">
              <Code className="w-12 h-12 text-gray-300 group-hover:text-[#38b473] transition-all" />
           </div>
           <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                 <h4 className="font-black text-gray-800 tracking-tighter uppercase italic">Boas Vindas Clientes</h4>
                 <Send className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-relaxed">Disparado após primeiro cadastro no CRM.</p>
           </div>
        </div>

        <div className="border-4 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center text-gray-300 hover:border-[#38b473]/20 hover:text-[#38b473] transition-all cursor-pointer group">
           <Layout className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
           <p className="text-xs font-black uppercase tracking-widest">Criar Template Personalizado</p>
        </div>
      </div>
    </div>
  );
}
