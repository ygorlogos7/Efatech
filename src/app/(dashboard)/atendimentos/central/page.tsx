"use client";

import React, { useState, useTransition } from "react";
import { getAtendimentos, createAtendimento } from "@/actions/atendimentos";
import { Headset, PlusCircle, Search, Filter, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function CentralAtendimentosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getAtendimentos();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  const handleAdd = (formData: FormData) => {
    startTransition(async () => {
      const r = await createAtendimento(formData);
      if (r.success) {
        setIsAdding(false);
        const u = await getAtendimentos();
        if (u.success) setItems(u.data as any[]);
      } else {
        alert(r.error || "Erro ao criar chamado.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900 font-black tracking-tight italic uppercase">Central de Atendimentos</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 bg-[#1a1c23] hover:bg-black text-white text-sm font-black px-6 py-3 rounded-2xl shadow-xl shadow-black/20 transition-all uppercase tracking-tight">
          <PlusCircle className="w-4 h-4 text-[#38b473]" /> Novo Chamado
        </button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end animate-in slide-in-from-top duration-300">
           <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Assunto do Chamado *</label>
              <input type="text" name="Assunto" required className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#38b473] transition-all font-bold" placeholder="Ex: Erro na impressão de boleto" />
           </div>
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Prioridade</label>
              <select name="Prioridade" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#38b473] transition-all font-bold">
                 <option value="baixa">Baixa</option>
                 <option value="media">Média</option>
                 <option value="alta">Alta</option>
                 <option value="urgente">Urgente</option>
              </select>
           </div>
           <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Descrição do Problema</label>
              <textarea name="Descricao" rows={2} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#38b473] transition-all font-bold"></textarea>
           </div>
           <div className="flex gap-2">
              <button type="submit" disabled={isPending} className="bg-[#1a1c23] text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1 hover:bg-black transition-all">
                 <CheckCircle2 className="w-4 h-4 text-[#38b473]" /> {isPending ? "Criando..." : "Abrir Ticket"}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-500 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                 Cancelar
              </button>
           </div>
        </form>
      )}

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por chamado ou cliente..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-[#38b473] focus:ring-1" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[900px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">ID / Assunto</th>
              <th className="py-3 px-6">Cliente</th>
              <th className="py-3 px-4 text-center">Prioridade</th>
              <th className="py-3 px-4 text-center">Data/Hora</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-gray-500">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headset className="w-8 h-8 opacity-20 text-gray-400"/>
                  </div>
                  <h5 className="text-lg font-bold text-gray-700">Central de Tickets Vazia</h5>
                  <p className="text-sm text-gray-400">Todos os atendimentos foram concluídos ou não há registros.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6">
                   <div className="font-bold text-gray-900">{item.Assunto}</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Ticket #{item.Id}</div>
                </td>
                <td className="py-3 px-6 font-medium text-gray-700">Cliente Exemplo</td>
                <td className="py-3 px-4 text-center">
                   <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded border ${item.Prioridade === "alta" ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                      {item.Prioridade.toUpperCase()}
                   </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-600">{new Date(item.DataAbertura).toLocaleString("pt-BR")}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-600">ABERTO</td>
                <td className="py-3 px-4 text-center">
                   <button className="p-1.5 text-[#38b473] hover:bg-green-50 rounded"><MessageSquare className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
