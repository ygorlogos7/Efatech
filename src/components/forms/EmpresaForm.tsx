"use client";

import React, { useState, useTransition } from "react";
import { createEmpresa, updateEmpresa } from "@/actions/empresas";
import { Edit, MapPin, Phone, Mail, Check, X, Building2, Globe } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";
import { useRouter } from "next/navigation";

interface EmpresaFormProps {
  initialData?: any;
  isReadOnly?: boolean;
  redirectTo?: string;
  categoriaEmpresa?: "cadastro" | "interno";
}

export function EmpresaForm({
  initialData,
  isReadOnly = false,
  redirectTo,
  categoriaEmpresa = "cadastro",
}: EmpresaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();
  const router = useRouter();
  const [cep, setCep] = useState(initialData?.Cep || "");
  const [logradouro, setLogradouro] = useState(initialData?.Logradouro || "");
  const [numero, setNumero] = useState(initialData?.Numero || "");
  const [bairro, setBairro] = useState(initialData?.Bairro || "");
  const [cidade, setCidade] = useState(initialData?.Cidade || "");
  const [uf, setUf] = useState(initialData?.Uf || "");
  const [isBuscandoCep, setIsBuscandoCep] = useState(false);

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
        if (redirectTo) {
          router.push(redirectTo);
        }
      }
    });
  };

  const onlyDigits = (value: string) => value.replace(/\D/g, "");

  const preencherEnderecoPorCep = async (cepInformado: string) => {
    const cepLimpo = onlyDigits(cepInformado);
    if (cepLimpo.length !== 8) return;

    try {
      setIsBuscandoCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!response.ok) return;

      const data = await response.json();
      if (data?.erro) return;

      setLogradouro(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setUf((data.uf || "").toUpperCase());
    } catch {
      // Falha de rede nao impede preenchimento manual.
    } finally {
      setIsBuscandoCep(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
      <input
        type="hidden"
        name="CategoriaEmpresa"
        value={initialData?.CategoriaEmpresa || categoriaEmpresa}
      />
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
            <input
              type="text"
              name="InscricaoEstadual"
              defaultValue={initialData?.InscricaoEstadual}
              disabled={isReadOnly}
              placeholder="Somente números ou ISENTO"
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Regime tributário (CRT)</label>
            <select
              name="RegimeTributario"
              defaultValue={String(initialData?.RegimeTributario ?? 1)}
              disabled={isReadOnly}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="1">1 - Simples Nacional</option>
              <option value="2">2 - Simples (excesso sublimite)</option>
              <option value="3">3 - Regime Normal</option>
            </select>
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
            <input
              type="text"
              name="Cep"
              value={cep}
              onChange={(e) => {
                const raw = e.target.value;
                setCep(raw);
                if (onlyDigits(raw).length === 8) {
                  void preencherEnderecoPorCep(raw);
                }
              }}
              onBlur={() => void preencherEnderecoPorCep(cep)}
              disabled={isReadOnly}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {isBuscandoCep && (
              <p className="text-[11px] text-gray-500 mt-1">Buscando endereco pelo CEP...</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Logradouro</label>
            <input
              type="text"
              name="Logradouro"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              disabled={isReadOnly}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Número</label>
            <input
              type="text"
              name="Numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              disabled={isReadOnly}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
            <input
              type="text"
              name="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              disabled={isReadOnly}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              name="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              disabled={isReadOnly}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">UF</label>
            <input
              type="text"
              name="Uf"
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
              disabled={isReadOnly}
              maxLength={2}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
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
