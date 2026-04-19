"use client";

import React from "react";
import { Image as ImageIcon, Upload, Palette, Eye, Save } from "lucide-react";

export default function MarcaEmpresaPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Palette className="w-8 h-8 text-[#38b473]" />
            Marca da Empresa
          </h2>
          <p className="text-sm text-gray-500 mt-1">Personalize a identidade visual do seu ERP e documentos.</p>
        </div>
        <button className="bg-[#1a1c23] text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-black/10 text-sm active:scale-95 transition-all">
          PUBLICAR MARCA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center group cursor-pointer hover:border-[#38b473]/50 transition-all border-dashed border-4">
           <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-50 transition-colors border-2 border-gray-100">
              <Upload className="w-12 h-12 text-gray-300 group-hover:text-[#38b473]" />
           </div>
           <h4 className="text-xl font-black text-gray-800">Logotipo Principal</h4>
           <p className="text-sm text-gray-400 mt-2 max-w-[200px]">Formatos: PNG ou SVG transparente (máx. 2MB)</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6">
           <h4 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
              <Eye className="w-5 h-5 text-gray-400" /> Cores da Interface
           </h4>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-600">Cor Primária</span>
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-mono font-bold text-gray-400">#38b473</span>
                     <div className="w-10 h-10 bg-[#38b473] rounded-xl shadow-sm border-2 border-white" />
                  </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-600">Cor Secundária</span>
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-mono font-bold text-gray-400">#1a1c23</span>
                     <div className="w-10 h-10 bg-[#1a1c23] rounded-xl shadow-sm border-2 border-white" />
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
