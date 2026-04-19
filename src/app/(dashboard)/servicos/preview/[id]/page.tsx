import { Home } from "lucide-react";
import Link from "next/link";
import { ServicoForm } from "@/components/forms/ServicoForm";
import { getServicoById } from "@/actions/servicos";
import { notFound } from "next/navigation";

export default async function PreviewServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);
  if (isNaN(idNum)) return notFound();

  const { success, data, error } = await getServicoById(idNum);

  if (!success || !data) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">Erro ao carregar</h2>
        <p className="text-gray-500 mt-2">{error || "Não encontrado."}</p>
        <Link href="/servicos" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold text-2xl mb-0">Visualizar Serviço</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Home className="w-4 h-4 mr-1" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span>&gt;</span>
          <Link href="/servicos" className="hover:underline">Serviços</Link>
          <span>&gt;</span>
          <span className="text-gray-400">Detalhes</span>
        </div>
      </div>
      <ServicoForm initialData={data} isReadOnly={true} />
    </div>
  );
}
