import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
import { getEmpresaById } from "@/actions/empresas";
import { notFound } from "next/navigation";

export default async function EditEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { success, data: empresa } = await getEmpresaById(parseInt(id));

  if (!success || !empresa) {
    notFound();
  }

  const isEmpresaInterna = empresa.CategoriaEmpresa === "interno";
  const listaPath = isEmpresaInterna ? "/configuracoes/empresas" : "/cadastros/opcoes/empresas";
  const breadcrumbLabel = isEmpresaInterna ? "Empresa / lojas" : "Empresas";

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Breadcrumbs */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold text-2xl mb-0">Editar empresa</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span>
          <Link href={listaPath} className="hover:underline">{breadcrumbLabel}</Link>
          <span>&gt;</span>
          <span className="text-gray-400">Editar</span>
        </div>
      </div>

      <EmpresaForm initialData={empresa} redirectTo={listaPath} />
    </div>
  );
}
