"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { getNotas } from "@/actions/notas";
import { ShoppingCart, Search, Filter, PlusCircle, ExternalLink, FileText, CheckCircle2, Clock } from "lucide-react";

export default function NotasProdutosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getNotas("produto");
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Notas de Produtos (NFe)</h2>
        <Link href="/notas/produtos/create" className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors decoration-transparent">
          <PlusCircle className="w-4 h-4" /> Emitir Nova NFe
        </Link>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por número, chave ou cliente..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[900px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Número/Série</th>
              <th className="py-3 px-6">Destinatário</th>
              <th className="py-3 px-4 text-right">Valor Total</th>
              <th className="py-3 px-4 text-center">Emissão</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(isPending || items.length === 0) ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-gray-500">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 opacity-20 text-gray-400"/>
                  </div>
                  <h5 className="text-lg font-bold text-gray-700">{isPending ? "Carregando notas..." : "Nenhuma NFe autorizada."}</h5>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">Emita notas fiscais eletrônicas de produtos diretamente pelo sistema.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6">
                   <div className="font-bold text-gray-900">{item.Numero || "---"}</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Série {item.Serie || 1}</div>
                </td>
                <td className="py-3 px-6 font-medium text-gray-700">{item.Destinatario || "Não informado"}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">R$ {item.ValorTotal.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600 font-mono text-xs">{new Date(item.DataEmissao).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                   <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border ${item.Status === "autorizada" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                      {item.Status === "autorizada" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {item.Status.toUpperCase()}
                   </span>
                </td>
                <td className="py-3 px-4 text-center">
                   <button className="p-1.5 text-gray-400 hover:text-[#38b473] transition-colors"><FileText className="w-4 h-4" /></button>
                   <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><ExternalLink className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
