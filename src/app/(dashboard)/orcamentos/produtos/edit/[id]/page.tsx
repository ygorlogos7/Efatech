import React from "react";
import { OrcamentoProdutosForm } from "@/components/forms/OrcamentoProdutosForm";
import { Home } from "lucide-react";
import Link from "next/link";
import { getOrcamentoById } from "@/actions/orcamentos";
import { notFound } from "next/navigation";

export default async function EditOrcamentoProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { success, data: orcamento } = await getOrcamentoById(parseInt(id));

  if (!success || !orcamento) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold text-2xl mb-0">Editar Orçamento de Produtos</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span>
          <Link href="/orcamentos/produtos" className="hover:underline">Orçamentos</Link>
          <span>&gt;</span>
          <span className="text-gray-400">Editar</span>
        </div>
      </div>

      <OrcamentoProdutosForm initialData={orcamento} />
    </div>
  );
}
