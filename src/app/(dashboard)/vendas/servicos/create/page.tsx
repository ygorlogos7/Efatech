import { Home } from "lucide-react";
import Link from "next/link";
import { VendaForm } from "@/components/forms/VendaForm";
export default function CreateVendaServicosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900">Nova Venda — Serviços</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" /><Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span><Link href="/vendas/servicos" className="hover:underline">Vendas Serviços</Link>
          <span>&gt;</span><span className="text-gray-400">Nova</span>
        </div>
      </div>
      <VendaForm tipo="servicos" />
    </div>
  );
}
