"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { success } = useNotification();

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-[#0c1a25]/75 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto py-6 sm:py-12 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#00b050]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">Abrir Novo Caixa</h3>
              <p className="text-[10px] text-gray-500 mt-1">Inicie as operações do dia</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-4">
            {/* Campo: Valor */}
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Calculator className="w-3 h-3 text-gray-400" />
                Valor de Abertura
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-[#00b050] transition-colors">R$</span>
                <input 
                  ref={inputRef}
                  type="text"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full text-left text-xl font-bold py-2.5 pl-12 pr-4 border border-gray-200 rounded-lg focus:border-[#00b050] focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-800 bg-gray-50 group-hover:bg-white"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Campo: Observações */}
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-gray-400" />
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:border-[#00b050] focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-700 bg-gray-50 hover:bg-white resize-none"
                placeholder="Opcional..."
              />
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-100 p-2.5 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2">
                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-2.5 h-2.5 text-red-600" />
                </div>
                <p className="text-red-600 text-[11px] font-medium leading-tight">{errorMessage}</p>
              </div>
            )}

            <div className="bg-blue-50/50 rounded-lg p-2.5 flex items-center gap-2.5 border border-blue-100/50">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-[10px] text-blue-700 leading-tight">
                Um lançamento de abertura será gerado no <strong>Fluxo de Caixa</strong>.
              </p>
            </div>
          </div>

          <button 
            onClick={handleOpen}
            disabled={isPending}
            className="mt-5 w-full bg-[#00b050] hover:bg-green-600 text-white font-bold h-11 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-widest"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>PROCESSANDO...</span>
              </div>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                CONFIRMAR ABERTURA
              </>
            )}
          </button>

          <div className="mt-4 flex justify-center items-center gap-3 text-gray-400 text-[8px] font-bold uppercase tracking-widest border-t border-gray-50 pt-4">
            <span>F2: VALOR</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>ENTER: CONFIRMAR</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>ESC: SAIR</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
