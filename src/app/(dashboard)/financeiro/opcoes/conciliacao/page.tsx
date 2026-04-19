"use client";

import React from "react";
import { RefreshCw, Search, Calendar, FileCheck } from "lucide-react";

export default function ConciliacaoPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Conciliação Bancária</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Iniciar Conciliação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Aguardando Importação</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Em Aberto</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conciliados (Hoje)</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse-slow" />
        <h5 className="text-lg font-medium text-gray-700">Nenhum extrato importado para conciliação.</h5>
        <p className="text-sm text-gray-400 mt-1">Importe um arquivo OFX ou conecte seu banco para começar.</p>
      </div>
    </div>
  );
}
