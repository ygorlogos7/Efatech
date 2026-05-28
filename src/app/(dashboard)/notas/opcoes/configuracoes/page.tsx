"use client";

import React, { useState, useTransition } from "react";
import { getNotasConfig, saveNotasConfig } from "@/actions/notas";
import { Check, FolderOpen, HardDrive, PackageOpen, ShieldCheck } from "lucide-react";

export default function NotasConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getNotasConfig();
      if (res.success) setConfig(res.data);
    });
  }, []);

  const handleSave = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await saveNotasConfig(formData);
      if (res.success) {
        setSaved(true);
        const refreshed = await getNotasConfig();
        if (refreshed.success) setConfig(refreshed.data);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.error || "Falha ao salvar.");
      }
    });
  };

  if (!config) {
    return (
      <div className="max-w-4xl py-12 text-center text-sm text-gray-500">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Configurações Gerais de Notas</h2>
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md text-sm font-medium">
            <Check className="w-4 h-4" /> Configurações salvas com sucesso!
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
            {error}
          </div>
        )}
      </div>

      <form action={handleSave} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4" /> Ambiente da SEFAZ
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="Ambiente"
                  value="homologacao"
                  defaultChecked={config.Ambiente === "homologacao"}
                  className="w-4 h-4 text-[#38b473]"
                />
                <span className="text-sm font-medium">Homologação (Testes)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="Ambiente"
                  value="producao"
                  defaultChecked={config.Ambiente === "producao"}
                  className="w-4 h-4 text-red-500"
                />
                <span className="text-sm font-medium">Produção (Valor Fiscal)</span>
              </label>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 uppercase font-bold tracking-widest">
              Atenção: Notas em produção possuem valor jurídico real.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
            <PackageOpen className="w-4 h-4" /> Sequenciamento de Notas
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Série Padrão (NFe/NFCe)</label>
              <input
                type="number"
                name="SeriePadrao"
                min={1}
                defaultValue={config.SeriePadrao}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Próximo Número NFe</label>
              <input
                type="number"
                name="ProximoNumeroNFe"
                min={1}
                defaultValue={config.ProximoNumeroNFe}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
            <HardDrive className="w-4 h-4" /> Salvar XML e DANFE na máquina
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="hidden" name="SalvarArquivosLocal" value="false" />
              <input
                type="checkbox"
                name="SalvarArquivosLocal"
                value="true"
                defaultChecked={config.SalvarArquivosLocal}
                className="mt-1 w-4 h-4 rounded text-[#00a859] focus:ring-[#00a859]"
              />
              <span className="text-sm text-gray-700">
                <span className="font-semibold block">Salvar automaticamente após autorizar a NF-e</span>
                Ao emitir com sucesso, o sistema grava o XML autorizado e o PDF do DANFE na pasta abaixo.
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                Pasta de destino (caminho completo)
              </label>
              <input
                type="text"
                name="PastaExportacaoLocal"
                defaultValue={config.PastaExportacaoLocal || ""}
                placeholder="Ex.: C:\Efatech\Notas ou D:\Fiscal\NFe"
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-mono focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]"
              />
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Use o caminho da pasta no computador onde o sistema está rodando (servidor local).
                Os arquivos são nomeados como <code className="bg-gray-100 px-1 rounded">NFe-série-número-chave.xml</code> e{" "}
                <code className="bg-gray-100 px-1 rounded">.pdf</code>. Em hospedagem na nuvem, a pasta é no servidor, não no seu PC.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-[#00a859] hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow-sm text-sm transition-colors disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar Configuração"}
        </button>
      </form>
    </div>
  );
}
