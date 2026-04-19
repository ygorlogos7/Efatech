"use client";

import React from "react";
import { Store, PlusCircle, Building2, MapPin } from "lucide-react";

export default function EmpresasLojasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
            <Store className="w-8 h-8 text-[#38b473]" /> Empresas / Lojas
          </h2>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Gestão de Unidades e Filiais (Multiloja)</p>
        </div>
        <button className="bg-[#1a1c23] hover:bg-black text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-black/20 text-sm active:scale-95 transition-all flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> NOVA UNIDADE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[30px] border-2 border-gray-100 shadow-xl shadow-gray-200/50 hover:border-[#38b473] transition-all group">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#38b473]">
                  <Store className="w-6 h-6" />
               </div>
               <span className="bg-green-50 text-[#38b473] text-[9px] font-black px-2 py-0.5 rounded-full border border-green-100 group-hover:animate-bounce">MATRIZ</span>
            </div>
            <h4 className="text-lg font-black text-gray-900 italic tracking-tighter uppercase mb-2">Unidade Principal</h4>
            <div className="space-y-2 text-xs font-bold text-gray-400">
               <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Endereço Padrão do Sistema</p>
               <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> CNPJ Matriz</p>
            </div>
         </div>
      </div>
    </div>
  );
}
