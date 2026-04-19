"use client";

import React, { useState, useTransition } from "react";
import { getModelosEmail, createModeloEmail } from "@/actions/orcamentos";
import { Mail, PlusCircle, Check, X } from "lucide-react";

export default function ModelosEmailPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getModelosEmail();
      if (res.success) setItems(res.data);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const res = await createModeloEmail(formData);
    if (res.success) {
      setIsAdding(false);
      const updated = await getModelosEmail();
      if (updated.success) setItems(updated.data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Modelos de E-mail</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Adicionar Modelo
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-6 rounded-md shadow-sm border border-gray-100 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Modelo *</label>
              <input type="text" name="Nome" required placeholder="Ex: Orçamento padrão" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assunto do E-mail *</label>
              <input type="text" name="Assunto" required placeholder="Ex: Seu orçamento #{{numero}}" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Corpo do E-mail *</label>
            <textarea name="Corpo" rows={5} required placeholder="Prezado cliente, segue orçamento em anexo..." className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]"></textarea>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
              <Check className="w-4 h-4" /> Salvar
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Nome do Modelo</th>
              <th className="py-3 px-6">Assunto</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <h5 className="text-lg font-medium text-gray-700">Nenhum modelo de e-mail cadastrado.</h5>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 font-bold text-gray-900">{item.Nome}</td>
                  <td className="py-3 px-6 text-gray-600">{item.Assunto}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {item.Ativo ? "Ativo" : "Inativo"}
                    </span>
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
