"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  DollarSign,
  Home,
  ChevronRight,
  Printer,
  Search,
  Check,
  X,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getRelatorioFinanceiro } from "@/actions/relatorios";

type ContaPagar = {
  Id: number;
  Descricao: string;
  Valor: unknown;
  Vencimento: Date | string;
  Pagamento?: Date | string | null;
};

type ContaReceber = {
  Id: number;
  Descricao: string;
  Valor: unknown;
  Vencimento: Date | string;
  Recebimento?: Date | string | null;
};

type Linha = {
  id: string;
  tipo: "Pagar" | "Receber";
  descricao: string;
  vencimento: string;
  valor: number;
  situacao: string;
};

type LinhaComSort = Linha & { _t: number };

export default function RelatoriosFinanceiroPage() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    dataInicio: "",
    dataFim: "",
    texto: "",
  });

  const pageSize = 20;

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (d: Date | string) => {
    if (!d) return "---";
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR");
  };

  const num = (v: unknown) => Number(v ?? 0);

  const load = () => {
    startTransition(async () => {
      const resp = await getRelatorioFinanceiro(filters);
      if (!resp.success || !resp.data) return;

      const cp = (resp.data.contasPagar || []) as ContaPagar[];
      const cr = (resp.data.contasReceber || []) as ContaReceber[];

      const merged: Linha[] = (
        [
          ...cp.map(
            (c): LinhaComSort => ({
              id: `p-${c.Id}`,
              tipo: "Pagar",
              descricao: c.Descricao,
              vencimento: formatDate(c.Vencimento),
              valor: num(c.Valor),
              situacao: c.Pagamento ? "Pago" : "Pendente",
              _t: new Date(c.Vencimento).getTime(),
            })
          ),
          ...cr.map(
            (c): LinhaComSort => ({
              id: `r-${c.Id}`,
              tipo: "Receber",
              descricao: c.Descricao,
              vencimento: formatDate(c.Vencimento),
              valor: num(c.Valor),
              situacao: c.Recebimento ? "Recebido" : "Pendente",
              _t: new Date(c.Vencimento).getTime(),
            })
          ),
        ] as LinhaComSort[]
      )
        .sort((a, b) => b._t - a._t)
        .map(({ _t, ...row }) => row);

      setLinhas(merged);
      setPage(1);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const kpis = useMemo(() => {
    const aPagarPendente = linhas
      .filter((l) => l.tipo === "Pagar" && l.situacao === "Pendente")
      .reduce((a, l) => a + l.valor, 0);
    const aReceberPendente = linhas
      .filter((l) => l.tipo === "Receber" && l.situacao === "Pendente")
      .reduce((a, l) => a + l.valor, 0);
    return { aPagarPendente, aReceberPendente };
  }, [linhas]);

  const filtered = useMemo(() => {
    return linhas.filter((l) => {
      if (
        filters.texto &&
        !l.descricao.toLowerCase().includes(filters.texto.toLowerCase())
      )
        return false;
      return true;
    });
  }, [linhas, filters.texto]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice(
    (pageSafe - 1) * pageSize,
    pageSafe * pageSize
  );

  const from = filtered.length === 0 ? 0 : (pageSafe - 1) * pageSize + 1;
  const to =
    filtered.length === 0 ? 0 : Math.min(pageSafe * pageSize, filtered.length);

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 mb-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h1 className="text-[20px] font-normal text-gray-800">
            Relatório Financeiro (Lançamentos recentes)
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Relatórios</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Financeiro</span>
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                if (filters.texto) params.set("texto", filters.texto);
                const q = params.toString();
                window.open(
                  `/relatorios/financeiro/print${q ? `?${q}` : ""}`,
                  "_blank"
                );
              }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 h-9 rounded text-[13px] font-medium transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório
            </button>
            <button
              type="button"
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 h-9 rounded text-[13px] font-medium transition-all"
            >
              <FileText className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
            className={`flex items-center gap-2 px-4 h-9 rounded text-[13px] font-medium shadow-sm transition-all ${isAdvancedSearchOpen ? "bg-[#333] text-white" : "bg-[#1b2a33] hover:bg-black text-white"}`}
          >
            <Search className="w-4 h-4" />
            Busca avançada
          </button>
        </div>

        {isAdvancedSearchOpen && (
          <div className="bg-white border border-gray-200 rounded p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por texto…"
                  value={filters.texto}
                  onChange={(e) =>
                    setFilters({ ...filters, texto: e.target.value })
                  }
                  className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                  Período (vencimento) — em desenvolvimento
                </label>
                <div className="flex items-center gap-2 opacity-60 pointer-events-none">
                  <input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) =>
                      setFilters({ ...filters, dataInicio: e.target.value })
                    }
                    className="w-full h-10 border border-gray-200 rounded px-3 text-[13px]"
                  />
                  <span className="text-gray-400">a</span>
                  <input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) =>
                      setFilters({ ...filters, dataFim: e.target.value })
                    }
                    className="w-full h-10 border border-gray-200 rounded px-3 text-[13px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-50 pt-6">
              <button
                type="button"
                onClick={() => setPage(1)}
                className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                Filtrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters({ dataInicio: "", dataFim: "", texto: "" });
                  setPage(1);
                }}
                className="flex items-center gap-2 bg-[#f35c4b] hover:bg-[#d94a3a] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                A pagar (pendente)
              </p>
              <p className="text-xl font-black text-gray-800">
                {formatCurrency(kpis.aPagarPendente)}
              </p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                A receber (pendente)
              </p>
              <p className="text-xl font-black text-gray-800">
                {formatCurrency(kpis.aReceberPendente)}
              </p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Saldo líquido (pendente)
              </p>
              <p className="text-xl font-black text-gray-800">
                {formatCurrency(
                  kpis.aReceberPendente - kpis.aPagarPendente
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[#f9f9f9] border-b border-gray-200">
              <tr className="text-gray-800 font-bold uppercase tracking-tight text-[11px]">
                <th className="px-4 py-3 border-r border-gray-200">Tipo</th>
                <th className="px-4 py-3 border-r border-gray-200">Descrição</th>
                <th className="px-4 py-3 border-r border-gray-200">Vencimento</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">
                  Situação
                </th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slice.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-400 italic"
                  >
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                slice.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                      {l.tipo === "Pagar" ? "Conta a pagar" : "Conta a receber"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {l.descricao}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {l.vencimento}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {l.situacao}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-black">
                      {formatCurrency(l.valor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
            <div className="text-xs sm:text-sm text-gray-600">
              Mostrando <span className="font-medium">{from}</span> a{" "}
              <span className="font-medium">{to}</span> de{" "}
              <span className="font-medium">{filtered.length}</span> lançamentos
            </div>

            <div className="flex items-center -space-x-px">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, pageSafe - 1))}
                disabled={pageSafe === 1}
                className="px-3 py-2 border border-gray-200 text-gray-500 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= pageSafe - 1 && p <= pageSafe + 1)
                ) {
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 border border-gray-200 text-sm font-medium transition-colors ${pageSafe === p ? "bg-[#0c1a25] text-white border-[#0c1a25] z-10" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === pageSafe - 2 || p === pageSafe + 2)
                  return (
                    <span
                      key={p}
                      className="px-3 py-2 border border-gray-200 bg-white text-gray-400"
                    >
                      ...
                    </span>
                  );
                return null;
              })}

              <button
                type="button"
                onClick={() =>
                  setPage(Math.min(totalPages, pageSafe + 1))
                }
                disabled={pageSafe === totalPages || filtered.length === 0}
                className="px-3 py-2 border border-gray-200 text-gray-500 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
