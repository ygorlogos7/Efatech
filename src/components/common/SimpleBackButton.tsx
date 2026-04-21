"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface SimpleBackButtonProps {
  fallbackUrl: string;
}

export function SimpleBackButton({ fallbackUrl }: SimpleBackButtonProps) {
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      window.history.back();
    } else {
      window.location.href = fallbackUrl;
    }
  };

  return (
    <button 
      onClick={handleBack}
      className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold text-sm uppercase tracking-wider no-print"
    >
      <ArrowLeft className="w-4 h-4" /> Voltar para a lista
    </button>
  );
}
