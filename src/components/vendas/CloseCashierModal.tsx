"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock, AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { fecharCaixa, getCaixaResumoSimples } from "@/actions/caixa";
import { useNotification } from "@/hooks/use-notification";

interface CloseCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caixaId: number;
  onSuccess: () => void;
}

export function CloseCashierModal({ isOpen, onClose, caixaId, onSuccess }: CloseCashierModalProps) {
  const [valorFechamento, setValorFechamento] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [resumo, setResumo] = useState<{ 
    saldoEsperado: number, 
    saldoEmDinheiro: number,
    vendasCount: number, 
    osCount: number,
    sangriasCount: number,
    suprimentosCount: number,
    totalSangrias: number,
    totalSuprimentos: number
  } | null>(null);
  const [isLoadingResumo, setIsLoadingResumo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { success, error } = useNotification();

  useEffect(() => {
    setMounted(true);
    if (isOpen && caixaId) {
      setIsLoadingResumo(true);
      getCaixaResumoSimples(caixaId).then(res => {
        if (res.success) setResumo(res.data);
      }).finally(() => setIsLoadingResumo(false));
    } else {
      setResumo(null);
      setValorFechamento("");
    }
  }, [isOpen, caixaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorFechamento) return;

    setIsPending(true);
    try {
      const res = await fecharCaixa(caixaId, Number(valorFechamento));
      if (res.success) {
        success("Caixa fechado com sucesso!");
        onSuccess();
        onClose();
      } else {
        error(res.error || "Erro ao fechar caixa.");
      }
    } catch (err) {
      error("Erro na comunicação com o servidor.");
    } finally {
      setIsPending(false);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 py-6 sm:py-12 overflow-y-auto px-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200 my-auto">
        
        {/* Header */}
        <div className="bg-[#e74c3c] p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 opacity-80" />
            <h2 className="text-lg font-bold uppercase tracking-tight">Fechar Caixa</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Resumo Parcial */}
          {isLoadingResumo ? (
             <div className="text-center py-2 text-gray-400 animate-pulse text-[10px] font-bold uppercase tracking-widest">Calculando saldo esperado...</div>
          ) : resumo && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Saldo Total</span>
                    <span className="text-sm font-black text-blue-600">{formatCurrency(resumo.saldoEsperado)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Dinheiro na Gaveta</span>
                    <span className="text-sm font-black text-green-600">{formatCurrency(resumo.saldoEmDinheiro)}</span>
                  </div>
               </div>

               <div className="pt-2 border-t border-gray-200/60 flex flex-wrap gap-x-3 gap-y-1">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase">
                     <TrendingUp className="w-3 h-3 text-blue-400" /> {resumo.vendasCount} V / {resumo.osCount} OS
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase">
                     <DollarSign className="w-3 h-3" /> - {formatCurrency(resumo.totalSangrias)}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase">
                     <TrendingUp className="w-3 h-3" /> + {formatCurrency(resumo.totalSuprimentos)}
                  </div>
               </div>
            </div>
          )}

          <div className="bg-red-50 border-l-4 border-red-500 p-3 flex gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[10px] font-bold">
              Confira o valor físico antes de confirmar. Esta ação é irreversível.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider">
              Valor Físico (Gaveta)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
              <input 
                autoFocus
                type="number" 
                step="0.01"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-xl font-black text-black outline-none focus:border-red-500 transition-all placeholder:text-gray-300"
                placeholder="0,00"
                value={valorFechamento}
                onChange={(e) => setValorFechamento(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button 
              type="submit"
              disabled={isPending || isLoadingResumo}
              className="w-full bg-[#e74c3c] hover:bg-red-700 text-white py-3 rounded-lg font-black text-base uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "PROCESSANDO..." : "FECHAR CAIXA"}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-2 text-gray-400 hover:text-black font-bold uppercase text-[9px] transition-colors"
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
