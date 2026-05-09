import { Home } from "lucide-react";
import Link from "next/link";
import { VendaForm } from "@/components/forms/VendaForm";
import { getVendaById } from "@/actions/vendas";
import { notFound } from "next/navigation";

export default async function EditVendaProdutosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return notFound();
  const { success, data } = await getVendaById(idNum);
  if (!success || !data) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-gray-800">Venda não encontrada</h2>
      <Link href="/vendas/produtos" className="mt-4 inline-block text-blue-600 hover:underline">Voltar</Link>
    </div>
  );
  const serializedData = {
    ...data,
    Total: Number(data.Total),
    TotalProdutos: Number(data.TotalProdutos),
    TotalServicos: Number(data.TotalServicos),
    Desconto: Number(data.Desconto),
    Itens: data.Itens.map((item: any) => ({
      ...item,
      Quantidade: Number(item.Quantidade),
      ValorTotal: Number(item.ValorTotal),
      Produtos: item.Produtos ? {
        ...item.Produtos,
        Cod_Preco: Number(item.Produtos.Cod_Preco || 0)
      } : null
    }))
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900">Editar Venda {data.Numero} — Produtos</h3>
      </div>
      <VendaForm tipo="produtos" initialData={serializedData} isReadOnly={false} />
    </div>
  );
}
