"use client";

import React, { useTransition } from "react";
import { createFuncionario, updateFuncionario } from "@/actions/funcionarios";
import { Edit, Briefcase, FileText, Check, X, Lock } from "lucide-react";
import Link from "next/link";

interface FuncionarioFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function FuncionarioForm({ initialData, isReadOnly = false }: FuncionarioFormProps) {
  const [isPending, startTransition] = useTransition();

  const isEdit = !!initialData && !isReadOnly;
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateFuncionario(initialData.Id, formData);
      } else {
        r = await createFuncionario(formData);
      }

      if (r?.success === false) {
        alert(r.error || "Erro ao salvar funcionário.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Ficha do Perfil</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Situação</label>
            <select name="Ativo" defaultValue={initialData ? (initialData.Ativo ? "true" : "false") : "true"} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo *</label>
            <input type="text" name="Nome" defaultValue={initialData?.Nome} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CPF/CNPJ</label>
            <input type="text" name="CPFCNPJ" defaultValue={initialData?.CPFCNPJ} disabled={isReadOnly} placeholder="000.000.000-00" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">RG</label>
            <input type="text" name="RG" defaultValue={initialData?.RG} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nascimento</label>
            <input type="date" name="DataNascimento" defaultValue={initialData?.DataNascimento} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Sexo</label>
            <select name="Sexo" defaultValue={initialData?.Sexo || ""} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Cargo</label>
            <input type="text" name="Cargo" defaultValue={initialData?.Cargo} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Comissão (%)</label>
            <input type="number" step="0.01" name="Comissao" defaultValue={initialData?.Comissao} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
            <input type="email" name="Email" defaultValue={initialData?.Email} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Configuração de Acesso</h3>
          </div>
        </div>
        <div className="p-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="PermitirAcessoSistema" defaultChecked={initialData?.PermitirAcessoSistema} disabled={isReadOnly} className="w-4 h-4 rounded text-green-600 focus:ring-green-500 disabled:cursor-not-allowed" />
            <span className="text-sm font-medium text-gray-700">Permitir Acesso ao Sistema</span>
          </label>
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
          <Link href="/cadastros/funcionarios" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>
      )}
      
      {isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <Link href={`/cadastros/funcionarios/edit/${initialData.Id}`} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <Link href="/cadastros/funcionarios" className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      )}
    </form>
  );
}
