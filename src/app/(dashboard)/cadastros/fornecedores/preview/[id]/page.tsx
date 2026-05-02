import React from "react";
import { Home, ArrowLeft, Edit2, Building2, Mail, Phone, MapPin, ClipboardList, Briefcase } from "lucide-react";
import Link from "next/link";
import { getFornecedorById } from "@/actions/fornecedores";
import { notFound } from "next/navigation";

export default async function PreviewFornecedorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);
  if (isNaN(idNum)) return notFound();

  const { success, data: fornecedor, error } = await getFornecedorById(idNum);

  if (!success || !fornecedor) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">Erro ao carregar</h2>
        <p className="text-gray-500 mt-2">{error || "Não encontrado."}</p>
        <Link href="/cadastros/fornecedores" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para a lista</Link>
      </div>
    );
  }

  const LabelValue = ({ label, value }: { label: string, value: any }) => (
    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
      <span className="text-sm font-bold text-gray-700">{label}:</span>
      <span className="text-sm text-gray-500 font-medium">{value || "-"}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-md shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Building2 className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{fornecedor.Nome}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${fornecedor.Ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {fornecedor.Ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Fornecedor #{fornecedor.Id} • {fornecedor.TipoFornecedor === "J" ? "Pessoa Jurídica" : "Pessoa Física"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cadastros/fornecedores" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-md border border-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <Link href={`/cadastros/fornecedores/edit/${fornecedor.Id}`} className="flex items-center gap-2 px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" /> Editar fornecedor
          </Link>
        </div>
      </div>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA - DADOS GERAIS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Dados do fornecedor</h3>
            </div>
            <div className="p-6 space-y-4">
              <LabelValue label="CPF/CNPJ" value={fornecedor.CPFCNPJ} />
              <LabelValue label="E-mail" value={fornecedor.Email} />
              <LabelValue label="Telefone" value={fornecedor.Telefone} />
              <LabelValue label="Celular" value={fornecedor.TelefoneCelular} />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - ENDEREÇO E OBS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Localização</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-400 italic">Visualize os detalhes de endereço no modo de edição.</p>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Observações</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {fornecedor.Observacoes || "Nenhuma observação cadastrada."}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
