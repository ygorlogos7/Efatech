"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Imprimir" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors print:hidden"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}
