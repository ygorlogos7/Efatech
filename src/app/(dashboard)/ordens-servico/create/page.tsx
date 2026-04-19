import { Home } from "lucide-react";
import Link from "next/link";
import { OSForm } from "@/components/forms/OSForm";

export default function CreateOSPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900">Abrir Ordem de Serviço</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span>
          <Link href="/ordens-servico" className="hover:underline">Ordens de Serviço</Link>
          <span>&gt;</span>
          <span className="text-gray-400">Nova O.S.</span>
        </div>
      </div>
      <OSForm />
    </div>
  );
}
