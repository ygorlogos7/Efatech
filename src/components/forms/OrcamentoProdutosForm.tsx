"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createOrcamento, updateOrcamento } from "@/actions/orcamentos";
import { getClientes } from "@/actions/clientes";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, Check, X, Edit, 
  Search, User, Calendar, Package, DollarSign
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

  // States for client (direct entry + search)
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialData?.Clientes?.Nome || "");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [clienteTelefone, setClienteTelefone] = useState(initialData?.Clientes?.Telefone || initialData?.Clientes?.TelefoneCelular || "");
  const [clienteCPF, setClienteCPF] = useState(initialData?.Clientes?.CPFCNPJ || "");
  const [clienteEmail, setClienteEmail] = useState(initialData?.Clientes?.Email || "");
  const [isSearching, setIsSearching] = useState(false);

  // Load clients on search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2 && searchTerm !== initialData?.Clientes?.Nome) {
        setIsSearching(true);
        const res = await getClientes(searchTerm);
        if (res.success && res.data) setClientes(res.data || []);
        setIsSearching(false);
      } else {
        setClientes([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, initialData]);

  const handleSubmit = (formData: FormData) => {
    if (selectedClienteId) formData.append("ClienteId", selectedClienteId.toString());
    formData.append("ClienteNome", searchTerm);
    formData.append("ClienteTelefone", clienteTelefone);
    formData.append("ClienteCPF", clienteCPF);
    formData.append("ClienteEmail", clienteEmail);

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
    if (!date) return new Date().toISOString().split("T")[0];
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
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              placeholder="Digite o nome do cliente"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value === "") {
                  setSelectedClienteId(null);
                  setClienteTelefone("");
                  setClienteCPF("");
                  setClienteEmail("");
                }
              }}
              disabled={isReadOnly}
              required
              className="block w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            
            {clientes.length > 0 && !isReadOnly && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-48 overflow-y-auto">
                {clientes.map((c) => (
                  <button
                    key={c.Id}
                    type="button"
                    onClick={() => {
                      setSelectedClienteId(c.Id);
                      setSearchTerm(c.Nome);
                      setClienteTelefone(c.Telefone || c.TelefoneCelular || "");
                      setClienteCPF(c.CPFCNPJ || "");
                      setClienteEmail(c.Email || "");
                      setClientes([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b last:border-0 transition-colors"
                  >
                    <span className="font-bold text-gray-800">{c.Nome}</span>
                    <span className="text-[10px] text-gray-400 ml-2">{c.CPFCNPJ || "S/ Documento"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Telefone Principal</label>
            <input 
              type="text" 
              value={clienteTelefone}
              onChange={(e) => setClienteTelefone(e.target.value)}
              disabled={isReadOnly}
              placeholder="(00) 00000-0000"
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CPF/CNPJ</label>
            <input 
              type="text" 
              value={clienteCPF}
              onChange={(e) => setClienteCPF(e.target.value)}
              disabled={isReadOnly}
              placeholder="000.000.000-00"
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={clienteEmail}
              onChange={(e) => setClienteEmail(e.target.value)}
              disabled={isReadOnly}
              placeholder="cliente@email.com"
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
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

      {/* 3. SEÇÃO: DESCRIÇÃO DOS PRODUTOS */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Descrição dos Produtos / Serviços</h3>
          </div>
          <div className="p-5">
            <textarea 
              name="Descricao" 
              rows={10} 
              defaultValue={initialData?.Descricao} 
              disabled={isReadOnly} 
              placeholder="Descreva detalhadamente os produtos ou serviços deste orçamento..." 
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
              href="/orcamentos/produtos" 
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </>
        ) : (
          <>
            <Link 
              href={`/orcamentos/produtos/edit/${initialData.Id}`} 
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar Orçamento
            </Link>
            <Link 
              href="/orcamentos/produtos" 
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
