import { Home } from "lucide-react";
import Link from "next/link";
import { TransportadoraForm } from "@/components/forms/TransportadoraForm";

export default function CreateTransportadoraPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold text-2xl mb-0">Adicionar transportadora</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span>
          <Link href="/cadastros/transportadoras" className="hover:underline">Transportadoras</Link>
          <span>&gt;</span>
          <span className="text-gray-400">Adicionar</span>
        </div>
      </div>
      <TransportadoraForm />
    </div>
  );
}
