"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createOrcamento, updateOrcamento } from "@/actions/orcamentos";
import { getClientes } from "@/actions/clientes";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, FileText, DollarSign, Check, X, Edit, 
  Search, User, PenTool, Calendar, Package, AlertCircle, Printer
} from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";

interface OrcamentoFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function OrcamentoProdutosForm({ initialData, isReadOnly = false }: OrcamentoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();
  const isEdit = !!initialData && !isReadOnly;

  // States for search and selection
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialData?.Clientes?.Nome || "");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [isSearching, setIsSearching] = useState(false);

  // Signatures removed as per user request

  // Load clients on search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2 && !selectedClienteId) {
        setIsSearching(true);
        const res = await getClientes(searchTerm);
        if (res.success && res.data) setClientes(res.data || []);
        setIsSearching(false);
      } else {
        setClientes([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedClienteId]);

  const handleSubmit = (formData: FormData) => {
    // Cliente opcional conforme solicitado
    if (selectedClienteId) {
        formData.append("ClienteId", selectedClienteId.toString());
    }
    // Orçamento gratuito e sem assinatura direta no tablet

    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateOrcamento(initialData.Id, formData);
      } else {
        r = await createOrcamento(formData);
      }

      if (r?.success && (r as any).data?.Id) {
        success(isEdit ? "Orçamento atualizado!" : "Orçamento criado com sucesso!");
        if (!isEdit) {
          router.push(`/orcamentos/produtos/print/${(r as any).data.Id}`);
        }
      } else {
        error((r as any)?.error || "Erro ao processar orçamento.");
      }
    });
  };

  const formatDateForInput = (date: any) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* 1. SEÇÃO: CLIENTE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#1a1c23] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <User className="w-5 h-5 text-[#38b473]" />
            <h3 className="font-bold text-base tracking-tight">Identificação do Cliente</h3>
          </div>
          {isEdit && (
            <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-mono uppercase">
              Orçamento Nº {initialData.Numero}
            </span>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
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
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedClienteId) setSelectedClienteId(null);
                }}
                disabled={isReadOnly}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-[#38b473] focus:border-[#38b473] transition-all bg-gray-50/30"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-[#38b473] border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            {clientes.length > 0 && !isReadOnly && (
              <div className="absolute z-10 w-[calc(100%-48px)] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
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
                      <p className="text-[10px] text-gray-500">{c.CPFCNPJ || "Sem documento"}</p>
                    </div>
                    {selectedClienteId === c.Id && <Check className="w-4 h-4 text-[#38b473]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO: DADOS DO ORÇAMENTO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#1a1c23] px-5 py-4 flex items-center gap-2.5 text-white">
          <Calendar className="w-5 h-5 text-[#38b473]" />
          <h3 className="font-bold text-base tracking-tight">Validade e Prazos</h3>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Data de Validade</label>
            <div className="relative">
              <input 
                type="date" 
                name="DataValidade" 
                defaultValue={formatDateForInput(initialData?.DataValidade)} 
                disabled={isReadOnly} 
                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all" 
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-300 pointer-events-none" />
            </div>
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Situação</label>
            <select 
              name="Ativo" 
              defaultValue={initialData ? (initialData.Ativo ? "true" : "false") : "true"} 
              disabled={isReadOnly} 
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all cursor-pointer font-medium"
            >
              <option value="true">🟢 Aberto / Em Negociação</option>
              <option value="false">🔴 Encerrado / Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: DESCRIÇÃO DOS PRODUTOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-[#1a1c23] px-5 py-4 flex items-center gap-2.5 text-white border-b border-gray-800">
            <Package className="w-5 h-5 text-[#38b473]" />
            <h3 className="font-bold text-base tracking-tight">Descrição dos Produtos / Serviços</h3>
          </div>
          <div className="p-6 flex-1">
            <textarea 
              name="Descricao" 
              rows={8} 
              defaultValue={initialData?.Descricao} 
              disabled={isReadOnly} 
              placeholder="Descreva detalhadamente os produtos ou serviços deste orçamento..." 
              className="w-full text-sm border border-gray-200 rounded-xl p-4 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all resize-none shadow-inner"
            ></textarea>
          </div>
      </div>

      {/* Seção Financeira Removida (Orçamento Gratuito) */}
      <input type="hidden" name="Total" value="0" />
      <input type="hidden" name="Desconto" value="0" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Observações Internas</label>
            <input 
              name="Observacoes" 
              defaultValue={initialData?.Observacoes} 
              disabled={isReadOnly} 
              placeholder="Ex: Cliente tem pressa. Orçamento válido por tempo limitado." 
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 bg-gray-50/30 focus:border-[#38b473] focus:ring-[#38b473] transition-all" 
            />
        </div>
      </div>
      {/* Assinatura removida - Cliente assina no papel impresso conforme solicitado */}

      {/* AÇÕES */}
      <div className="flex gap-4 pt-4">
        {!isReadOnly ? (
          <>
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-[#38b473] hover:bg-[#2e945e] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <Check className="w-5 h-5" />
              {isPending ? "Salvando..." : isEdit ? "Confirmar Alterações" : "Salvar Orçamento"}
            </button>
            <Link 
              href="/orcamentos/produtos" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl transition-all"
            >
              <X className="w-5 h-5" /> Cancelar
            </Link>
          </>
        ) : (
          <Link 
            href={`/orcamentos/produtos/edit/${initialData.Id}`} 
            className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-xl shadow-lg transition-all"
          >
            <Edit className="w-5 h-5" /> Editar Orçamento
          </Link>
        )}
      </div>

    </form>
  );
}
