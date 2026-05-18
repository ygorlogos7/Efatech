"use client";

import { Calendar } from "lucide-react";
import { labelMesAno } from "@/lib/relatorioPeriodo";

type Props = {
  mesAno: string;
  onMesAnoChange: (mesAno: string) => void;
  className?: string;
  hint?: string;
};

/** Seletor de mês visível — padrão em todos os relatórios consolidados. */
export function RelatorioFiltroMes({
  mesAno,
  onMesAnoChange,
  className = "",
  hint,
}: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-3 mb-6 ${className}`}>
      <div className="flex items-center gap-2 text-[12px] font-black text-gray-600 uppercase tracking-wider">
        <Calendar className="w-4 h-4 text-[#00a65a]" />
        Mês do relatório
      </div>
      <input
        type="month"
        value={mesAno}
        onChange={(e) => onMesAnoChange(e.target.value)}
        className="h-10 border border-gray-200 rounded px-3 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00a65a] bg-white shadow-sm"
      />
      <span className="text-[13px] text-gray-500">
        Exibindo:{" "}
        <span className="font-bold text-gray-800">{labelMesAno(mesAno)}</span>
      </span>
      {hint ? (
        <span className="text-[11px] text-gray-400 w-full sm:w-auto">{hint}</span>
      ) : null}
    </div>
  );
}
