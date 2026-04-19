"use client";
import React, { useState, useTransition } from "react";
import { getVendaBalancas, createVendaBalanca } from "@/actions/vendas";
import { Scale, PlusCircle, Check, X } from "lucide-react";

export default function VendasBalancasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getVendaBalancas();
      if (res.success) setItems(res.data);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const res = await createVendaBalanca(formData);
    if (res.success) { setIsAdding(false); const u = await getVendaBalancas(); if (u.success) setItems(u.data); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Balanças</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">
          <PlusCircle className="w-4 h-4" /> Adicionar Balança
        </button>
      </div>
      {isAdding && (
        <form action={handleAdd} className="bg-white p-5 rounded-md shadow-sm border border-gray-100 flex items-end gap-4 animate-in slide-in-from-top duration-200">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Identificação *</label>
            <input type="text" name="Nome" required placeholder="Ex: Balança Caixa 1" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="w-[160px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Modelo</label>
            <input type="text" name="Modelo" placeholder="Ex: Toledo Prix 3" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="w-[100px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Porta</label>
            <input type="text" name="Porta" placeholder="Ex: COM3" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"><Check className="w-3 h-3"/>Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded text-sm"><X className="w-3 h-3"/>Cancelar</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Identificação</th>
              <th className="py-3 px-6">Modelo</th>
              <th className="py-3 px-6">Porta</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (<tr><td colSpan={4} className="text-center py-16 text-gray-500"><Scale className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Nenhuma balança cadastrada.</p></td></tr>) :
              items.map(item => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 font-bold text-gray-900">{item.Nome}</td>
                  <td className="py-3 px-6 text-gray-600">{item.Modelo || "-"}</td>
                  <td className="py-3 px-6 font-mono text-gray-500">{item.Porta || "-"}</td>
                  <td className="py-3 px-6 text-center"><span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{item.Ativo ? "Ativa" : "Inativa"}</span></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
