"use client";

import React from "react";
import { Percent, PlusCircle, Check, X } from "lucide-react";

export default function TabelasRateioPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Tabelas de Rateios</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Nova Tabela
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100 p-12 text-center text-gray-500">
         <Percent className="w-12 h-12 mx-auto mb-3 opacity-30" />
         <h5 className="text-lg font-medium text-gray-700">Nenhuma tabela de rateio configurada.</h5>
         <p className="text-sm text-gray-400 mt-1">Configure divisões fixas de custos entre diferentes centros de custo.</p>
      </div>
    </div>
  );
}
