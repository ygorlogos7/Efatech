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

  return null;
}
