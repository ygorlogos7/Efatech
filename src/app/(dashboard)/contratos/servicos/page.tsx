"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { getContratos } from "@/actions/contratos";
import { FileSignature, Search, PlusCircle, Calendar, User, DollarSign } from "lucide-react";

export default function ContratosServicosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getContratos();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Contratos de Serviços</h2>
        <Link href="/contratos/servicos/create" className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors decoration-transparent italic">
          <PlusCircle className="w-4 h-4" /> Novo Contrato
        </Link>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por número ou cliente..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Nº Contrato</th>
              <th className="py-3 px-6">Cliente</th>
              <th className="py-3 px-4 text-right">Valor Mensal</th>
              <th className="py-3 px-4 text-center">Início</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 text-gray-400">
                   <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   <p className="text-lg font-bold">Nenhum contrato de serviço ativo.</p>
                   <p className="text-sm">Cadastre contratos recorrentes para automação financeira.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold">{item.Numero || "---"}</td>
                <td className="py-3 px-6 font-medium text-gray-700">Cliente Exemplo</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">R$ {item.ValorMensal.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600">{new Date(item.DataInicio).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                   <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-tighter">ATIVO</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
