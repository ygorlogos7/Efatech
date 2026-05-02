"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createOrcamento, updateOrcamento } from "@/actions/orcamentos";
import { getClientes } from "@/actions/clientes";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, Check, X, Edit, 
  Search, User, Calendar, Package, DollarSign, Wrench
} from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";

interface OrcamentoFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function OrcamentoServicosForm({ initialData, isReadOnly = false }: OrcamentoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();
  const isEdit = !!initialData && !isReadOnly;

  // States for search and selection
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialData?.Clientes?.Nome || "");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [isSearching, setIsSearching] = useState(false);

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
    if (selectedClienteId) {
        formData.append("ClienteId", selectedClienteId.toString());
    }

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
          router.push(`/orcamentos/servicos/print/${(r as any).data.Id}`);
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
    <form action={handleSubmit} className="space-y-6 max-w-5xl pb-20">
      
      {/* 1. SEÇÃO: CLIENTE */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Identificação do Cliente</h3>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12">
            <label className="block text-xs font-bold text-gray-700 mb-1">Buscar Cliente</label>
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
                className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-3 w-3 border-2 border-[#00a859] border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            {clientes.length > 0 && !isReadOnly && (
              <div className="absolute z-10 w-[calc(100%-48px)] mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                {clientes.map((c) => (
                  <button
                    key={c.Id}
                    type="button"
                    onClick={() => {
                      setSelectedClienteId(c.Id);
                      setSearchTerm(c.Nome);
                      setClientes([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{c.Nome}</p>
                      <p className="text-[10px] text-gray-500">{c.CPFCNPJ || "Sem documento"}</p>
                    </div>
                    {selectedClienteId === c.Id && <Check className="w-4 h-4 text-[#00a859]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. SEÇÃO: DADOS DO ORÇAMENTO */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Validade e Prazos</h3>
          </div>
          
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Data de Validade</label>
              <input 
                type="date" 
                name="DataValidade" 
                defaultValue={formatDateForInput(initialData?.DataValidade)} 
                disabled={isReadOnly} 
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Situação</label>
              <select 
                name="Ativo" 
                defaultValue={initialData ? (initialData.Ativo ? "true" : "false") : "true"} 
                disabled={isReadOnly} 
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="true">Aberto / Em Negociação</option>
                <option value="false">Encerrado / Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. SEÇÃO: OBSERVACÕES */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Informações Adicionais</h3>
          </div>
          <div className="p-5">
              <label className="block text-xs font-bold text-gray-700 mb-1">Observações Internas</label>
              <textarea 
                name="Observacoes" 
                defaultValue={initialData?.Observacoes} 
                disabled={isReadOnly} 
                rows={4}
                placeholder="Ex: Cliente tem pressa. Orçamento válido por tempo limitado." 
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none" 
              />
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: DESCRIÇÃO DOS SERVIÇOS */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Descrição dos Serviços</h3>
          </div>
          <div className="p-5">
            <textarea 
              name="Descricao" 
              rows={10} 
              defaultValue={initialData?.Descricao} 
              disabled={isReadOnly} 
              placeholder="Descreva detalhadamente os serviços deste orçamento..." 
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            ></textarea>
          </div>
      </div>

      <input type="hidden" name="Total" value="0" />
      <input type="hidden" name="Desconto" value="0" />

      {/* AÇÕES */}
      <div className="flex gap-3 pt-2">
        {!isReadOnly ? (
          <>
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isPending ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Salvar Orçamento")}
            </button>
            <Link 
              href="/orcamentos/servicos" 
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </>
        ) : (
          <>
            <Link 
              href={`/orcamentos/servicos/edit/${initialData.Id}`} 
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar Orçamento
            </Link>
            <Link 
              href="/orcamentos/servicos" 
              className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Voltar
            </Link>
          </>
        )}
      </div>

    </form>
  );
}
