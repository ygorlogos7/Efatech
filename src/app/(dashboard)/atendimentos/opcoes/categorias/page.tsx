"use client";

import React from "react";
import { List, PlusCircle } from "lucide-react";

export default function AtendimentoCategoriasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Categorias de Atendimento</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100 p-12 text-center text-gray-500">
         <List className="w-10 h-10 mx-auto mb-2 opacity-20" />
         <p>Nenhuma categoria cadastrada (ex: Suporte Técnico, Financeiro, Logística).</p>
      </div>
    </div>
  );
}
