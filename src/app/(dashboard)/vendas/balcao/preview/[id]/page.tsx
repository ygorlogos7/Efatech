import { Home } from "lucide-react";
import Link from "next/link";
import { VendaView } from "@/components/vendas/VendaView";
import { getVendaById } from "@/actions/vendas";
import { notFound } from "next/navigation";

export default async function PreviewVendaBalcaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return notFound();
  const { success, data } = await getVendaById(idNum);
  if (!success || !data) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-gray-800">Venda não encontrada</h2>
      <Link href="/vendas/balcao" className="mt-4 inline-block text-blue-600 hover:underline">Voltar</Link>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h3 className="text-xl font-bold text-gray-700 tracking-tight">Visualizar venda</h3>
        <div className="text-gray-500 text-[11px] flex items-center gap-1 uppercase font-bold">
          <Home className="w-3 h-3 mr-1" /><Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span><Link href="/vendas/balcao" className="hover:underline">Vendas Balcão</Link>
          <span>&gt;</span><span className="text-gray-400">Visualizar</span>
        </div>
      </div>
      <VendaView tipo="balcao" venda={data} />
    </div>
  );
}
