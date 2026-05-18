"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Box,
  Home,
  ChevronRight,
  Printer,
  Search,
  Check,
  X,
  FileText,
  Package,
  Layers,
  TrendingUp,
} from "lucide-react";
import { getRelatorioEstoque } from "@/actions/relatorios";
import { RelatorioFiltroMes } from "@/components/relatorios/RelatorioFiltroMes";
import {
  filtrosPeriodoPadrao,
  mesAnoParaIntervalo,
} from "@/lib/relatorioPeriodo";

const periodoInicial = filtrosPeriodoPadrao();

type ProdutoRow = {
  Id: number;
  Cod_Nome: string;
  Cod_Estoque: number;
  Cod_Preco: unknown;
};

export default function RelatoriosEstoquePage() {
  const [items, setItems] = useState<ProdutoRow[]>([]);
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    mesAno: periodoInicial.mesAno,
    dataInicio: periodoInicial.dataInicio,
    dataFim: periodoInicial.dataFim,
    nome: "",
  });

  const pageSize = 20;

  const load = (f = filters) => {
    startTransition(async () => {
      const resp = await getRelatorioEstoque(f);
      if (resp.success && Array.isArray(resp.data)) {
        setItems(resp.data as ProdutoRow[]);
        setPage(1);
      }
    });
  };

  useEffect(() => {
    load(filters);
  }, []);

  const handleMesAnoChange = (mesAno: string) => {
    const { dataInicio, dataFim } = mesAnoParaIntervalo(mesAno);
    const next = { ...filters, mesAno, dataInicio, dataFim };
    setFilters(next);
    load(next);
  };

  useEffect(() => {
    setPage(1);
  }, [filters.nome]);

  const filtered = items.filter((p) =>
    filters.nome
      ? p.Cod_Nome.toLowerCase().includes(filters.nome.toLowerCase())
      : true
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice(
    (pageSafe - 1) * pageSize,
    pageSafe * pageSize
  );

  const num = (v: unknown) => Number(v ?? 0);

  const somaEstoque = filtered.reduce((a, p) => a + (p.Cod_Estoque || 0), 0);
  const valorEstoque = filtered.reduce(
    (a, p) => a + num(p.Cod_Preco) * (p.Cod_Estoque || 0),
    0
  );

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const from = filtered.length === 0 ? 0 : (pageSafe - 1) * pageSize + 1;
  const to =
    filtered.length === 0 ? 0 : Math.min(pageSafe * pageSize, filtered.length);

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 mb-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-gray-600" />
          <h1 className="text-[20px] font-normal text-gray-800">
            Relatório de Estoque (Posição atual)
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Relatórios</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Estoque</span>
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                if (filters.nome) params.set("nome", filters.nome);
                const q = params.toString();
                window.open(
                  `/relatorios/estoque/print${q ? `?${q}` : ""}`,
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

        <RelatorioFiltroMes
          mesAno={filters.mesAno}
          onMesAnoChange={handleMesAnoChange}
          hint="Posição atual do estoque (todos os produtos ativos)."
        />

        {isAdvancedSearchOpen && (
          <div className="bg-white border border-gray-200 rounded p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                  Produto (nome)
                </label>
                <input
                  type="text"
                  placeholder="Filtrar na listagem…"
                  value={filters.nome}
                  onChange={(e) =>
                    setFilters({ ...filters, nome: e.target.value })
                  }
                  className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-50 pt-6">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                }}
                className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                Aplicar filtro
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters({ nome: "" });
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
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Itens na lista
              </p>
              <p className="text-xl font-black text-gray-800">
                {filtered.length}
              </p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Unidades em estoque
              </p>
              <p className="text-xl font-black text-gray-800">{somaEstoque}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Valor aprox. (preço × qtd.)
              </p>
              <p className="text-xl font-black text-gray-800">
                {formatCurrency(valorEstoque)}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[#f9f9f9] border-b border-gray-200">
              <tr className="text-gray-800 font-bold uppercase tracking-tight text-[11px]">
                <th className="px-4 py-3 border-r border-gray-200">Produto</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">
                  Estoque
                </th>
                <th className="px-4 py-3 border-r border-gray-200 text-right">
                  Preço unit.
                </th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slice.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-gray-400 italic"
                  >
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                slice.map((p) => (
                  <tr
                    key={p.Id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-600 font-medium">
                      {p.Cod_Nome}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {p.Cod_Estoque}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(num(p.Cod_Preco))}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-black">
                      {formatCurrency(
                        num(p.Cod_Preco) * (p.Cod_Estoque || 0)
                      )}
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
              <span className="font-medium">{filtered.length}</span> itens
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
