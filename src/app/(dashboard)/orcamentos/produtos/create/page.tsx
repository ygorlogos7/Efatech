import React from "react";
import { OrcamentoProdutosForm } from "@/components/forms/OrcamentoProdutosForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateOrcamentoProdutoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/orcamentos/produtos" 
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Novo Orçamento de Produtos</h1>
          <p className="text-sm text-gray-500">Preencha os dados abaixo para gerar um orçamento profissional para o cliente.</p>
        </div>
      </div>

      <OrcamentoProdutosForm />
    </div>
  );
}
