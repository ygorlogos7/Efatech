"use client";

import React, { useState } from "react";
import { X, DollarSign, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { lancarSangria, lancarSuprimento } from "@/actions/caixa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  type: "sangria" | "suprimento";
}

export function MovimentacaoCaixaModal({ isOpen, onClose, sessionId, type }: Props) {
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  const isSangria = type === "sangria";
  const title = isSangria ? "Realizar Sangria (Retirada)" : "Realizar Suprimento (Entrada)";
  const colorClass = isSangria ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50";
  const buttonClass = isSangria ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("valor", valor);
    formData.append("descricao", descricao);
    formData.append("sessionId", sessionId.toString());

    const action = isSangria ? lancarSangria : lancarSuprimento;
    const resp = await action(formData);

    setLoading(false);
    if (resp.success) {
      setStatus({ type: "success", message: resp.message || "Operação realizada!" });
      setTimeout(() => {
        onClose();
        setValor("");
        setDescricao("");
        setStatus(null);
      }, 2000);
    } else {
      setStatus({ type: "error", message: resp.error || "Ocorreu um erro." });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colorClass}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-black text-gray-800 tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {status && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">{status.message}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Valor da Operação</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-blue-500 transition-colors">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-black text-xl text-gray-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Descrição / Motivo</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder={isSangria ? "Ex: Pagamento de fornecedor, retirada para banco..." : "Ex: Troco inicial extra, entrada manual..."}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-sm text-gray-700 min-h-[100px] transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 ${buttonClass}`}
          >
            {loading ? "Processando..." : `Confirmar ${isSangria ? "Retirada" : "Entrada"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
