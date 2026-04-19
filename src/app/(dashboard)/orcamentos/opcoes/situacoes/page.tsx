"use client";

import React, { useState, useTransition } from "react";
import { getOrcamentoSituacoes, createOrcamentoSituacao } from "@/actions/orcamentos";
import { ClipboardList, PlusCircle, Check, X } from "lucide-react";

export default function SituacoesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getOrcamentoSituacoes();
      if (res.success) setItems(res.data || []);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const res = await createOrcamentoSituacao(formData);
    if (res.success) {
      setIsAdding(false);
      const updated = await getOrcamentoSituacoes();
      if (updated.success) setItems(updated.data || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Situações de Orçamento</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Adicionar Situação
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-end gap-4 animate-in slide-in-from-top duration-200">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Situação *</label>
            <input type="text" name="Nome" required placeholder="Ex: Aguardando aprovação" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="w-[120px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Cor Badge</label>
            <input type="color" name="Cor" defaultValue="#f59e0b" className="w-full h-[34px] border border-gray-300 rounded px-1 py-0.5 cursor-pointer" />
          </div>
          <div className="w-[150px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Tranformar em Venda?</label>
            <select name="TransformarEmVenda" defaultValue="false" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5">
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div className="w-[150px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Exibir na Listagem?</label>
            <select name="ExibirNaListagem" defaultValue="true" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5">
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[500px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Nome</th>
              <th className="py-3 px-6 text-center">Cor</th>
              <th className="py-3 px-6 text-center">Transformar em venda</th>
              <th className="py-3 px-6 text-center">Exibir na listagem</th>
              <th className="py-3 px-6 text-center w-[120px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <h5 className="text-lg font-medium text-gray-700">Nenhuma situação cadastrada.</h5>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-gray-700">{item.Nome}</td>
                  <td className="py-3 px-6 text-center">
                    {item.Cor ? (
                      <div className="flex justify-center">
                        <span className="inline-block px-3 py-0.5 text-[10px] font-black uppercase rounded text-white shadow-sm" style={{ backgroundColor: item.Cor }}>
                          {item.Nome}
                        </span>
                      </div>
                    ) : "-"}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-center text-center">
                      {item.TransformarEmVenda ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-center text-center">
                      {item.ExibirNaListagem ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center gap-1.5">
                       <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {item.Ativo ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
