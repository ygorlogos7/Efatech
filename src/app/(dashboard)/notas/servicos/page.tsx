"use client";

import React, { useState, useTransition } from "react";
import { getNotas } from "@/actions/notas";
import { FileText, Search, Filter, PlusCircle, CheckCircle2, Clock } from "lucide-react";

export default function NotasServicosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getNotas("servico");
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Notas de Serviços (NFSe)</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Emitir Nova NFSe
        </button>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por número ou tomador..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Número</th>
              <th className="py-3 px-6">Tomador do Serviço</th>
              <th className="py-3 px-4 text-right">Valor Líquido</th>
              <th className="py-3 px-4 text-center">Emissão</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 text-gray-500">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 opacity-20 text-gray-400"/>
                  </div>
                  <h5 className="text-lg font-bold text-gray-700">Nenhuma NFSe emitida.</h5>
                  <p className="text-sm text-gray-400">Emita notas fiscais de serviço para as Prefeituras integradas.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold">{item.Numero || "---"}</td>
                <td className="py-3 px-6 font-medium text-gray-700">{item.Destinatario || "Não informado"}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">R$ {item.ValorTotal.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600">{new Date(item.DataEmissao).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                   <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border ${item.Status === "autorizada" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
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
