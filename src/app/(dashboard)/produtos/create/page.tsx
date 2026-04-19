import { Home } from "lucide-react";
import Link from "next/link";
import { ProdutoForm } from "@/components/forms/ProdutoForm";
import { getProdutoById } from "@/actions/produtos";

export default async function CreateProdutoPage({
  searchParams,
}: {
  searchParams: Promise<{ cloneId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const cloneId = resolvedParams?.cloneId;
  let initialData = null;

  if (cloneId) {
    const res = await getProdutoById(parseInt(cloneId));
    if (res.success) {
      initialData = res.data;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold text-2xl mb-0">
          {cloneId ? "Clonar Produto" : "Cadastrar Produto"}
        </h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span>
          <Link href="/produtos" className="hover:underline">Produtos</Link>
          <span>&gt;</span>
          <span className="text-gray-400">{cloneId ? "Clonar" : "Adicionar"}</span>
        </div>
      </div>
      <ProdutoForm initialData={initialData} isClone={!!cloneId} />
    </div>
  );
}
