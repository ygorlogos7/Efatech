"use client";

import React from "react";
import { Megaphone, Mail, Bell, Settings, Save, AlertCircle } from "lucide-react";

export default function AvisosEmailPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
            <Megaphone className="w-8 h-8 text-[#38b473]" /> Avisos Automáticos
          </h2>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Configuração de notificações por e-mail</p>
        </div>
        <button className="bg-[#1a1c23] hover:bg-black text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-black/20 text-sm active:scale-95 transition-all">
          SALVAR REGRAS
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
         <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 font-black text-gray-500 uppercase tracking-widest text-[10px]">Eventos do Sistema</div>
         <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#38b473]/20 transition-all cursor-pointer group">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                     <Mail className="w-5 h-5 text-gray-400 group-hover:text-[#38b473] transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">Cópia de Notas Fiscais para o Contador</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Envia automáticamente XML/PDF a cada nota autorizada</p>
                  </div>
               </div>
               <div className="w-12 h-6 bg-green-500 rounded-full relative p-1 shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#38b473]/20 transition-all cursor-pointer group opacity-50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                     <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">Alertas de Estoque Crítico</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dispara e-mail diário com resumo de produtos abaixo do mínimo</p>
                  </div>
               </div>
               <div className="w-12 h-6 bg-gray-300 rounded-full relative p-1 shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full transition-all shadow-sm" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
