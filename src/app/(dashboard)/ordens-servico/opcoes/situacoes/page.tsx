"use client";

import React, { useState, useTransition } from "react";
import { getOSSituacoes, createOSSituacao } from "@/actions/ordensServico";
import { ClipboardList, PlusCircle } from "lucide-react";

export default function OSSituacoesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getOSSituacoes();
      if (res.success) setItems(res.data);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const res = await createOSSituacao(formData);
    if (res.success) {
      setIsAdding(false);
      const updated = await getOSSituacoes();
      if (updated.success) setItems(updated.data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Situações de O.S.</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">
          <PlusCircle className="w-4 h-4" /> Adicionar Situação
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-end gap-4 animate-in slide-in-from-top duration-200">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Situação *</label>
            <input type="text" name="Nome" required placeholder="Ex: Em andamento" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="w-[120px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Cor Badge</label>
            <input type="color" name="Cor" defaultValue="#3b82f6" className="w-full h-[34px] border border-gray-300 rounded px-1 py-0.5 cursor-pointer" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm">Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded shadow-sm text-sm">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[500px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Nome</th>
              <th className="py-3 px-6 text-center">Badge</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-16 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <h5 className="text-lg font-medium text-gray-700">Nenhuma situação cadastrada.</h5>
              </td></tr>
            ) : items.map((item) => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold text-gray-900">{item.Nome}</td>
                <td className="py-3 px-6 text-center">
                  {item.Cor ? <span className="inline-block px-3 py-1 text-xs font-bold rounded text-white" style={{ backgroundColor: item.Cor }}>{item.Nome}</span> : "-"}
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
