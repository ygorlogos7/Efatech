"use client";

import React from "react";
import { Star, CheckCircle2, Zap, ShieldCheck, Diamond } from "lucide-react";

export default function MeuPlanoPage() {
  return (
    <div className="space-y-8 max-w-6xl">
       <div className="bg-[#1a1c23] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
             <Diamond className="w-48 h-48" />
          </div>
          <div className="relative">
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#38b473] mb-4">
                <Star className="w-4 h-4 fill-[#38b473]" /> Status do Assinante
             </div>
             <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Efatech Premium</h2>
             <p className="text-gray-400 max-w-md text-lg leading-relaxed">Você possui acesso total a todos os módulos, emissão ilimitada de notas e suporte prioritário 24/7.</p>
             <div className="mt-8 flex items-center gap-6">
                <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Próxima Renovação</p>
                   <p className="text-xl font-black">15 de Abril, 2026</p>
                </div>
                <button className="bg-[#38b473] hover:bg-green-500 text-black font-black px-8 py-4 rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-95">RENOVAR PLANO</button>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
             <Zap className="w-10 h-10 text-yellow-500 mb-4" />
             <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-2 italic">Emissões Ilimitadas</h4>
             <p className="text-sm text-gray-500 leading-relaxed">Nota Fiscal de Produto (NFe), Serviço (NFSe) e Consumidor (NFCe) sem taxas extras.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
             <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
             <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-2 italic">Backups Diários</h4>
             <p className="text-sm text-gray-500 leading-relaxed">Seus dados protegidos com redundância em múltiplos servidores NeonDB e AWS.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center items-center gap-3 border-dashed border-4 border-gray-100 group cursor-pointer hover:border-[#38b473]/30 transition-all">
             <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-[#38b473]" />
             </div>
             <span className="text-sm font-black text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-widest">Ver outros planos</span>
          </div>
       </div>
    </div>
  );
}
