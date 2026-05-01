"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Monitor, 
  Search, 
  Plus, 
  Home, 
  ChevronRight, 
  Printer, 
  Power, 
  CheckCircle2,
  Check,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  ShoppingBasket,
  FileText,
  Package
} from "lucide-react";
import { getCaixaSessoes } from "@/actions/caixa";
import { getFuncionarios } from "@/actions/funcionarios";
import { CloseCashierModal } from "@/components/vendas/CloseCashierModal";

export default function CaixasPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [closeCaixaId, setCloseCaixaId] = useState<number | null>(null);
  
  // Estados para Busca Avançada
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    atendenteId: "",
    dataInicio: "",
    dataFim: "",
    situacao: "Todos"
  });

  const loadSessions = (currentFilters?: any) => {
    startTransition(async () => {
      const f = currentFilters || filters;
      const resp = await getCaixaSessoes({
        atendenteId: f.atendenteId ? Number(f.atendenteId) : undefined,
        dataInicio: f.dataInicio,
        dataFim: f.dataFim,
        situacao: f.situacao
      });
      if (resp.success) setSessions(resp.data || []);
    });
  };

  useEffect(() => {
    loadSessions();
    // Carregar funcionários para o select
    getFuncionarios().then(resp => {
      if (resp.success) setFuncionarios(resp.data);
    });
  }, []);

  const handleSearch = () => {
    loadSessions();
  };

  const handleClear = () => {
    const cleared = {
      atendenteId: "",
      dataInicio: "",
      dataFim: "",
      situacao: "Todos"
    };
    setFilters(cleared);
    loadSessions(cleared);
  };

  const formatDate = (date: any) => {
    if (!date) return "------";
    try {
      return new Date(date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return "------";
    }
  };

  const toggleDropdown = (id: number) => {
    if (activeDropdownId === id) {
      setActiveDropdownId(null);
    } else {
      setActiveDropdownId(id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header & Breadcrumbs Container */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 mb-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-gray-600" />
            <h1 className="text-[20px] font-normal text-gray-800">Caixas</h1>
        </div>
        
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-blue-500 cursor-pointer text-gray-500">Caixas</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Listar</span>
        </div>
      </div>

      <div className="px-4">
        {/* Top Buttons Bar */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.push("/financeiro/caixas/abrir")}
            className="flex items-center gap-2 bg-[#00a859] hover:bg-green-700 text-white px-4 h-9 rounded text-[13px] font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <ShoppingBasket className="w-4 h-4" />
            Abrir caixa
          </button>
          
          <button 
            onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
            className={`flex items-center gap-2 px-4 h-9 rounded text-[13px] font-medium shadow-sm transition-all ${isAdvancedSearchOpen ? "bg-[#333] text-white" : "bg-[#1b2a33] hover:bg-black text-white"}`}
          >
            <Search className="w-4 h-4" />
            Busca avançada
          </button>
        </div>

        {/* Advanced Search Panel */}
        {isAdvancedSearchOpen && (
          <div className="bg-white border border-gray-200 rounded p-6 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Atendente */}
                <div className="space-y-1.5">
                   <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">Atendente</label>
                   <select 
                     value={filters.atendenteId}
                     onChange={(e) => setFilters({...filters, atendenteId: e.target.value})}
                     className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                   >
                      <option value="">Todos</option>
                      {funcionarios.map(f => (
                        <option key={f.Id} value={f.Id}>{f.Nome}</option>
                      ))}
                   </select>
                </div>

                {/* Período */}
                <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-1">
                   <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">Período</label>
                   <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                         <input 
                           type="date"
                           value={filters.dataInicio}
                           onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                           className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                         />
                      </div>
                      <span className="text-gray-400 text-[13px]">a</span>
                      <div className="relative flex-1">
                         <input 
                           type="date"
                           value={filters.dataFim}
                           onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                           className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                         />
                      </div>
                   </div>
                </div>

                {/* Situação */}
                <div className="space-y-1.5">
                   <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">Situação</label>
                   <select 
                     value={filters.situacao}
                     onChange={(e) => setFilters({...filters, situacao: e.target.value})}
                     className="w-full h-10 border border-gray-200 rounded px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                   >
                      <option value="Todos">Todos</option>
                      <option value="Aberto">Aberto</option>
                      <option value="Fechado">Fechado</option>
                   </select>
                </div>
             </div>

             <div className="flex items-center gap-3 border-t border-gray-50 pt-6">
                <button 
                  onClick={handleSearch}
                  className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Buscar
                </button>
                <button 
                  onClick={handleClear}
                  className="flex items-center gap-2 bg-[#f35c4b] hover:bg-[#d94a3a] text-white px-5 h-10 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </button>
             </div>
          </div>
        )}

        {/* Table Sections */}
        <div className="border border-gray-200 rounded overflow-visible shadow-sm bg-white">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[#f9f9f9] border-b border-gray-200">
              <tr className="text-gray-800 font-bold uppercase tracking-tight">
                <th className="px-4 py-3 font-bold">Funcionário</th>
                <th className="px-4 py-3 font-bold">Aberto em</th>
                <th className="px-4 py-3 font-bold">Fechado em</th>
                <th className="px-4 py-3 font-bold">Saldo</th>
                <th className="px-4 py-3 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                   <td colSpan={5} className="text-center py-10 text-gray-400 italic">Nenhum histórico encontrado.</td>
                </tr>
              ) : sessions.map((session) => (
                <tr key={session.Id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-gray-700">{session.FuncionarioNome}</td>
                  <td className="px-4 py-3.5 text-gray-700 font-medium">{formatDate(session.DataAbertura)}</td>
                  <td className="px-4 py-3.5 text-gray-500">{formatDate(session.DataFechamento)}</td>
                  <td className="px-4 py-3.5 text-gray-800 font-bold">{session.Saldo.toFixed(2).replace(".", ",")}</td>
                  <td className="px-4 py-3.5 relative overflow-visible">
                    <div className="flex items-center justify-center gap-1">
                      {/* Azul: Ver */}
                      <button 
                        onClick={() => router.push(`/financeiro/caixas/visualizar/${session.Id}`)}
                        className="w-7 h-7 flex items-center justify-center bg-[#00c0ef] hover:bg-blue-600 text-white rounded transition-colors shadow-sm"
                        title="Visualizar Detalhes"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Laranja: Imprimir Completo */}
                      <button 
                        onClick={() => window.open(`/financeiro/caixas/print/${session.Id}?type=completo`, "_blank")}
                        className="w-7 h-7 flex items-center justify-center bg-[#f39c12] hover:bg-orange-600 text-white rounded transition-colors shadow-sm"
                        title="Imprimir Relatório Completo"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Vermelho: Fechar/Derrubar */}
                      <button 
                        onClick={() => setCloseCaixaId(session.Id)}
                        title="Fechar Caixa"
                        className="w-7 h-7 flex items-center justify-center bg-[#dd4b39] hover:bg-red-700 text-white rounded transition-colors shadow-sm"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Verde: Dropdown para parciais */}
                      <div className="relative">
                        <button 
                          onClick={() => toggleDropdown(session.Id)}
                          className="w-7 h-7 flex items-center justify-center bg-[#00a65a] hover:bg-green-700 text-white rounded transition-colors shadow-sm"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdownId === session.Id ? "rotate-180" : ""}`} />
                        </button>

                        {/* Menu Dropdown */}
                        {activeDropdownId === session.Id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-xl z-[9999] py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                             <button 
                               onClick={() => {
                                 window.open(`/financeiro/caixas/print/${session.Id}?type=vendas`, "_blank");
                                 setActiveDropdownId(null);
                               }}
                               className="w-full flex items-center gap-3 px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 text-left border-b border-gray-50"
                             >
                               <Package className="w-4 h-4 text-green-600" />
                               Fechar Vendas Balcão
                             </button>
                             <button
                               onClick={() => {
                                 window.open(`/financeiro/caixas/print/${session.Id}?type=os`, "_blank");
                                 setActiveDropdownId(null);
                               }}
                               className="w-full flex items-center gap-3 px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 text-left border-b border-gray-50"
                             >
                               <FileText className="w-4 h-4 text-blue-600" />
                               Fechar Ordens Serviços
                             </button>
                             <button
                               onClick={() => {
                                 window.open(`/financeiro/caixas/print/${session.Id}?type=completo`, "_blank");
                                 setActiveDropdownId(null);
                               }}
                               className="w-full flex items-center gap-3 px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 text-left"
                             >
                               <CheckCircle2 className="w-4 h-4 text-orange-600" />
                               Resumo Completo (Geral)
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <CloseCashierModal
          isOpen={closeCaixaId !== null}
          onClose={() => setCloseCaixaId(null)}
          caixaId={closeCaixaId || 0}
          onSuccess={() => {
            loadSessions();
          }}
        />
      </div>
    </div>
  );
}
