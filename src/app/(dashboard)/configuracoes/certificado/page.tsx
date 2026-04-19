"use client";

import React from "react";
import { Award, ShieldCheck, PlusCircle, AlertCircle } from "lucide-react";

export default function CertificadoDigitalConfigPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 font-black">
        <h2 className="text-3xl text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
          <Award className="w-8 h-8 text-[#38b473]" /> Certificado Digital
        </h2>
        <button className="bg-[#1a1c23] hover:bg-black text-white py-3 px-8 rounded-2xl shadow-xl shadow-black/20 text-sm transition-all flex items-center gap-2">
           <PlusCircle className="w-4 h-4" /> INSTALAR CERTIFICADO
        </button>
      </div>

      <div className="bg-indigo-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute right-[-40px] top-[-40px] opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Award className="w-64 h-64" />
         </div>
         <div className="relative">
            <h4 className="text-2xl font-black italic tracking-tighter mb-4">SEGURANÇA FISCAL</h4>
            <p className="max-w-md text-indigo-200 font-bold leading-relaxed">Nenhum certificado A1 foi detectado. Para emitir NFe ou NFSe, você deve realizar o upload do arquivo .pfx e informar a senha de instalação.</p>
            <div className="mt-8">
               <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-red-400/50 shadow-lg shadow-red-500/20">EMISSÃO BLOQUEADA</span>
            </div>
         </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-3xl flex items-start gap-4">
         <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-1" />
         <div className="text-sm text-yellow-900 font-bold leading-relaxed">
            <p className="font-black text-lg mb-1 italic">Atenção!</p>
            <p>O Efatech ERP utiliza criptografia de ponta a ponta para armazenar sua senha do certificado. Seus dados fiscais estão protegidos em ambiente seguro.</p>
         </div>
      </div>
    </div>
  );
}
