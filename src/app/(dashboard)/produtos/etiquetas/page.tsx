"use client";

import React, { useState, useTransition } from "react";
import { getProdutoEtiquetas, createProdutoEtiqueta } from "@/actions/produtosAux";
import { Tag, PlusCircle, Box } from "lucide-react";

export default function ProdutoEtiquetasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load items on mount
  React.useEffect(() => {
    startTransition(async () => {
      const res = await getProdutoEtiquetas();
      if (res.success) setItems(res.data);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const res = await createProdutoEtiqueta(formData);
    if (res.success) {
      setIsAdding(false);
      const updated = await getProdutoEtiquetas();
      if (updated.success) setItems(updated.data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-dark font-bold text-3xl text-gray-900 mb-0">Etiquetas</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Adicionar Etiqueta
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-end gap-4 animate-in slide-in-from-top duration-200">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Etiqueta *</label>
            <input type="text" name="Nome" required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="w-[150px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Cód. Identificador</label>
            <input type="text" name="Codigo" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
              Salvar
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle border-collapse min-w-[600px]">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
              <tr>
                <th className="py-3 px-6">Identificação da Etiqueta</th>
                <th className="py-3 px-6">Código Interno</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-16 text-gray-500">
                    <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <h5 className="text-lg font-medium text-gray-700">Nenhuma etiqueta cadastrada.</h5>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 font-bold text-gray-900">{item.Nome}</td>
                    <td className="py-3 px-6 font-mono text-gray-500">{item.Codigo || "-"}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {item.Ativo ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
