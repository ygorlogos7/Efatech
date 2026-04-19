"use client";
import React, { useState, useTransition } from "react";
import { getVendaModelosEmail, createVendaModeloEmail } from "@/actions/vendas";
import { Mail, PlusCircle, Check, X } from "lucide-react";

export default function VendasModelosEmailPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getVendaModelosEmail();
      if (res.success) setItems(res.data);
    });
  }, []);

  const handleAdd = async (formData: FormData) => {
    const res = await createVendaModeloEmail(formData);
    if (res.success) { setIsAdding(false); const u = await getVendaModelosEmail(); if (u.success) setItems(u.data); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Modelos de E-mail — Vendas</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">
          <PlusCircle className="w-4 h-4" /> Adicionar
        </button>
      </div>
      {isAdding && (
        <form action={handleAdd} className="bg-white p-6 rounded-md shadow-sm border border-gray-100 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nome *</label>
              <input type="text" name="Nome" required placeholder="Ex: Confirmação de venda" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assunto *</label>
              <input type="text" name="Assunto" required placeholder="Ex: Sua compra foi confirmada!" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Corpo *</label>
            <textarea name="Corpo" rows={4} required className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]"></textarea>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded text-sm"><Check className="w-4 h-4"/>Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded text-sm"><X className="w-4 h-4"/>Cancelar</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr><th className="py-3 px-6">Nome</th><th className="py-3 px-6">Assunto</th><th className="py-3 px-6 text-center">Status</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (<tr><td colSpan={3} className="text-center py-16 text-gray-500"><Mail className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Nenhum modelo cadastrado.</p></td></tr>) :
              items.map(item => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 font-bold text-gray-900">{item.Nome}</td>
                  <td className="py-3 px-6 text-gray-600">{item.Assunto}</td>
                  <td className="py-3 px-6 text-center"><span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{item.Ativo ? "Ativo" : "Inativo"}</span></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
