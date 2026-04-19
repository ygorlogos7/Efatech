"use client";

import React from "react";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  label?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function PrintButton({ 
  label = "Imprimir", 
  className = "flex items-center gap-2 bg-[#1a1c23] hover:bg-black text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all active:scale-95",
  icon = <Printer className="w-4 h-4" />
}: PrintButtonProps) {
  return (
    <button 
      onClick={() => window.print()}
      className={className}
    >
      {icon}
      {label}
    </button>
  );
}
