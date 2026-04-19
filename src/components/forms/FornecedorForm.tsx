"use client";

import React, { useTransition } from "react";
import { createFornecedor, updateFornecedor } from "@/actions/fornecedores";
import { Edit, Building2, Phone, FileText, Check, X } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";

interface FornecedorFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function FornecedorForm({ initialData, isReadOnly = false }: FornecedorFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();

  const isEdit = !!initialData && !isReadOnly;
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateFornecedor(initialData.Id, formData);
      } else {
        r = await createFornecedor(formData);
      }

      if (r?.success === false) {
        error(r.error || "Erro ao salvar fornecedor.");
      } else {
        success(isEdit ? "Fornecedor atualizado com sucesso!" : "Fornecedor cadastrado com sucesso!");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Dados da Transportadora / Fornecedor</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de fornecedor *</label>
            <select name="TipoFornecedor" defaultValue={initialData?.TipoFornecedor || "J"} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="J">Pessoa Jurídica</option>
              <option value="F">Pessoa Física</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Situação</label>
            <select name="Ativo" defaultValue={initialData ? (initialData.Ativo ? "true" : "false") : "true"} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-700 mb-1">CPF/CNPJ</label>
             <input type="text" name="CPFCNPJ" defaultValue={initialData?.CPFCNPJ} disabled={isReadOnly} placeholder="00.000.000/0001-00" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome / Razão Social *</label>
            <input type="text" name="Nome" defaultValue={initialData?.Nome} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">E-mail corporativo</label>
            <input type="email" name="Email" defaultValue={initialData?.Email} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Telefone / Fixo</label>
            <input type="text" name="Telefone" defaultValue={initialData?.Telefone} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp / Celular</label>
            <input type="text" name="TelefoneCelular" defaultValue={initialData?.TelefoneCelular} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Observações Opcionais</h3>
        </div>
        <div className="p-5">
          <textarea name="Observacoes" rows={3} defaultValue={initialData?.Observacoes} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"></textarea>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <button type="submit" disabled={isPending} className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors disabled:opacity-50">
            <Check className="w-4 h-4" />
            {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar"}
          </button>
          <Link href="/cadastros/fornecedores" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>
      )}
      
      {isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <Link href={`/cadastros/fornecedores/edit/${initialData.Id}`} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <Link href="/cadastros/fornecedores" className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      )}
    </form>
  );
}
