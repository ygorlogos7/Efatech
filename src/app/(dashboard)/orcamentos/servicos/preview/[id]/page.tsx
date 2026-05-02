import React from "react";
import { Home, ArrowLeft, Edit2, ClipboardList, User, Calendar, DollarSign, Package, FileText } from "lucide-react";
import Link from "next/link";
import { getOrcamentoById } from "@/actions/orcamentos";
import { notFound } from "next/navigation";

export default async function PreviewOrcamentoServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);
  if (isNaN(idNum)) return notFound();

  const { success, data: orcamento, error } = await getOrcamentoById(idNum);

  if (!success || !orcamento) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">Erro ao carregar</h2>
        <p className="text-gray-500 mt-2">{error || "Não encontrado."}</p>
        <Link href="/orcamentos/servicos" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para a lista</Link>
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
            <ClipboardList className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">Orçamento de Serviço #{orcamento.Numero}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${orcamento.Ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {orcamento.Ativo ? 'Aberto' : 'Encerrado'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Emissão: {new Date(orcamento.DataEmissao).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/orcamentos/servicos" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-md border border-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <Link href={`/orcamentos/servicos/edit/${orcamento.Id}`} className="flex items-center gap-2 px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" /> Editar orçamento
          </Link>
        </div>
      </div>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA - CLIENTE E DATAS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Cliente</h3>
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">{orcamento.Clientes?.Nome || "Consumidor Final"}</h2>
              <LabelValue label="CPF/CNPJ" value={orcamento.Clientes?.CPFCNPJ} />
              <LabelValue label="E-mail" value={orcamento.Clientes?.Email} />
              <LabelValue label="Telefone" value={orcamento.Clientes?.Telefone} />
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Prazos</h3>
            </div>
            <div className="p-6 space-y-4">
              <LabelValue label="Data Emissão" value={new Date(orcamento.DataEmissao).toLocaleDateString("pt-BR")} />
              <LabelValue label="Data Validade" value={orcamento.DataValidade ? new Date(orcamento.DataValidade).toLocaleDateString("pt-BR") : "Não definida"} />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - VALORES E ITENS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Resumo Financeiro</h3>
            </div>
            <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Produtos</p>
                <p className="text-lg font-bold text-gray-700">R$ {orcamento.TotalProdutos.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Serviços</p>
                <p className="text-lg font-bold text-gray-700">R$ {orcamento.TotalServicos.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Desconto</p>
                <p className="text-lg font-bold text-red-500">- R$ {orcamento.Desconto.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Valor Total</p>
                <p className="text-xl font-black text-[#38b473]">R$ {orcamento.Total.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Descrição do Orçamento</h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{orcamento.Descricao || "Nenhuma descrição detalhada."}</p>
              </div>
              <div className="mt-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Observações Internas</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{orcamento.Observacoes || "Nenhuma observação interna."}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
