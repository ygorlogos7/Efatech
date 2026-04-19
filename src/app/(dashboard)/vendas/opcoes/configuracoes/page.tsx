"use client";
import React, { useState, useTransition } from "react";
import { getVendaConfig, saveVendaConfig } from "@/actions/vendas";
import { Settings, Check } from "lucide-react";

export default function VendasConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    startTransition(async () => {
      const res = await getVendaConfig();
      if (res.success) setConfig(res.data);
    });
  }, []);

  const handleSave = async (formData: FormData) => {
    startTransition(async () => {
      const res = await saveVendaConfig(formData);
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Configurações de Vendas</h2>
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md text-sm font-medium">
            <Check className="w-4 h-4" /> Salvo com sucesso!
          </div>
        )}
      </div>
      <form action={handleSave} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Parâmetros de Venda</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">E-mail Padrão p/ Envio</label>
              <input type="email" name="EmailPadrao" defaultValue={config?.EmailPadrao || ""} placeholder="vendas@empresa.com" className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Desconto Máximo Permitido (%)</label>
              <input type="number" name="DescontoMaximo" min="0" max="100" defaultValue={config?.DescontoMaximo ?? 100} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Mensagem Rodapé (impressão)</label>
              <textarea name="MensagemRodape" rows={3} defaultValue={config?.MensagemRodape || ""} className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859]"></textarea>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="hidden" name="NumeracaoAutomatica" value="false" />
                <input type="checkbox" name="NumeracaoAutomatica" value="true" defaultChecked={config?.NumeracaoAutomatica ?? true} className="w-4 h-4 rounded text-green-600" />
                <span className="text-sm font-medium text-gray-700">Numeração automática</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="hidden" name="PermitirDesconto" value="false" />
                <input type="checkbox" name="PermitirDesconto" value="true" defaultChecked={config?.PermitirDesconto ?? true} className="w-4 h-4 rounded text-green-600" />
                <span className="text-sm font-medium text-gray-700">Permitir desconto nas vendas</span>
              </label>
            </div>
          </div>
        </div>
        <div className="pb-10">
          <button type="submit" disabled={isPending} className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm disabled:opacity-50">
            <Check className="w-4 h-4" /> {isPending ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>
      </form>
    </div>
  );
}
