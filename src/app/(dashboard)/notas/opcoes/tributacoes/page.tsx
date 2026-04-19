"use client";

import React, { useState, useTransition } from "react";
import { getTributacoes, createTributacao } from "@/actions/notas";
import { Banknote, PlusCircle, Check, X } from "lucide-react";

export default function TributacoesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getTributacoes();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const r = await createTributacao(formData);
    if (r.success) {
      setIsAdding(false);
      const u = await getTributacoes();
      if (u.success) setItems(u.data as any[]);
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Perfis de Tributação</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Novo Perfil
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-6 rounded-md shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-in slide-in-from-top duration-200">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Perfil *</label>
            <input type="text" name="Nome" required className="w-full border border-gray-300 rounded px-3 py-1.5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ICMS (%)</label>
            <input type="number" name="Icms" defaultValue="0" className="w-full border border-gray-300 rounded px-3 py-1.5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">IPI (%)</label>
            <input type="number" name="Ipi" defaultValue="0" className="w-full border border-gray-300 rounded px-3 py-1.5" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"><Check className="w-3 h-3"/>Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded font-sm"><X className="w-3 h-3"/>C</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-4 px-6">Nome / Descrição</th>
              <th className="py-4 px-4 text-center">ICMS</th>
              <th className="py-4 px-4 text-center">IPI</th>
              <th className="py-4 px-4 text-center">PIS/COFINS</th>
              <th className="py-4 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-gray-500 italic">Nenhum perfil de tributação configurado.</td></tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900">{item.Nome}</td>
                <td className="py-4 px-4 text-center text-gray-600">{item.Icms.toFixed(2)}%</td>
                <td className="py-4 px-4 text-center text-gray-600">{item.Ipi.toFixed(2)}%</td>
                <td className="py-4 px-4 text-center text-gray-600 text-[11px]">{(item.Pis + item.Cofins).toFixed(2)}% (Misto)</td>
                <td className="py-4 px-6 text-center">
                   <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">ATIVO</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
