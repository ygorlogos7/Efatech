"use client";

import React from "react";
import { Settings, ShieldCheck, Globe, PackageOpen } from "lucide-react";

export default function NotasConfigPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Configurações Gerais de Notas</h2>
        <button className="bg-[#00a859] hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow-sm text-sm transition-colors">
          Salvar Configuração
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
             <ShieldCheck className="w-4 h-4" /> Ambiente da SEFAZ
          </div>
          <div className="p-6">
             <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="radio" name="ambiente" value="homologacao" defaultChecked className="w-4 h-4 text-[#38b473]" />
                   <span className="text-sm font-medium">Homologação (Testes)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="radio" name="ambiente" value="producao" className="w-4 h-4 text-red-500" />
                   <span className="text-sm font-medium">Produção (Valor Fiscal)</span>
                </label>
             </div>
             <p className="text-[10px] text-gray-400 mt-3 uppercase font-bold tracking-widest">Atenção: Notas em produção possuem valor jurídico real.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
             <PackageOpen className="w-4 h-4" /> Sequenciamento de Notas
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Série Padrão (NFe/NFCe)</label>
                <input type="number" defaultValue="1" className="w-full text-sm border border-gray-300 rounded px-3 py-2" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Próximo Número NFe</label>
                <input type="number" defaultValue="1" className="w-full text-sm border border-gray-300 rounded px-3 py-2" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
