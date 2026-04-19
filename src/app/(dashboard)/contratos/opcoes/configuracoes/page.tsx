"use client";

import React from "react";
import { Settings, PlusCircle, Bell, ShieldCheck } from "lucide-react";

export default function ContratosConfigPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Configurações de Contratos</h2>
        <button className="bg-[#00a859] hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow-sm text-sm transition-colors">
          Salvar Alterações
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 font-bold text-gray-700">Automação de Faturamento</div>
        <div className="p-6 space-y-4">
           <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#38b473]" />
              <label className="text-sm text-gray-700">Gerar fatura automaticamente 5 dias antes do vencimento</label>
           </div>
           <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#38b473]" />
              <label className="text-sm text-gray-700">Enviar contrato para assinatura digital após criação</label>
           </div>
        </div>
      </div>
    </div>
  );
}
