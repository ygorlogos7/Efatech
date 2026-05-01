"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createOrdemServico, updateOrdemServico } from "@/actions/ordensServico";
import { getClientes } from "@/actions/clientes";
import { getProdutos } from "@/actions/produtos";
import { getFormasPagamento } from "@/actions/financeiro";
import { 
  ClipboardList, Wrench, FileText, DollarSign, Check, X, Edit, 
  Search, User, PenTool, Calendar, Package, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";
import { useRouter } from "next/navigation";

interface OSFormProps {
  initialData?: any;
  isReadOnly?: boolean;
}

export function OSForm({ initialData, isReadOnly = false }: OSFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();
  const isEdit = !!initialData && !isReadOnly;

  // States for general select options
  const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
  const [selectedFormaPagamentoId, setSelectedFormaPagamentoId] = useState<number | null>(initialData?.FormaPagamentoId || null);

  // States for client (direct entry + search)
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialData?.Cliente?.Nome || "");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [clienteTelefone, setClienteTelefone] = useState(initialData?.Cliente?.Telefone || initialData?.Cliente?.TelefoneCelular || "");
  const [clienteCPF, setClienteCPF] = useState(initialData?.Cliente?.CPFCNPJ || "");
  const [clienteEmail, setClienteEmail] = useState(initialData?.Cliente?.Email || "");
  const [isSearching, setIsSearching] = useState(false);

  // States for equipment search (from products)
  const [produtos, setProdutos] = useState<any[]>([]);
  const [searchEquipamento, setSearchEquipamento] = useState(initialData?.Equipamento || "");
  const [isSearchingEquipamento, setIsSearchingEquipamento] = useState(false);

  // Load select options
  useEffect(() => {
    const loadOptions = async () => {
      const formaRes = await getFormasPagamento();
      if (formaRes.success) setFormasPagamento(formaRes.data || []);
    };
    loadOptions();
  }, []);

  // Load clients on search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2 && searchTerm !== initialData?.Cliente?.Nome) {
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
    if (!selectedFormaPagamentoId) {
      error("Por favor, selecione uma Forma de Pagamento.");
      return;
    }

    // Add custom fields to formData
    if (selectedClienteId) formData.append("ClienteId", selectedClienteId.toString());
    formData.append("ClienteNome", searchTerm);
    formData.append("ClienteTelefone", clienteTelefone);
    formData.append("ClienteCPF", clienteCPF);
    formData.append("ClienteEmail", clienteEmail);
    if (selectedFormaPagamentoId) formData.append("FormaPagamentoId", selectedFormaPagamentoId.toString());

    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateOrdemServico(initialData.Id, formData);
      } else {
        r = await createOrdemServico(formData);
      }

      if (r?.success) {
        success(isEdit ? "O.S. atualizada!" : "O.S. aberta com sucesso!");
        setTimeout(() => {
          if (!isEdit && (r as any).data) {
            window.location.href = `/ordens-servico/print/${(r as any).data.Id}`;
          } else {
            router.push("/ordens-servico");
          }
        }, 1000);
      } else {
        error((r as any)?.error || "Erro ao processar O.S.");
      }
    });
  };

  const formatDateForInput = (date: any) => {
    if (!date) {
      return new Date().toISOString().split("T")[0];
    }
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* 1. Dados do Cliente */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Dados do cliente</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome *</label>
            <input 
              type="text" 
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
              placeholder="Digite o nome do cliente"
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
            {/* Auto-fill Dropdown */}
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
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b last:border-0"
                  >
                    <span className="font-bold">{c.Nome}</span>
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
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Data de Previsão</label>
            <input 
              type="date" 
              name="DataPrevisao"
              defaultValue={formatDateForInput(initialData?.DataPrevisao)}
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
              <option value="true">Em Aberto</option>
              <option value="false">Finalizada</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Informações Técnicas */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Informações Técnicas</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Equipamento / Modelo *</label>
            <input 
              type="text" 
              name="Equipamento" 
              defaultValue={initialData?.Equipamento}
              disabled={isReadOnly}
              required
              placeholder="Ex: iPhone 13 Pro Max"
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Defeito Informado *</label>
              <textarea 
                name="Defeito" 
                rows={4}
                defaultValue={initialData?.Defeito}
                disabled={isReadOnly}
                required
                placeholder="Descreva o defeito relatado..."
                className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Solução / Laudo Técnico</label>
              <textarea 
                name="Solucao" 
                rows={4}
                defaultValue={initialData?.Solucao}
                disabled={isReadOnly}
                placeholder="Descreva o serviço realizado..."
                className="w-full text-sm border border-gray-300 rounded p-3 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Financeiro */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Financeiro</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Valor Total (R$) *</label>
            <input 
              type="number" 
              step="0.01" 
              name="Total"
              defaultValue={initialData?.Total || 0}
              disabled={isReadOnly}
              required
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed font-bold text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Forma de Pagamento *</label>
            <select 
              value={selectedFormaPagamentoId || ""} 
              onChange={(e) => setSelectedFormaPagamentoId(Number(e.target.value) || null)}
              disabled={isReadOnly}
              required
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Selecione</option>
              {formasPagamento.map(f => (
                <option key={f.Id} value={f.Id}>{f.Nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Observações Internas</label>
            <input 
              type="text" 
              name="Observacoes"
              defaultValue={initialData?.Observacoes}
              disabled={isReadOnly}
              placeholder="Ex: Riscos na tela"
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      {!isReadOnly && (
        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            disabled={isPending || !searchTerm} 
            className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-8 rounded shadow-sm text-sm transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isPending ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Confirmar & Abrir O.S.")}
          </button>
          <Link href="/ordens-servico" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-8 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>
      )}

      {isReadOnly && (
        <div className="flex gap-3 pt-2">
          <Link href={`/ordens-servico/edit/${initialData.Id}`} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded shadow-sm text-sm transition-colors">
            <Edit className="w-4 h-4" /> Editar O.S.
          </Link>
          <Link href="/ordens-servico" className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" /> Voltar
          </Link>
        </div>
      )}
    </form>
  );
}
