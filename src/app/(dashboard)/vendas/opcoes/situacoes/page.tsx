"use client";
import React, { useState, useTransition } from "react";
import { getVendaSituacoes, createVendaSituacao } from "@/actions/vendas";
import { ClipboardList, PlusCircle } from "lucide-react";

export default function VendasSituacoesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getVendaSituacoes();
      if (res.success) setItems(res.data);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const res = await createVendaSituacao(formData);
    if (res.success) { setIsAdding(false); const u = await getVendaSituacoes(); if (u.success) setItems(u.data); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-md shadow-sm border border-gray-200 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Situações de Venda</h2>
          <p className="text-xs text-gray-500">Configure os estados das vendas no sistema</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-all active:scale-95">
          <PlusCircle className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-5 rounded-md shadow-sm border border-gray-100 flex flex-col sm:flex-row items-end gap-4 animate-in slide-in-from-top duration-200">
          <div className="w-full sm:flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome *</label>
            <input type="text" name="Nome" required placeholder="Ex: Finalizada" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="w-full sm:w-[120px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Cor Badge</label>
            <input type="color" name="Cor" defaultValue="#22c55e" className="w-full h-[34px] border border-gray-300 rounded px-1 py-0.5 cursor-pointer" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button type="submit" className="flex-1 sm:flex-none bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded text-sm shadow-sm transition-colors">Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded text-sm shadow-sm transition-colors">Cancelar</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-md shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[500px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr><th className="py-3 px-6">Nome</th><th className="py-3 px-6 text-center">Badge</th><th className="py-3 px-6 text-center">Status</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (<tr><td colSpan={3} className="text-center py-16 text-gray-500"><ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Nenhuma situação cadastrada.</p></td></tr>) :
              items.map(item => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 font-bold text-gray-900">{item.Nome}</td>
                  <td className="py-3 px-6 text-center">{item.Cor ? <span className="inline-block px-3 py-1 text-xs font-bold rounded text-white" style={{ backgroundColor: item.Cor }}>{item.Nome}</span> : "-"}</td>
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
