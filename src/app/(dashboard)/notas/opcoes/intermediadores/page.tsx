"use client";

import React from "react";
import { UserPlus, PlusCircle, Building2 } from "lucide-react";

export default function IntermediadoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Intermediadores de Transação</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Novo Intermediador
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-12 text-center text-gray-500">
         <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
         <h5 className="text-lg font-bold text-gray-700">Central de Intermediadores</h5>
         <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">Cadastre os CNPJs de marketplaces ou plataformas (ex: iFood, Mercado Livre) para identificação nas notas fiscais eletrônicas.</p>
      </div>
    </div>
  );
}
