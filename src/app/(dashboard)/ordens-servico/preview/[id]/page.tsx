import React from "react";
import { Home, ArrowLeft, Edit2, ClipboardList, User, Calendar, DollarSign, Wrench, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getOrdemServicoById } from "@/actions/ordensServico";
import { notFound } from "next/navigation";

export default async function PreviewOSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return notFound();

  const { success, data: os, error } = await getOrdemServicoById(idNum);

  if (!success || !os) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">Erro ao carregar</h2>
        <p className="text-gray-500 mt-2">{error || "Não encontrada."}</p>
        <Link href="/ordens-servico" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para a lista</Link>
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
              <h1 className="text-2xl font-bold text-gray-800">Ordem de Serviço #{os.Numero}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${os.Ativo ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {os.Ativo ? 'Em Andamento' : 'Finalizada'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Abertura: {new Date(os.DataAbertura).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ordens-servico" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-md border border-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <Link href={`/ordens-servico/edit/${os.Id}`} className="flex items-center gap-2 px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" /> Editar O.S.
          </Link>
        </div>
      </div>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA - CLIENTE E EQUIPAMENTO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Cliente</h3>
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">{os.Cliente?.Nome || "Não informado"}</h2>
              <LabelValue label="CPF/CNPJ" value={os.Cliente?.CPFCNPJ} />
              <LabelValue label="Telefone" value={os.Cliente?.Telefone} />
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Equipamento / Objeto</h3>
            </div>
            <div className="p-6">
              <p className="text-lg font-black text-gray-800 uppercase mb-4">{os.Equipamento || "NÃO INFORMADO"}</p>
              <div className="space-y-4">
                <LabelValue label="Técnico" value={os.TecnicoId ? `ID: ${os.TecnicoId}` : "Não atribuído"} />
                <LabelValue label="Previsão" value={os.DataPrevisao ? new Date(os.DataPrevisao).toLocaleDateString("pt-BR") : "-"} />
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - PROBLEMA E VALORES */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Detalhes da O.S.</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Defeito Relatado</p>
                <div className="bg-red-50/50 p-4 rounded-lg border border-red-50 text-sm text-gray-700 italic">
                  {os.Defeito || "Nenhum defeito relatado."}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Solução Executada</p>
                <div className="bg-green-50/50 p-4 rounded-lg border border-green-50 text-sm text-gray-700 font-medium">
                  {os.Solucao || "Solução ainda não registrada."}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Resumo Financeiro</h3>
            </div>
            <div className="p-6">
               <div className="flex justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#38b473] rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Valor Total da O.S.</p>
                      <p className="text-3xl font-black text-gray-800">R$ {Number(os.Total).toFixed(2).replace(".", ",")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Forma de Pgto</p>
                    <p className="text-sm font-bold text-gray-600">Dinheiro / Pix</p>
                  </div>
               </div>
               <div className="mt-4">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 px-1">Observações Internas</p>
                  <p className="text-xs text-gray-500 italic bg-gray-50/50 p-3 rounded">{os.Observacoes || "Nenhuma observação interna registrada."}</p>
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
