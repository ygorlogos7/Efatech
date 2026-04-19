"use client";

import React from "react";
import { ArrowLeftRight, PlusCircle, Check, X } from "lucide-react";

export default function TransferenciasFinanceirasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Transferências</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Nova Transferência
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Origem</th>
              <th className="py-3 px-4 text-center">→</th>
              <th className="py-3 px-6">Destino</th>
              <th className="py-3 px-4 text-right">Valor</th>
              <th className="py-3 px-4 text-center">Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center py-16 text-gray-500">
                <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                <p>Nenhuma transferência registrada entre contas/caixas.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
