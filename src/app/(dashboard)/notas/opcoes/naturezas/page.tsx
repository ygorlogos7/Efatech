"use client";

import React, { useState, useTransition } from "react";
import { getNaturezas, createNatureza } from "@/actions/notas";
import { ArrowLeftRight, PlusCircle, Check, X } from "lucide-react";

export default function NaturezasOperacoesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getNaturezas();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const r = await createNatureza(formData);
    if (r.success) {
      setIsAdding(false);
      const u = await getNaturezas();
      if (u.success) setItems(u.data as any[]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Naturezas de Operações</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Nova Natureza
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-5 rounded-md shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in slide-in-from-top duration-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Descrição *</label>
            <input type="text" name="Nome" required placeholder="Ex: Venda de Mercadoria" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#38b473] focus:ring-1" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CFOP Padrão</label>
            <input type="text" name="Cfop" placeholder="Ex: 5.102" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#38b473] focus:ring-1" />
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
              <th className="py-3 px-6">Natureza</th>
              <th className="py-3 px-6 text-center">CFOP</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-gray-500 italic">Nenhuma natureza de operação cadastrada.</td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold">{item.Nome}</td>
                <td className="py-3 px-6 text-center font-mono text-blue-600">{item.Cfop || "---"}</td>
                <td className="py-3 px-6 text-center">
                   <span className={`px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {item.Ativo ? "Ativa" : "Inativa"}
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
