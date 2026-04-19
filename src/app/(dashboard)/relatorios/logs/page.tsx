"use client";

import React, { useState, useTransition } from "react";
import { getLogs } from "@/actions/relatorios";
import { ClipboardList, Search, Clock, User, Activity, AlertOctagon, Globe } from "lucide-react";
import { clsx } from "clsx";

export default function LogsSistemaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getLogs();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900 font-mono tracking-tight text-gray-900 bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Logs de Auditoria</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 shadow-xs">
           <Activity className="w-3 h-3 text-red-500 animate-pulse" /> Monitoramento em Tempo Real
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-3xl">
        <div className="p-4 border-b border-gray-100 bg-[#f8f9fa] flex gap-4">
           <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#38b473] transition-colors" />
              <input type="text" placeholder="Filtrar logs por ação, usuário ou módulo..." className="w-full pl-10 pr-4 py-2.5 text-sm border-none bg-white rounded-lg shadow-inner focus:ring-2 focus:ring-[#38b473]/20 transition-all font-medium" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-black">
              <tr>
                <th className="py-4 px-6">Data / Hora</th>
                <th className="py-4 px-6">Usuário</th>
                <th className="py-4 px-6">Ação Realizada</th>
                <th className="py-4 px-6 text-center">Módulo</th>
                <th className="py-4 px-6">IP / Origem</th>
                <th className="py-4 px-6">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-32 text-gray-400 italic">
                     <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs border border-gray-100 group">
                        <ClipboardList className="w-10 h-10 opacity-20 text-gray-600 group-hover:scale-110 transition-transform" />
                     </div>
                     <h5 className="text-lg font-bold text-gray-800 not-italic">Nenhum log registrado.</h5>
                     <p className="text-sm">As ações críticas serão auditadas automaticamente aqui.</p>
                  </td>
                </tr>
              ) : items.map(item => {
                const isError = item.Acao?.startsWith("[ERRO]");
                return (
                  <tr key={item.Id} className={clsx(
                    "hover:bg-gray-50/80 transition-colors group border-l-4",
                    isError ? "border-l-red-500 bg-red-50/30" : "border-l-transparent"
                  )}>
                    <td className="py-4 px-6 font-mono text-[12px] text-gray-500 flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-gray-300" />
                       {new Date(item.Data).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-4 px-6">
                       <div className="flex items-center gap-2">
                          <div className={clsx(
                            "w-7 h-7 rounded-full flex items-center justify-center border shadow-xs",
                            isError ? "bg-red-100 border-red-200" : "bg-indigo-50 border-indigo-100"
                          )}>
                             <User className={clsx("w-3.5 h-3.5", isError ? "text-red-600" : "text-indigo-600")} />
                          </div>
                          <span className="font-bold text-gray-800">{item.Usuario || "Sistema"}</span>
                       </div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="flex items-center gap-2">
                          {isError && <AlertOctagon className="w-4 h-4 text-red-500" />}
                          <span className={clsx(
                            "font-bold transition-colors",
                            isError ? "text-red-700" : "text-gray-800 group-hover:text-[#38b473]"
                          )}>
                            {item.Acao}
                          </span>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <span className={clsx(
                         "px-2.5 py-1 text-[10px] font-black rounded-sm border uppercase tracking-widest",
                         isError ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"
                       )}>
                         {item.Modulo || "GERAL"}
                       </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-400">
                       <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 opacity-50" />
                          {item.Ip || "---"}
                       </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-[12px] max-w-xs truncate italic">
                       {item.Descricao || "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
