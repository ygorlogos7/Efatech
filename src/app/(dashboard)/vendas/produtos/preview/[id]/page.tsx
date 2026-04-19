import { Home } from "lucide-react";
import Link from "next/link";
import { VendaForm } from "@/components/forms/VendaForm";
import { getVendaById } from "@/actions/vendas";
import { PrintButton } from "@/components/forms/PrintButton";
import { notFound } from "next/navigation";

export default async function PreviewVendaProdutosPage({ params }: { params: Promise<{ id: string }> }) {
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h3 className="text-2xl font-bold text-gray-900">Venda #{data.Numero} — Produtos</h3>
        <div className="flex items-center gap-3">
          <PrintButton label="Imprimir Recibo" />
          <div className="text-gray-500 text-sm flex items-center gap-1">
            <Home className="w-4 h-4 mr-1" /><Link href="/home" className="hover:underline">Início</Link>
            <span>&gt;</span><Link href="/vendas/produtos" className="hover:underline">Vendas Produtos</Link>
            <span>&gt;</span><span className="text-gray-400">#{data.Numero}</span>
          </div>
        </div>
      </div>
      <VendaForm tipo="produtos" initialData={data} isReadOnly={true} />
    </div>
  );
}
