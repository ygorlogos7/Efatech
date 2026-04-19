"use client";

import React, { useTransition } from "react";
import { createNota } from "@/actions/notas";
import { FileText, User, ShoppingBasket, DollarSign, Check, X } from "lucide-react";
import Link from "next/link";

export function NotaFiscalForm({ tipo = "produto" }: { tipo?: "produto" | "servico" }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const r = await createNota(tipo, formData);
      if (r?.success === false) {
        alert(r.error || "Falha ao emitir nota fiscal.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
           <User className="w-4 h-4 text-gray-500" />
           <h3 className="font-bold text-gray-700 uppercase tracking-tight">Dados do Destinatário</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5 underline decoration-[#38b473]/30">Nome / Razão Social *</label>
              <input type="text" name="Destinatario" required className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl px-4 py-3 text-sm focus:border-[#38b473] focus:bg-white transition-all font-bold" />
           </div>
           <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">CPF / CNPJ</label>
              <input type="text" name="CpfCnpj" className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl px-4 py-3 text-sm focus:border-[#38b473] focus:bg-white transition-all font-bold" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
           <DollarSign className="w-4 h-4 text-gray-500" />
           <h3 className="font-bold text-gray-700 uppercase tracking-tight">Valores da Nota</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Valor Total (R$) *</label>
              <input type="number" step="0.01" name="ValorTotal" required className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl px-4 py-3 text-sm focus:border-[#38b473] focus:bg-white transition-all font-bold" />
           </div>
           <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Série</label>
              <input type="number" name="Serie" defaultValue="1" className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl px-4 py-3 text-sm focus:border-[#38b473] focus:bg-white transition-all font-bold" />
           </div>
           <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Número</label>
              <input type="number" name="Numero" placeholder="Automático" className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl px-4 py-3 text-sm focus:border-[#38b473] focus:bg-white transition-all font-bold" />
           </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 pb-12">
         <button type="submit" disabled={isPending} className="bg-[#1a1c23] hover:bg-black text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-black/20 text-sm transition-all active:scale-95 flex items-center gap-2 uppercase tracking-tight">
            <Check className="w-5 h-5 text-[#38b473]" />
            {isPending ? "Processando transmissão..." : "Transmitir Nota Fiscal"}
         </button>
         <Link href={`/notas/${tipo === "produto" ? "produtos" : "servicos"}`} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 px-8 rounded-2xl text-sm transition-all flex items-center gap-2 uppercase">
            <X className="w-5 h-5" /> Cancelar
         </Link>
      </div>
    </form>
  );
}
