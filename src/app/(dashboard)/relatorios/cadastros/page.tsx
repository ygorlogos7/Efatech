"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  List,
  Home,
  ChevronRight,
  Printer,
  Search,
  Check,
  X,
  FileText,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import { getRelatorioCadastros } from "@/actions/relatorios";
import { RelatorioFiltroMes } from "@/components/relatorios/RelatorioFiltroMes";
import {
  filtrosPeriodoPadrao,
  mesAnoParaIntervalo,
} from "@/lib/relatorioPeriodo";

const periodoInicial = filtrosPeriodoPadrao();

export default function RelatoriosCadastrosPage() {
  const [data, setData] = useState({
    clientes: 0,
    produtos: 0,
    fornecedores: 0,
    funcionarios: 0,
  });
  const [, startTransition] = useTransition();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    mesAno: periodoInicial.mesAno,
    dataInicio: periodoInicial.dataInicio,
    dataFim: periodoInicial.dataFim,
    observacao: "",
  });

  const load = (f = filters) => {
    startTransition(async () => {
      const resp = await getRelatorioCadastros(f);
      if (resp.success && resp.data) {
        setData({
          clientes: resp.data.clientes ?? 0,
          produtos: resp.data.produtos ?? 0,
          fornecedores: resp.data.fornecedores ?? 0,
          funcionarios: resp.data.funcionarios ?? 0,
        });
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

  const totalCadastros =
    data.clientes + data.produtos + data.fornecedores + data.funcionarios;
  const mediaPorTipo =
    totalCadastros > 0 ? Math.round(totalCadastros / 4) : 0;

  const rows = [
    { label: "Clientes ativos", value: data.clientes },
    { label: "Produtos ativos", value: data.produtos },
    { label: "Fornecedores ativos", value: data.fornecedores },
    { label: "Colaboradores ativos", value: data.funcionarios },
  ];

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 mb-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-gray-600" />
          <h1 className="text-[20px] font-normal text-gray-800">
            Relatório de Cadastros (Consolidado)
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Relatórios</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Cadastros</span>
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams({
                  mesAno: filters.mesAno,
                  dataInicio: filters.dataInicio,
                  dataFim: filters.dataFim,
                });
                if (filters.observacao) params.set("observacao", filters.observacao);
                const q = params.toString();
                window.open(
                  `/relatorios/cadastros/print${q ? `?${q}` : ""}`,
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
          hint="Totais de cadastros ativos (visão geral do sistema)."
        />

        {isAdvancedSearchOpen && (
          <div className="bg-white border border-gray-200 rounded p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                  Observação (uso futuro)
                </label>
                <input
                  type="text"
                  placeholder="Campo reservado para filtros adicionais…"
                  value={filters.observacao}
                  onChange={(e) =>
                    setFilters({ ...filters, observacao: e.target.value })
                  }
                  className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-50 pt-6">
              <button
                type="button"
                onClick={() => load()}
                className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                Atualizar
              </button>
              <button
                type="button"
                onClick={() => setFilters({ observacao: "" })}
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
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Clientes ativos
              </p>
              <p className="text-xl font-black text-gray-800">{data.clientes}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Produtos ativos
              </p>
              <p className="text-xl font-black text-gray-800">{data.produtos}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Total consolidado
              </p>
              <p className="text-xl font-black text-gray-800">
                {totalCadastros}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[#f9f9f9] border-b border-gray-200">
              <tr className="text-gray-800 font-bold uppercase tracking-tight text-[11px]">
                <th className="px-4 py-3 border-r border-gray-200">Indicador</th>
                <th className="px-4 py-3 text-right">Quantidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-600 font-medium">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-black">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
            <div className="text-xs sm:text-sm text-gray-600">
              Média aproximada por grupo de cadastro:{" "}
              <span className="font-medium">{mediaPorTipo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
