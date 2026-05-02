import { Home } from "lucide-react";
import Link from "next/link";
import { EmpresaForm } from "@/components/forms/EmpresaForm";

export default function CreateEmpresaPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho com Breadcrumbs */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold text-2xl mb-0">Adicionar empresa</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span>
          <Link href="/cadastros/opcoes/empresas" className="hover:underline">Empresas</Link>
          <span>&gt;</span>
          <span className="text-gray-400">Adicionar</span>
        </div>
      </div>

      <EmpresaForm />
    </div>
  );
}
