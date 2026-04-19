"use client";

import React from "react";
import { List, PlusCircle } from "lucide-react";

export default function SituacoesContratosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 text-3xl font-bold text-gray-900">
        <h2>Situações de Contratos</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Nova Situação
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-12 text-center text-gray-500">
         <List className="w-10 h-10 mx-auto mb-2 opacity-20" />
         <p>Gerencie os status dos seus contratos (ex: Ativo, Cancelado, Suspenso, Em Renovação).</p>
      </div>
    </div>
  );
}
