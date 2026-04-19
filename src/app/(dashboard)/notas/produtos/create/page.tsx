import React from "react";
import { Home, FileText } from "lucide-react";
import Link from "next/link";
import { NotaFiscalForm } from "@/components/forms/NotaFiscalForm";

export default function CreateNotaProdutoPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-2">
          <FileText className="w-8 h-8 text-[#38b473]" />
          Emissão de NFe
        </h3>
        <div className="text-gray-500 text-xs font-bold flex items-center gap-1 uppercase tracking-widest">
          <Home className="w-4 h-4 mr-1 text-[#38b473]" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span className="opacity-30">&gt;</span>
          <Link href="/notas/produtos" className="hover:underline">Notas de Produtos</Link>
          <span className="opacity-30">&gt;</span>
          <span className="text-gray-400">Nova</span>
        </div>
      </div>
      <NotaFiscalForm tipo="produto" />
    </div>
  );
}
