"use client";

import React from "react";
import { Code, Upload, FileCode, CheckCircle } from "lucide-react";

export default function ImportarXmlPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Importar XML de Notas</h2>
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center hover:border-[#38b473] transition-colors group cursor-pointer">
         <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-50 transition-colors">
            <Upload className="w-10 h-10 text-gray-400 group-hover:text-[#38b473]" />
         </div>
         <h4 className="text-xl font-bold text-gray-700">Arraste seus arquivos XML aqui</h4>
         <p className="text-gray-400 mt-1">Ou clique para selecionar arquivos do seu computador</p>
         <div className="mt-8 flex gap-3">
            <button className="bg-[#1a1c23] text-white px-6 py-2.5 rounded font-bold text-sm shadow-md">Selecionar Arquivos</button>
         </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md flex items-start gap-3">
         <FileCode className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
         <div className="text-sm text-yellow-800">
            <p className="font-bold">Importação em Massa:</p>
            <p>Você pode importar múltiplos arquivos .xml de uma vez para processar entradas de estoque e lançamentos financeiros automaticamente.</p>
         </div>
      </div>
    </div>
  );
}
