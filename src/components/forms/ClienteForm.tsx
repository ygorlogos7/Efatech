"use client";

import React, { useTransition } from "react";
import { createCliente, updateCliente } from "@/actions/clientes";
import { Edit, MapPin, Phone, DollarSign, Camera, Paperclip, Check, X, FileText } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";

interface ClienteFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function ClienteForm({ initialData, isReadOnly = false }: ClienteFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();

  const isEdit = !!initialData && !isReadOnly;
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateCliente(initialData.Id, formData);
      } else {
        r = await createCliente(formData);
      }

      if (r?.success === false) {
        error(r.error || "Erro ao salvar cliente.");
      } else {
        success(isEdit ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
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
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de cliente *</label>
            <select name="TipoCliente" defaultValue={initialData?.TipoCliente || ""} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="">Selecione</option>
              <option value="F">Pessoa Física</option>
              <option value="J">Pessoa Jurídica</option>
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome *</label>
            <input type="text" name="Nome" defaultValue={initialData?.Nome} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
            <input type="email" name="Email" defaultValue={initialData?.Email} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CPF/CNPJ</label>
            <input type="text" name="CPFCNPJ" defaultValue={initialData?.CPFCNPJ} disabled={isReadOnly} placeholder="000.000.000-00" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Telefone Principal</label>
            <input type="text" name="Telefone" defaultValue={initialData?.Telefone} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Telefone comercial</label>
            <input type="text" name="TelefoneComercial" defaultValue={initialData?.TelefoneComercial} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Telefone celular</label>
            <input type="text" name="TelefoneCelular" defaultValue={initialData?.TelefoneCelular} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">FAX</label>
            <input type="text" name="Fax" defaultValue={initialData?.Fax} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Site</label>
            <input type="text" name="Site" defaultValue={initialData?.Site} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Vendedor / Responsável</label>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <input type="text" name="VendedorResponsavel" defaultValue={initialData?.VendedorResponsavel || "Johnny Andrade Ferreira"} disabled={isReadOnly} className="w-full text-sm px-3 py-1.5 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
              {!isReadOnly && (
                <button type="button" className="bg-gray-100 px-3 border-l border-gray-300 hover:bg-gray-200 transition-colors text-gray-600">
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Financeiro */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Financeiro</h3>
        </div>
        <div className="p-5">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-gray-700 mb-1">Limite de crédito</label>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <input type="number" step="0.01" name="LimiteCredito" defaultValue={initialData?.LimiteCredito} disabled={isReadOnly} placeholder="0,00" className="w-full text-sm px-3 py-1.5 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
              <div className="bg-white px-3 flex items-center border-l border-gray-300 gap-1.5 shrink-0">
                <input type="checkbox" name="PermitirExcederLimite" defaultChecked={initialData?.PermitirExcederLimite} disabled={isReadOnly} className="w-3.5 h-3.5" />
                <label className="text-xs text-gray-500 whitespace-nowrap">Permitir exceder</label>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Para não limitar o crédito do cliente, deixe este campo em branco.</p>
          </div>
        </div>
      </div>

      {/* 7. Observações */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Observações</h3>
        </div>
        <div className="p-5">
          <textarea name="Observacoes" rows={5} defaultValue={initialData?.Observacoes} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"></textarea>
        </div>
      </div>

      {/* Buttons */}
      {!isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <button type="submit" disabled={isPending} className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors disabled:opacity-50">
            <Check className="w-4 h-4" />
            {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar"}
          </button>
          <Link href="/cadastros/clientes" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>
      )}
      
      {isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <Link href={`/cadastros/clientes/edit/${initialData.Id}`} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <Link href="/cadastros/clientes" className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      )}
    </form>
  );
}

// Small icon helper
function TrashIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
