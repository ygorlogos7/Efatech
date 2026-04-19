"use client";

import React, { useState, useTransition } from "react";
import { getPlanoContas, createPlanoConta } from "@/actions/financeiro";
import { TreePine, PlusCircle, Check, X } from "lucide-react";

export default function PlanoContasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getPlanoContas();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const r = await createPlanoConta(formData);
    if (r.success) {
      setIsAdding(false);
      const u = await getPlanoContas();
      if (u.success) setItems(u.data as any[]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Plano de Contas</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Nova Conta
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-5 rounded-md shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in slide-in-from-top duration-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Conta *</label>
            <input type="text" name="Nome" required placeholder="Ex: Despesas com Pessoal" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo *</label>
            <select name="Tipo" required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]">
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
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
              <th className="py-3 px-6">Nome</th>
              <th className="py-3 px-6 text-center">Tipo</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-gray-500">
                  <TreePine className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                  <p>Nenhum plano de conta cadastrado.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold text-gray-900">{item.Nome}</td>
                <td className="py-3 px-6 text-center">
                   <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded border ${item.Tipo === "receita" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                    {item.Tipo.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
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
