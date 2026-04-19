"use client";

import React, { useState, useTransition } from "react";
import { getContasReceber, createContaReceber } from "@/actions/financeiro";
import { HandCoins, PlusCircle, Check, X, Calendar, DollarSign } from "lucide-react";

export default function ContasReceberPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getContasReceber();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  const handleAdd = (formData: FormData) => {
    startTransition(async () => {
      const r = await createContaReceber(formData);
      if (r.success) {
        setIsAdding(false);
        const u = await getContasReceber();
        if (u.success) setItems(u.data as any[]);
      } else {
        alert(r.error || "Erro ao salvar recebimento.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Contas a Receber</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Nova Conta
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-5 rounded-md shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in slide-in-from-top duration-200">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Descrição *</label>
            <input type="text" name="Descricao" required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-green-500 focus:ring-1 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Valor (R$) *</label>
            <input type="number" name="Valor" required step="0.01" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-green-500 focus:ring-1 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Vencimento *</label>
            <input type="date" name="Vencimento" required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-green-500 focus:ring-1 focus:ring-green-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"><Check className="w-3 h-3"/>Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded text-sm"><X className="w-3 h-3"/>Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Descrição</th>
              <th className="py-3 px-4 text-right">Valor</th>
              <th className="py-3 px-4 text-center">Vencimento</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Recebimento</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-500">
                  <HandCoins className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                  <p>Nenhuma conta a receber registrada.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-medium text-gray-900">{item.Descricao}</td>
                <td className="py-3 px-4 text-right font-bold text-green-600">R$ {item.Valor.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600">
                   <div className="flex items-center justify-center gap-1.5">
                     <Calendar className="w-3.5 h-3.5 text-gray-400" />
                     {new Date(item.Vencimento).toLocaleDateString("pt-BR")}
                   </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded border ${item.Recebimento ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                    {item.Recebimento ? "Recebido" : "Pendente"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-500">
                  {item.Recebimento ? new Date(item.Recebimento).toLocaleDateString("pt-BR") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
