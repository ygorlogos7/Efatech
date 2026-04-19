"use client";

import React, { useTransition } from "react";
import { createContrato } from "@/actions/contratos";
import { FileSignature, User, DollarSign, Check, X, Calendar } from "lucide-react";
import Link from "next/link";

export function ContratoForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const r = await createContrato(formData);
      if (r?.success === false) {
        alert(r.error || "Erro ao salvar contrato.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
             <FileSignature className="w-4 h-4 text-[#38b473]" />
             <h3 className="font-bold text-gray-700 uppercase tracking-tight">Detalhes do Contrato</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-black">
             <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1 tracking-widest">Número do Contrato</label>
                <input type="number" name="Numero" placeholder="Gerado automaticamente" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#38b473] transition-all italic" />
             </div>
             <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1 tracking-widest text-[#38b473]">Valor Mensal (R$) *</label>
                <input type="number" step="0.01" name="ValorMensal" required className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#38b473] transition-all italic" />
             </div>
             <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1 tracking-widest">Início Vigência *</label>
                <input type="date" name="DataInicio" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#38b473] transition-all italic" />
             </div>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
             <User className="w-4 h-4 text-gray-400" />
             <h3 className="font-bold text-gray-700 uppercase tracking-tight">Observações Adicionais</h3>
          </div>
          <div className="p-6">
             <textarea name="Observacoes" rows={4} className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#38b473] transition-all font-bold" placeholder="Digite termos contratuais ou observações internas..."></textarea>
          </div>
       </div>

       <div className="flex gap-4 pb-12">
          <button type="submit" disabled={isPending} className="bg-[#1a1c23] hover:bg-black text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-black/20 text-sm transition-all active:scale-95 flex items-center gap-2 uppercase tracking-tight italic">
             <Check className="w-5 h-5 text-[#38b473]" />
             {isPending ? "Processando..." : "Firmar Contrato"}
          </button>
          <Link href="/contratos/servicos" className="bg-white border-2 border-gray-50 hover:bg-gray-50 text-gray-400 font-bold py-4 px-8 rounded-2xl text-sm transition-all flex items-center gap-2 uppercase">
             <X className="w-5 h-5" /> Cancelar
          </Link>
       </div>
    </form>
  );
}
