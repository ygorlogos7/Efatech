import React from "react";
import { Home, ArrowLeft, Edit2, Wrench, DollarSign, ClipboardList, Briefcase, Tag, Percent } from "lucide-react";
import Link from "next/link";
import { getServicoById } from "@/actions/servicos";
import { notFound } from "next/navigation";

export default async function PreviewServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);
  if (isNaN(idNum)) return notFound();

  const { success, data: servico, error } = await getServicoById(idNum);

  if (!success || !servico) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">Erro ao carregar</h2>
        <p className="text-gray-500 mt-2">{error || "Não encontrado."}</p>
        <Link href="/servicos" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para a lista</Link>
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
            <Wrench className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{servico.Nome}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${servico.Ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {servico.Ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Serviço #{servico.Id} • {servico.Categoria || "Sem categoria"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/servicos" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-md border border-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <Link href={`/servicos/edit/${servico.Id}`} className="flex items-center gap-2 px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" /> Editar serviço
          </Link>
        </div>
      </div>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA - DADOS GERAIS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Dados do serviço</h3>
            </div>
            <div className="p-6 space-y-4">
              <LabelValue label="Código" value={servico.CodigoServico} />
              <LabelValue label="Tipo" value={servico.TipoServico} />
              <LabelValue label="Categoria" value={servico.Categoria} />
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">ISS Retido Fonte:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${servico.IssRetidoFonte ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {servico.IssRetidoFonte ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Tributação</h3>
            </div>
            <div className="p-6 space-y-4">
              <LabelValue label="Regra" value={servico.RegraTributacao} />
              <LabelValue label="Alíquota Tributos" value={`${servico.PercentualTributos}%`} />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - VALORES E DESCRIÇÃO */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Valores</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-10">
              <div className="text-center pb-4 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Valor de Custo</p>
                <p className="text-lg font-bold text-gray-700">R$ {servico.ValorCusto.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="text-center pb-4 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Valor de Venda</p>
                <p className="text-lg font-black text-[#38b473]">R$ {servico.ValorVenda.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Descrição e Observações</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Descrição Completa</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{servico.Descricao || "Sem descrição detalhada."}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Notas Internas</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{servico.Observacoes || "Sem observações internas."}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
