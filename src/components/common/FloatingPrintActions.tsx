"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function FloatingPrintActions() {
  const pathname = usePathname();

  const handleBack = () => {
    // Se houver histórico significativo, tenta voltar pelo navegador
    if (typeof window !== "undefined" && window.history.length > 2) {
      window.history.back();
      return;
    }

    // Caso contrário (nova aba), redireciona baseado no contexto da URL
    if (pathname.includes("ordens-servico")) {
      window.location.href = "/ordens-servico";
    } else if (pathname.includes("vendas")) {
      window.location.href = "/vendas/balcao";
    } else {
      window.location.href = "/financeiro/caixas";
    }
  };

  return (
    <div className="fixed bottom-10 right-10 print:hidden z-[9999] flex gap-4">
      <button 
        onClick={handleBack}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2 border border-gray-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Voltar
      </button>

      <button 
        onClick={() => window.print()}
        className="bg-[#00a859] hover:bg-green-700 text-white font-black px-10 py-5 rounded-2xl shadow-[0_20px_50px_rgba(0,168,89,0.3)] transition-all active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-2 border-white/20"
      >
        Confirmar & Imprimir
      </button>
    </div>
  );
}
