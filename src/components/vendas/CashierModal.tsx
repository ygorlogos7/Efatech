"use client";

import React, { useState, useEffect, useRef } from "react";
import { Monitor, X, CheckCircle2, DollarSign, Wallet, MessageSquare, Calculator } from "lucide-react";
import { abrirCaixa } from "@/actions/caixa";
import { useNotification } from "@/hooks/use-notification";

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CashierModal({ isOpen, onClose, onSuccess }: CashierModalProps) {
  const [valor, setValor] = useState("0,00");
  const [observacoes, setObservacoes] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { success } = useNotification();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpen = async () => {
    setErrorMessage(null);
    setIsPending(true);
    try {
      const cleanedValue = valor.replace(/\./g, "").replace(",", ".");
      const numericValue = parseFloat(cleanedValue);
      
      if (isNaN(numericValue)) {
        setErrorMessage("Digite um valor válido.");
        setIsPending(false);
        return;
      }

      const formData = new FormData();
      formData.append("valorAbertura", numericValue.toString());
      formData.append("observacoes", observacoes || "Abertura manual");

      const res = await abrirCaixa(formData);
      
      if (res.success) {
        success("Caixa aberto com sucesso!");
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || "Erro ao abrir caixa.");
      }
    } catch (err: any) {
      setErrorMessage("Falha na conexão.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0c1a25]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#00b050]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">Abrir Novo Caixa</h3>
              <p className="text-xs text-gray-500 mt-1">Inicie as operações do dia</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Campo: Valor */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-gray-400" />
                Valor de Abertura (Fundo de Caixa)
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl group-focus-within:text-[#00b050] transition-colors">R$</span>
                <input 
                  ref={inputRef}
                  type="text"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full text-left text-3xl font-bold py-4 pl-14 pr-4 border border-gray-200 rounded-xl focus:border-[#00b050] focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-800 bg-gray-50 group-hover:bg-white"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Campo: Observações */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-[#00b050] focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-700 bg-gray-50 hover:bg-white resize-none"
                placeholder="Ex: Abertura para turno matutino..."
              />
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-700 font-bold text-xs uppercase tracking-wider">Erro na Abertura</p>
                  <p className="text-red-600 text-sm mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50/50 rounded-xl p-4 flex items-center gap-3 border border-blue-100/50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-blue-700 leading-tight">
                Um lançamento de abertura será gerado automaticamente em seu <strong>Fluxo de Caixa</strong> para controle financeiro.
              </p>
            </div>
          </div>

          <button 
            onClick={handleOpen}
            disabled={isPending}
            className="mt-8 w-full bg-[#00b050] hover:bg-green-600 text-white font-bold h-14 rounded-xl shadow-[0_8px_16px_-4px_rgba(0,176,80,0.3)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-base"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>PROCESSANDO...</span>
              </div>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                CONFIRMAR ABERTURA DO CAIXA
              </>
            )}
          </button>

          <div className="mt-6 flex justify-center items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-t border-gray-50 pt-6">
            <span>F2: VALOR</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>ENTER: CONFIRMAR</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>ESC: SAIR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
