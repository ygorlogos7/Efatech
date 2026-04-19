"use client";

import React, { useState, useTransition } from "react";
import { getBoletos } from "@/actions/financeiro";
import { Barcode, Search, Filter, Download, Upload } from "lucide-react";

export default function BoletosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getBoletos();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Gestão de Boletos</h2>
        <div className="flex gap-2">
           <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md shadow-sm border border-gray-200 transition-colors">
            <Upload className="w-4 h-4" /> Exportar Remessa
          </button>
          <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md shadow-sm border border-gray-200 transition-colors">
            <Download className="w-4 h-4" /> Importar Retorno
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por número ou sacado..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Número</th>
              <th className="py-3 px-6">Sacado (Cliente)</th>
              <th className="py-3 px-4 text-right">Valor</th>
              <th className="py-3 px-4 text-center">Vencimento</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-500">
                  <Barcode className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                  <p>Nenhum boleto gerado.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold">{item.Numero}</td>
                <td className="py-3 px-6">Cliente Exemplo</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">R$ {item.Valor.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600">{new Date(item.Vencimento).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded border ${item.Status === "pago" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                    {item.Status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
