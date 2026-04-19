"use client";

import React, { useTransition } from "react";
import { createServico, updateServico } from "@/actions/servicos";
import { Edit, Wrench, Check, X, DollarSign, FileText, Settings2 } from "lucide-react";
import Link from "next/link";

interface ServicoFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function ServicoForm({ initialData, isReadOnly = false }: ServicoFormProps) {
  const [isPending, startTransition] = useTransition();

  const isEdit = !!initialData && !isReadOnly;
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (isEdit) {
        await updateServico(initialData.Id, formData);
      } else {
        await createServico(formData);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Dados Básicos do Serviço</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Situação</label>
            <select name="Ativo" defaultValue={initialData ? (initialData.Ativo ? "true" : "false") : "true"} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Serviço *</label>
            <input type="text" name="Nome" defaultValue={initialData?.Nome} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Cód. Serviço</label>
            <input type="text" name="CodigoServico" defaultValue={initialData?.CodigoServico} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Categoria</label>
             <input type="text" name="Categoria" defaultValue={initialData?.Categoria} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Serviço</label>
            <input type="text" name="TipoServico" defaultValue={initialData?.TipoServico} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">Descrição Comercial</label>
            <input type="text" name="Descricao" defaultValue={initialData?.Descricao} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Precificação</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Valor de Custo (R$) *</label>
              <input type="number" step="0.01" name="ValorCusto" defaultValue={initialData?.ValorCusto || 0} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Valor de Venda (R$) *</label>
              <input type="number" step="0.01" name="ValorVenda" defaultValue={initialData?.ValorVenda || 0} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Tributação e Regras</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alíquota Trib. (%)</label>
                <input type="number" step="0.01" name="PercentualTributos" defaultValue={initialData?.PercentualTributos || 0} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Regra Fisco</label>
                <input type="text" name="RegraTributacao" defaultValue={initialData?.RegraTributacao} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-auto">
              <input type="checkbox" name="IssRetidoFonte" defaultChecked={initialData?.IssRetidoFonte} disabled={isReadOnly} className="w-4 h-4 rounded text-green-600 focus:ring-green-500 disabled:cursor-not-allowed" />
              <span className="text-sm font-medium text-gray-700">ISS Retido na Fonte Opcional?</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Observações Internas</h3>
        </div>
        <div className="p-5">
          <textarea name="Observacoes" rows={3} defaultValue={initialData?.Observacoes} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"></textarea>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <button type="submit" disabled={isPending} className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors disabled:opacity-50">
            <Check className="w-4 h-4" />
            {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Gravar Serviço"}
          </button>
          <Link href="/servicos" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>
      )}
      
      {isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <Link href={`/servicos/edit/${initialData.Id}`} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <Edit className="w-4 h-4" />
            Editar Serviço
          </Link>
          <Link href="/servicos" className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      )}
    </form>
  );
}
