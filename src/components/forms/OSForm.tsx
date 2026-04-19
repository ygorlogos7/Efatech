"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createOrdemServico, updateOrdemServico } from "@/actions/ordensServico";
import { getClientes } from "@/actions/clientes";
import { 
  ClipboardList, Wrench, FileText, DollarSign, Check, X, Edit, 
  Search, User, PenTool, Calendar, Package, AlertCircle
} from "lucide-react";
import Link from "next/link";
import SignaturePad from "@/components/common/SignaturePad";
import { useNotification } from "@/hooks/use-notification";

interface OSFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function OSForm({ initialData, isReadOnly = false }: OSFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();
  const isEdit = !!initialData && !isReadOnly;

  // States for search and selection
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [isSearching, setIsSearching] = useState(false);

  // States for signatures
  const [sigCliente, setSigCliente] = useState<string | null>(initialData?.AssinaturaCliente || null);
  const [sigTecnico, setSigTecnico] = useState<string | null>(initialData?.AssinaturaTecnico || null);

  // Load clients on search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const res = await getClientes(searchTerm);
        if (res.success && res.data) setClientes(res.data || []);
        setIsSearching(false);
      } else {
        setClientes([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSubmit = (formData: FormData) => {
    // Add custom fields to formData
    if (selectedClienteId) formData.append("ClienteId", selectedClienteId.toString());
    if (sigCliente) formData.append("AssinaturaCliente", sigCliente);
    if (sigTecnico) formData.append("AssinaturaTecnico", sigTecnico);

    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateOrdemServico(initialData.Id, formData);
      } else {
        r = await createOrdemServico(formData);
      }

      if (r?.success && (r as any).data) {
        success(isEdit ? "O.S. atualizada!" : "O.S. aberta com sucesso!");
        if (!isEdit) {
          window.location.href = `/ordens-servico/print/${(r as any).data.Id}`;
        }
      } else {
        error((r as any)?.error || "Erro ao processar O.S.");
      }
    });
  };

  const formatDateForInput = (date: any) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* 1. SEÇÃO: CLIENTE E DADOS BÁSICOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#1a1c23] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <User className="w-5 h-5 text-[#38b473]" />
            <h3 className="font-bold text-base tracking-tight">Identificação do Cliente</h3>
          </div>
          {isEdit && (
            <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-mono uppercase">
              O.S. Nº {initialData.Id}
            </span>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Busca de Cliente */}
          <div className="md:col-span-12">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Buscar Cliente</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nome, CPF ou E-mail do cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isReadOnly}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-[#38b473] focus:border-[#38b473] transition-all bg-gray-50/30"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-[#38b473] border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Lista de Resultados */}
            {clientes.length > 0 && !isReadOnly && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {clientes.map((c) => (
                  <button
                    key={c.Id}
                    type="button"
                    onClick={() => {
                      setSelectedClienteId(c.Id);
                      setSearchTerm(c.Nome);
                      setClientes([]);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{c.Nome}</p>
                      <p className="text-[10px] text-gray-500">{c.Documento || "Sem documento"}</p>
                    </div>
                    {selectedClienteId === c.Id && <Check className="w-4 h-4 text-[#38b473]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO: DETALHES DO EQUIPAMENTO E PREVISÃO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#1a1c23] px-5 py-4 flex items-center gap-2.5 text-white">
          <Package className="w-5 h-5 text-[#38b473]" />
          <h3 className="font-bold text-base tracking-tight">Informações Técnicas</h3>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Equipamento / Modelo</label>
            <input 
              type="text" 
              name="Equipamento" 
              defaultValue={initialData?.Equipamento} 
              disabled={isReadOnly} 
              placeholder="Ex: iPhone 13 Pro" 
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all" 
              required
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Situação Atual</label>
            <select 
              name="Ativo" 
              defaultValue={initialData ? (initialData.Ativo ? "true" : "false") : "true"} 
              disabled={isReadOnly} 
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all cursor-pointer font-medium"
            >
              <option value="true">🟢 Em Aberto / Aguardando</option>
              <option value="false">🔴 Finalizada / Entregue</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Data de Previsão</label>
            <div className="relative">
              <input 
                type="date" 
                name="DataPrevisao" 
                defaultValue={formatDateForInput(initialData?.DataPrevisao)} 
                disabled={isReadOnly} 
                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all" 
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: DEFEITO E SOLUÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-orange-50 px-5 py-4 flex items-center gap-2.5 border-b border-orange-100">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-base tracking-tight text-orange-800">Defeito Informado</h3>
          </div>
          <div className="p-6 flex-1">
            <textarea 
              name="Defeito" 
              rows={5} 
              defaultValue={initialData?.Defeito} 
              disabled={isReadOnly} 
              placeholder="Descreva o problema relatado pelo cliente..." 
              className="w-full text-sm border border-gray-200 rounded-xl p-4 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-green-50 px-5 py-4 flex items-center gap-2.5 border-b border-green-100">
            <Check className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-base tracking-tight text-green-800">Solução / Laudo Técnico</h3>
          </div>
          <div className="p-6 flex-1">
            <textarea 
              name="Solucao" 
              rows={5} 
              defaultValue={initialData?.Solucao} 
              disabled={isReadOnly} 
              placeholder="Descreva o serviço realizado, peças trocadas e resultados..." 
              className="w-full text-sm border border-gray-200 rounded-xl p-4 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* 4. SEÇÃO: VALOR E OBSERVAÇÕES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Valor Estimado / Total</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="number" 
                step="0.01" 
                name="Total" 
                defaultValue={initialData?.Total || 0} 
                disabled={isReadOnly} 
                className="w-full text-lg font-bold text-green-700 pl-10 pr-4 py-3 bg-green-50/30 border border-green-100 rounded-xl focus:border-[#38b473] focus:ring-[#38b473] transition-all" 
              />
            </div>
          </div>
          
          <div className="md:col-span-9">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Observações Internas (Não aparecem na impressão)</label>
            <input 
              name="Observacoes" 
              defaultValue={initialData?.Observacoes} 
              disabled={isReadOnly} 
              placeholder="Ex: Equipamento com riscos na carcaça. Urgência." 
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all" 
            />
          </div>
        </div>
      </div>

      {/* 5. SEÇÃO: ASSINATURAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assinatura do Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#1a1c23] px-5 py-4 flex items-center gap-2.5 text-white">
            <PenTool className="w-5 h-5 text-[#38b473]" />
            <h3 className="font-bold text-base tracking-tight">Assinatura do Cliente (Autorização)</h3>
          </div>
          <div className="p-6">
            <SignaturePad 
              onSave={setSigCliente} 
              initialImage={initialData?.AssinaturaCliente} 
              label="Assine para autorizar o serviço"
            />
          </div>
        </div>

        {/* Assinatura do Técnico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#1a1c23] px-5 py-4 flex items-center gap-2.5 text-white">
            <PenTool className="w-5 h-5 text-[#38b473]" />
            <h3 className="font-bold text-base tracking-tight">Responsável Técnico</h3>
          </div>
          <div className="p-6">
            <SignaturePad 
              onSave={setSigTecnico} 
              initialImage={initialData?.AssinaturaTecnico} 
              label="Assinatura do Técnico Responsável"
            />
          </div>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="flex gap-4 pt-4">
        {!isReadOnly ? (
          <>
            <button 
              type="submit" 
              disabled={isPending || !selectedClienteId} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-[#38b473] hover:bg-[#2e945e] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <Check className="w-5 h-5" />
              {isPending ? "Salvando..." : isEdit ? "Confirmar Alterações" : "Abrir Ordem de Serviço"}
            </button>
            <Link 
              href="/ordens-servico" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl transition-all"
            >
              <X className="w-5 h-5" /> Cancelar
            </Link>
          </>
        ) : (
          <Link 
            href={`/ordens-servico/edit/${initialData.Id}`} 
            className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-xl shadow-lg transition-all"
          >
            <Edit className="w-5 h-5" /> Editar O.S.
          </Link>
        )}
      </div>

    </form>
  );
}
