import { Home } from "lucide-react";
import Link from "next/link";
import { VendaView } from "@/components/vendas/VendaView";
import { getVendaById } from "@/actions/vendas";
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
  return <VendaView tipo="produtos" venda={data} />;
}
