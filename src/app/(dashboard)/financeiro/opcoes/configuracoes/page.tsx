"use client";

import React from "react";
import { Settings, Percent, Bell, ShieldCheck, Mail } from "lucide-react";

export default function FinanceiroConfigPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Configurações Financeiras</h2>
        <button className="bg-[#00a859] hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow-sm text-sm transition-colors">
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-600" />
            <h3 className="font-bold text-gray-700">Multas e Juros</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1">Multa por Atraso (%)</label>
               <input type="number" defaultValue="2.00" step="0.01" className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1">Juros Mensal (%)</label>
               <input type="number" defaultValue="1.00" step="0.01" className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
             </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-600" />
            <h3 className="font-bold text-gray-700">Cobrança e Protesto</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1">Dias para Protesto Automático</label>
               <input type="number" defaultValue="5" className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1">Instruções de Cobrança (Padrão)</label>
               <textarea rows={3} className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" placeholder="Ex: Não receber após o vencimento sem juros."></textarea>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-600" />
            <h3 className="font-bold text-gray-700">Notificações</h3>
          </div>
          <div className="p-6">
             <div className="flex items-center gap-3">
               <input type="checkbox" id="notify-late" defaultChecked className="w-4 h-4 text-[#38b473] focus:ring-[#38b473]" />
               <label htmlFor="notify-late" className="text-sm text-gray-700">Enviar e-mail automático para clientes com contas vencidas</label>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
