"use client";

import React, { useTransition } from "react";
import { createEmpresa, updateEmpresa } from "@/actions/empresas";
import { Edit, MapPin, Phone, Mail, Check, X, Building2, Globe } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";

interface EmpresaFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function EmpresaForm({ initialData, isReadOnly = false }: EmpresaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();

  const isEdit = !!initialData && !isReadOnly;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateEmpresa(initialData.Id, formData);
      } else {
        r = await createEmpresa(formData);
      }

      if (r?.success === false) {
        error(r.error || "Erro ao salvar empresa.");
      } else {
        success(isEdit ? "Empresa atualizada com sucesso!" : "Empresa cadastrada com sucesso!");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
      {/* 1. Dados Gerais */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Edit className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Dados gerais</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Razão Social *</label>
            <input type="text" name="RazaoSocial" defaultValue={initialData?.RazaoSocial} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome Fantasia</label>
            <input type="text" name="NomeFantasia" defaultValue={initialData?.NomeFantasia} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Situação</label>
            <select name="Ativo" defaultValue={initialData ? (initialData.Ativo ? "on" : "") : "on"} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="on">Ativo</option>
              <option value="">Inativo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CNPJ *</label>
            <input type="text" name="Cnpj" defaultValue={initialData?.Cnpj} disabled={isReadOnly} required placeholder="00.000.000/0000-00" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Inscrição Estadual</label>
            <input type="text" name="InscricaoEstadual" defaultValue={initialData?.InscricaoEstadual} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Telefone</label>
            <input type="text" name="Telefone" defaultValue={initialData?.Telefone} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
            <input type="email" name="Email" defaultValue={initialData?.Email} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* 2. Endereço */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Endereço</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CEP</label>
            <input type="text" name="Cep" defaultValue={initialData?.Cep} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Logradouro</label>
            <input type="text" name="Logradouro" defaultValue={initialData?.Logradouro} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Número</label>
            <input type="text" name="Numero" defaultValue={initialData?.Numero} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
            <input type="text" name="Bairro" defaultValue={initialData?.Bairro} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Cidade</label>
            <input type="text" name="Cidade" defaultValue={initialData?.Cidade} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">UF</label>
            <input type="text" name="Uf" defaultValue={initialData?.Uf} disabled={isReadOnly} maxLength={2} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Buttons */}
      {!isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <button type="submit" disabled={isPending} className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors disabled:opacity-50">
            <Check className="w-4 h-4" />
            {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar"}
          </button>
          <Link href="/cadastros/opcoes/empresas" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>
      )}
      
      {isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <Link href={`/cadastros/opcoes/empresas/edit/${initialData.Id}`} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <Link href="/cadastros/opcoes/empresas" className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      )}
    </form>
  );
}
