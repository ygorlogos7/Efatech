"use client";

import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    // Pequeno delay para garantir que o CSS e as fontes carreguem
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
