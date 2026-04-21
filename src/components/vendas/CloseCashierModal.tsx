"use client";

import React, { useState } from "react";
import { X, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { fecharCaixa } from "@/actions/caixa";
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
  const { success, error } = useNotification();

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Header */}
        <div className="bg-[#e74c3c] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 opacity-80" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Fechar Caixa</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 text-red-700">
            <AlertCircle className="w-8 h-8 shrink-0" />
            <p className="text-sm font-medium">
              Atenção: Ao fechar o caixa, você não poderá mais realizar vendas neste turno. 
              Confira o valor físico antes de confirmar.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-wide">
              Valor de Fechamento (Físico na Gaveta)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
              <input 
                autoFocus
                type="number" 
                step="0.01"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-2xl font-black text-black outline-none focus:border-red-500 transition-all placeholder:text-gray-300"
                placeholder="0,00"
                value={valorFechamento}
                onChange={(e) => setValorFechamento(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#e74c3c] hover:bg-red-700 text-white py-4 rounded-lg font-black text-lg uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "PROCESSANDO..." : "CONFIRMAR FECHAMENTO"}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-3 text-gray-500 hover:text-black font-bold uppercase text-xs transition-colors"
            >
              CANCELAR E CONTINUAR VENDENDO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
