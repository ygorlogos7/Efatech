"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  ShoppingBasket, 
  Search, 
  Plus, 
  Home, 
  ChevronRight, 
  Printer, 
  Check, 
  X,
  FileText,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { getRelatorioVendas } from "@/actions/relatorios";
import { RelatorioFiltroMes } from "@/components/relatorios/RelatorioFiltroMes";
import {
  filtrosPeriodoPadrao,
  mesAnoParaIntervalo,
} from "@/lib/relatorioPeriodo";

const periodoInicial = filtrosPeriodoPadrao();

export default function RelatoriosVendasPage() {
  const [vendas, setVendas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalFaturamento, setTotalFaturamento] = useState(0);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    mesAno: periodoInicial.mesAno,
    dataInicio: periodoInicial.dataInicio,
    dataFim: periodoInicial.dataFim,
    cliente: "",
  });

  const loadVendas = (p: number = 1, f = filters) => {
    startTransition(async () => {
      const resp = await getRelatorioVendas(f, p, 20);
      if (resp.success) {
        setVendas(resp.data || []);
        setTotal(resp.total || 0);
        setTotalFaturamento(resp.faturamentoTotal || 0);
        setPage(p);
      }
    });
  };

  useEffect(() => {
    loadVendas(1, filters);
  }, []);

  const handleMesAnoChange = (mesAno: string) => {
    const { dataInicio, dataFim } = mesAnoParaIntervalo(mesAno);
    const next = { ...filters, mesAno, dataInicio, dataFim };
    setFilters(next);
    loadVendas(1, next);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (date: string) => {
    if (!date) return "---";
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const totalPages = Math.ceil(total / 20);
  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = total === 0 ? 0 : Math.min(page * 20, total);

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 mb-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
            <ShoppingBasket className="w-5 h-5 text-gray-600" />
            <h1 className="text-[20px] font-normal text-gray-800">Relatório de Vendas (Consolidado Diário)</h1>
        </div>
        
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Relatórios</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Vendas</span>
        </div>
      </div>

      <div className="px-4">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const params = new URLSearchParams(filters);
                window.open(`/relatorios/vendas/print?${params.toString()}`, '_blank');
              }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 h-9 rounded text-[13px] font-medium transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório
            </button>
            <button 
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 h-9 rounded text-[13px] font-medium transition-all"
            >
              <FileText className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
          
          <button 
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
        />

        {/* Search Panel */}
        {isAdvancedSearchOpen && (
          <div className="bg-white border border-gray-200 rounded p-6 mb-6 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-1.5">
                   <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">Cliente (Filtro por Venda)</label>
                   <input 
                     type="text"
                     placeholder="Filtrar por cliente..."
                     value={filters.cliente}
                     onChange={(e) => setFilters({...filters, cliente: e.target.value})}
                     className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                   />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">Período personalizado (opcional)</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="date"
                        value={filters.dataInicio}
                        onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                        className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">a</span>
                      <input 
                        type="date"
                        value={filters.dataFim}
                        onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                        className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3 border-t border-gray-50 pt-6">
                <button 
                  onClick={() => loadVendas(1, filters)}
                  className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Filtrar
                </button>
                <button 
                  onClick={() => {
                    const p = filtrosPeriodoPadrao();
                    const next = { ...filters, ...p, cliente: "" };
                    setFilters(next);
                    loadVendas(1, next);
                  }}
                  className="flex items-center gap-2 bg-[#f35c4b] hover:bg-[#d94a3a] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </button>
             </div>
          </div>
        )}

        {/* Totals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Faturamento Período</p>
              <p className="text-xl font-black text-gray-800">{formatCurrency(totalFaturamento)}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Dias com Venda</p>
              <p className="text-xl font-black text-gray-800">{total}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Média Diária</p>
              <p className="text-xl font-black text-gray-800">{formatCurrency(total > 0 ? totalFaturamento / total : 0)}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-gray-200 rounded shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[#f9f9f9] border-b border-gray-200">
              <tr className="text-gray-800 font-bold uppercase tracking-tight text-[11px]">
                <th className="px-4 py-3 border-r border-gray-200">Data</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">Qtd. Vendas</th>
                <th className="px-4 py-3 text-right">Total do Dia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendas.length === 0 ? (
                <tr>
                   <td colSpan={3} className="text-center py-10 text-gray-400 italic">Nenhum registro encontrado para este período.</td>
                </tr>
              ) : (
                vendas.map((venda, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 font-medium">{formatDate(venda.data)}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{venda.qtd} vendas</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-black">{formatCurrency(venda.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
            <div className="text-xs sm:text-sm text-gray-600">
              Mostrando <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span> de <span className="font-medium">{total}</span> dias
            </div>

            <div className="flex items-center -space-x-px">
              <button
                onClick={() => loadVendas(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-200 text-gray-500 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <button
                      key={p}
                      onClick={() => loadVendas(p)}
                      className={`px-4 py-2 border border-gray-200 text-sm font-medium transition-colors ${page === p
                          ? "bg-[#0c1a25] text-white border-[#0c1a25] z-10"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === page - 2 || p === page + 2) return <span key={p} className="px-3 py-2 border border-gray-200 bg-white text-gray-400">...</span>;
                return null;
              })}

              <button
                onClick={() => loadVendas(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || total === 0}
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
