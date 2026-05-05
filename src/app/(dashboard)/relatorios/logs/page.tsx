"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getLogs } from "@/actions/relatorios";
import { 
  Home, 
  ChevronRight, 
  Terminal,
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown
} from "lucide-react";

const MODULOS_DISPONIVEIS = [
  "TODOS",
  "VENDAS",
  "O.S.",
  "PRODUTOS",
  "CLIENTES",
  "ESTOQUE",
  "FINANCEIRO",
  "CAIXA",
  "USUARIOS",
  "CONFIGURACOES",
  "EMPRESA"
];

export default function LogsSistemaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    usuario: "",
    modulo: "TODOS",
    acao: "",
    dataInicio: "",
    dataFim: ""
  });

  const loadLogs = (p: number = 1) => {
    startTransition(async () => {
      const resp = await getLogs(filters, p, 20);
      if (resp.success) {
        setItems(resp.data || []);
        setTotal(resp.total || 0);
        setPage(p);
      }
    });
  };

  useEffect(() => {
    loadLogs(1);
  }, []);

  const formatTime = (date: any) => {
    if (!date) return "---";
    const d = new Date(date);
    return d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDateShort = (date: any) => {
    if (!date) return "---";
    const d = new Date(date);
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return `${d.getDate().toString().padStart(2, '0')} DE ${months[d.getMonth()]}`;
  };

  const getLogStatus = (acao: string) => {
    const a = acao?.toUpperCase() || "";
    if (a.includes("ERRO") || a.includes("FALHA") || a.includes("DELETE") || a.includes("EXCLUIU")) {
      return { 
        code: 500, 
        color: "text-red-400", 
        bg: "hover:bg-red-950/30", 
        bgActive: "bg-red-950/10",
        border: "border-l-red-500", 
        icon: <AlertTriangle className="w-3 h-3 text-red-500" /> 
      };
    }
    if (a.includes("BUSCA") || a.includes("FILTRO") || a.includes("LISTOU") || a.includes("ACESSO")) {
      return { 
        code: 404, 
        color: "text-amber-400", 
        bg: "hover:bg-amber-950/30", 
        bgActive: "bg-amber-950/10",
        border: "border-l-amber-500", 
        icon: <AlertTriangle className="w-3 h-3 text-amber-500" /> 
      };
    }
    return { 
      code: 200, 
      color: "text-emerald-400", 
      bg: "hover:bg-emerald-950/20", 
      bgActive: "",
      border: "border-l-emerald-500", 
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 
    };
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Breadcrumbs e Título - Mantendo padrão profissional para integração */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gray-600" />
            <h1 className="text-[20px] font-normal text-gray-800 tracking-tight">Logs do Sistema</h1>
        </div>
        
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Relatórios</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Logs do Sistema</span>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="bg-[#0a0a0a] rounded-lg shadow-2xl overflow-hidden border border-gray-800 flex flex-col">
        {/* Terminal Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-[#0f0f0f]">
          <div className="flex items-center gap-3">
              <div className="flex gap-1.5 mr-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                 <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                 <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-[13px] font-bold tracking-tight text-gray-500 uppercase font-mono">system_runtime_logs.exe</span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-950/30 border border-blue-900 rounded text-[12px] text-blue-400 font-mono">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                LIVE_STREAMING
             </div>
             <button 
               onClick={() => setIsFiltersOpen(!isFiltersOpen)}
               className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-[12px] transition-all border border-gray-700 font-mono"
             >
               <Filter className="w-3 h-3" />
               FILTROS
               <ChevronDown className={`w-3 h-3 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`} />
             </button>
          </div>
        </div>

        {/* Filters Panel - Integrado no terminal */}
        {isFiltersOpen && (
          <div className="bg-[#111] border-b border-gray-800 p-6 animate-in slide-in-from-top-4 duration-200 font-mono">
             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-full">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-600 uppercase">User</label>
                   <input 
                     type="text"
                     value={filters.usuario}
                     onChange={(e) => setFilters({...filters, usuario: e.target.value})}
                     className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 text-white"
                     placeholder="Filter user..."
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-600 uppercase">Module</label>
                   <select 
                     value={filters.modulo}
                     onChange={(e) => setFilters({...filters, modulo: e.target.value})}
                     className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 text-white"
                   >
                     {MODULOS_DISPONIVEIS.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-600 uppercase">Search Action</label>
                   <input 
                     type="text"
                     value={filters.acao}
                     onChange={(e) => setFilters({...filters, acao: e.target.value})}
                     className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 text-white"
                     placeholder="Search content..."
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-gray-600 uppercase">Start Date</label>
                   <input 
                     type="date"
                     value={filters.dataInicio}
                     onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                     className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 text-white"
                   />
                </div>
                <div className="space-y-1 flex items-end gap-2">
                   <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-gray-600 uppercase">End Date</label>
                      <input 
                        type="date"
                        value={filters.dataFim}
                        onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                        className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 text-white"
                      />
                   </div>
                   <button 
                     onClick={() => loadLogs(1)}
                     className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded h-[32px] text-[10px] font-bold"
                   >
                      RUN
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Terminal Content */}
        <div className="overflow-x-auto font-mono">
          <table className="w-full border-collapse text-[13px] text-gray-400">
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="p-20 text-center text-gray-700 italic uppercase tracking-widest text-[14px]">
                    {isPending ? "> INITIALIZING_DATABASE_CONNECTION..." : "> NO_RECORDS_FOUND_IN_STORAGE"}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const status = getLogStatus(item.Acao);
                  return (
                    <tr key={item.Id} className={`group border-l-2 ${status.border} ${status.bg} ${status.bgActive} transition-all border-b border-gray-900/30`}>
                      <td className="py-2 pl-4 pr-2 whitespace-nowrap text-gray-600 w-44">
                         <div className="flex items-center gap-3">
                            {status.icon}
                            <span className="font-bold whitespace-nowrap">{formatDateShort(item.Data)}</span>
                            <span className="opacity-40 text-[11px]">{formatTime(item.Data)}</span>
                         </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap w-24">
                         <span className={`font-bold ${status.color}`}>
                            {item.Modulo?.substring(0, 3).toUpperCase() || "SYS"}
                         </span>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap w-16">
                         <span className={`px-1 rounded-[2px] text-[11px] font-bold border ${status.code === 200 ? "bg-emerald-950/20 text-emerald-500 border-emerald-900/50" : status.code === 404 ? "bg-amber-950/20 text-amber-500 border-amber-900/50" : "bg-red-950/20 text-red-500 border-red-900/50"}`}>
                            {status.code}
                         </span>
                      </td>
                      <td className="py-2 px-3 w-48 text-gray-500 font-bold truncate">
                         {item.Usuario || "anonymous"}
                      </td>
                      <td className="py-2 px-3 text-gray-200">
                         <span className="group-hover:text-white transition-colors">
                            {item.Acao}
                         </span>
                         <span className="ml-3 text-gray-700 font-normal italic">
                            {item.Descricao ? `// ${item.Descricao}` : ""}
                         </span>
                      </td>
                      <td className="py-2 px-4 text-right text-gray-800 text-[11px] w-28 whitespace-nowrap">
                         {item.Ip || "::1"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Terminal Footer / Pagination */}
        <div className="px-4 py-3 border-t border-gray-800 bg-[#0f0f0f] flex items-center justify-between font-mono">
          <div className="text-[12px] text-gray-600 uppercase">
            SHOWING <span className="text-gray-400 font-bold">{items.length}</span> ENTRIES
            {total > 0 && <span> OF <span className="text-gray-400 font-bold">{total}</span></span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadLogs(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2 py-1 border border-gray-800 rounded bg-black text-gray-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold"
            >
              PREV
            </button>
            
            <span className="px-2 text-[12px] text-gray-500 font-bold uppercase">
              PAGE {page} / {totalPages || 1}
            </span>

            <button
              onClick={() => loadLogs(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || total === 0}
              className="px-2 py-1 border border-gray-800 rounded bg-black text-gray-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Oculta scrollbars globais APENAS nesta página para manter o estilo terminal */
        .p-4.bg-gray-50 *::-webkit-scrollbar {
          display: none;
        }
        .p-4.bg-gray-50 * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
