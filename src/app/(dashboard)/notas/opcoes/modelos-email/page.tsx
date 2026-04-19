"use client";

import React from "react";
import { Mail, PlusCircle, Layout } from "lucide-react";

export default function ModelosEmailNotasPage() {
  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Modelos de E-mail — Notas Fiscais</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Novo Modelo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:border-[#38b473] transition-all group">
          <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100">
            <Layout className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform" />
          </div>
          <div className="p-4">
            <h4 className="font-bold text-gray-800">Envio de NFe (PDF/XML)</h4>
            <p className="text-xs text-gray-500 mt-1">Enviado automaticamente após a recepção do protocolo da SEFAZ.</p>
          </div>
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-6 text-gray-400 hover:border-[#38b473] hover:text-[#38b473] cursor-pointer transition-colors">
          <PlusCircle className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Criar novo modelo fiscal</span>
        </div>
      </div>
    </div>
  );
}
