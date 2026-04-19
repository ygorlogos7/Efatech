"use client";

import React from "react";
import { History, Search, Calendar, User } from "lucide-react";

export default function HistoricoAtendimentosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Histórico de Atendimentos</h2>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar no histórico..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md" />
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-md text-xs font-bold text-gray-600">FILTRAR DATA</div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100 p-20 text-center text-gray-400">
         <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
         <h5 className="text-lg font-bold text-gray-700">Arquivo de Atendimentos</h5>
         <p className="text-sm">Os chamados finalizados e arquivados serão exibidos aqui para consulta.</p>
      </div>
    </div>
  );
}
