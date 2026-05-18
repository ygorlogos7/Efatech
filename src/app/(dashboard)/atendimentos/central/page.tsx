"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { getAtendimentos, createAtendimento } from "@/actions/atendimentos";
import {
  Headset,
  PlusCircle,
  Search,
  Home,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

export default function CentralAtendimentosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  useEffect(() => {
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const assunto = String(item.Assunto ?? "").toLowerCase();
      const id = String(item.Id ?? "");
      return assunto.includes(q) || id.includes(q);
    });
  }, [items, search]);

  const prioridadeClass = (p: string) => {
    const v = (p || "media").toLowerCase();
    if (v === "urgente" || v === "alta")
      return "bg-red-50 text-red-700 border-red-100";
    if (v === "media")
      return "bg-amber-50 text-amber-800 border-amber-100";
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 mb-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Headset className="w-5 h-5 text-gray-600" />
          <h1 className="text-[20px] font-normal text-gray-800">
            Central de atendimentos
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Link
            href="/home"
            className="hover:text-blue-500 flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Início</span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Atendimentos</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Central</span>
        </div>
      </div>

      <div className="px-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por assunto ou número do ticket…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center justify-center gap-2 px-4 h-9 rounded text-[13px] font-medium shadow-sm transition-all shrink-0 ${isAdding ? "bg-[#333] text-white" : "bg-[#1b2a33] hover:bg-black text-white"}`}
          >
            <PlusCircle className="w-4 h-4" />
            Novo chamado
          </button>
        </div>

        {isAdding ? (
          <form
            action={handleAdd}
            className="bg-white border border-gray-200 rounded p-6 mb-6 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                  Assunto do chamado *
                </label>
                <input
                  type="text"
                  name="Assunto"
                  required
                  className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex.: Erro na impressão de boleto"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                  Prioridade
                </label>
                <select
                  name="Prioridade"
                  className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                  Descrição do problema
                </label>
                <textarea
                  name="Descricao"
                  rows={3}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-50 pt-6">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isPending ? "Criando…" : "Abrir ticket"}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 h-10 rounded text-[13px] font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}

        <div className="border border-gray-200 rounded shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left text-[13px] border-collapse min-w-[800px]">
            <thead className="bg-[#f9f9f9] border-b border-gray-200">
              <tr className="text-gray-800 font-bold uppercase tracking-tight text-[11px]">
                <th className="px-4 py-3 border-r border-gray-200">
                  ID / Assunto
                </th>
                <th className="px-4 py-3 border-r border-gray-200">Cliente</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">
                  Prioridade
                </th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">
                  Data / hora
                </th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Headset className="w-10 h-10 text-gray-300" />
                      <span className="font-medium text-gray-600">
                        {items.length === 0
                          ? "Nenhum chamado aberto."
                          : "Nenhum resultado para a busca."}
                      </span>
                      <span className="text-[12px] text-gray-400">
                        Use &quot;Novo chamado&quot; para registrar um ticket.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.Id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 border-r border-gray-100">
                      <div className="font-medium text-gray-900">
                        {item.Assunto}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-tight">
                        Ticket #{item.Id}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
                      —
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded border ${prioridadeClass(item.Prioridade)}`}
                      >
                        {(item.Prioridade || "media").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-600 whitespace-nowrap">
                      {item.DataAbertura
                        ? new Date(item.DataAbertura).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center font-semibold text-blue-600">
                      ABERTO
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded inline-flex"
                        title="Detalhes (em breve)"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-gray-100 bg-white text-xs text-gray-500">
            {filtered.length === items.length
              ? `Total: ${items.length} chamado(s)`
              : `Exibindo ${filtered.length} de ${items.length} chamado(s)`}
          </div>
        </div>
      </div>
    </div>
  );
}
