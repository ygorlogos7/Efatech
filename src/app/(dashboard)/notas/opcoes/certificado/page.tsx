"use client";

import React from "react";
import { Award, PlusCircle, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function CertificadoDigitalPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Certificado Digital (A1)</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Instalar Certificado
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start gap-4">
         <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <Award className="w-10 h-10" />
         </div>
         <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-800">Nenhum certificado instalado</h4>
            <p className="text-sm text-gray-500 mt-1">É necessário um certificado digital válido (Tipo A1 - arquivo .pfx ou .p12) para assinar e transmitir suas notas fiscais.</p>
            <div className="mt-4 flex gap-4">
               <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  EMISSÃO BLOQUEADA
               </div>
            </div>
         </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-md flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
         <div className="text-sm text-blue-700">
            <p className="font-bold">Dica Efatech:</p>
            <p>O sistema suporta apenas certificados do tipo A1. Certificados A3 (token/cartão) não funcionam em ambiente web.</p>
         </div>
      </div>
    </div>
  );
}
