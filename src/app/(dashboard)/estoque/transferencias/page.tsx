"use client";
import React, { useState, useTransition } from "react";
import { getTransferencias, createTransferencia } from "@/actions/estoque";
import { ArrowLeftRight, PlusCircle, Check, X } from "lucide-react";

export default function TransferenciasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => { startTransition(async () => { const r = await getTransferencias(); if (r.success) setItems(r.data as any[]); }); }, []);

  const handleAdd = async (formData: FormData) => {
    const r = await createTransferencia(formData);
    if (r.success) { setIsAdding(false); const u = await getTransferencias(); if (u.success) setItems(u.data as any[]); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Transferências</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">
          <PlusCircle className="w-4 h-4" /> Nova Transferência
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-5 rounded-md shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in slide-in-from-top duration-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Local Origem</label>
            <input type="text" name="LocalOrigem" placeholder="Ex: Depósito A" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Local Destino</label>
            <input type="text" name="LocalDestino" placeholder="Ex: Loja Principal" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Quantidade *</label>
            <input type="number" name="Quantidade" required min="0" step="0.01" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"><Check className="w-3 h-3"/>Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded text-sm"><X className="w-3 h-3"/>Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Origem</th>
              <th className="py-3 px-4 text-center">→</th>
              <th className="py-3 px-6">Destino</th>
              <th className="py-3 px-4 text-right">Qtd</th>
              <th className="py-3 px-4">Data</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-gray-500"><ArrowLeftRight className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Nenhuma transferência registrada.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-6 font-medium text-gray-900">{item.LocalOrigem || "-"}</td>
                <td className="py-3 px-4 text-center text-gray-400"><ArrowLeftRight className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-6 font-medium text-gray-900">{item.LocalDestino || "-"}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-700">{item.Quantidade}</td>
                <td className="py-3 px-4 text-gray-500">{new Date(item.DataTransferencia).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
