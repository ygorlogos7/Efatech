"use client";

import React, { useState, useTransition } from "react";
import { getEmpresa, updateEmpresa } from "@/actions/configuracoes";
import { Briefcase, Building2, MapPin, Mail, Phone, Hash, Save, ShieldCheck } from "lucide-react";

export default function DadosEmpresaPage() {
  const [data, setData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getEmpresa();
      if (r.success) setData(r.data);
    });
  }, []);

  const handleUpdate = async (formData: FormData) => {
    const r = await updateEmpresa(formData);
    if (r.success) {
      alert("Dados atualizados com sucesso!");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-3">
          <Building2 className="w-8 h-8 text-[#38b473]" />
          Dados da Empresa
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-[#38b473] text-[10px] font-bold rounded-full border border-green-100">
           <ShieldCheck className="w-3.5 h-3.5" /> AMBIENTE SEGURO
        </div>
      </div>

      <form action={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group">
          <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Identidade Fiscal</span>
             <Hash className="w-4 h-4 text-gray-300 group-hover:text-[#38b473] transition-colors" />
          </div>
          <div className="p-6 space-y-4">
             <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase mb-1.5 ml-1">Razão Social *</label>
                <input type="text" name="RazaoSocial" defaultValue={data?.RazaoSocial} required className="w-full bg-gray-50/50 px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-[#38b473] focus:bg-white focus:ring-4 focus:ring-[#38b473]/5 transition-all font-bold text-gray-800" />
             </div>
             <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase mb-1.5 ml-1">CNPJ *</label>
                <input type="text" name="Cnpj" defaultValue={data?.Cnpj} required className="w-full bg-gray-50/50 px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-[#38b473] focus:bg-white focus:ring-4 focus:ring-[#38b473]/5 transition-all font-bold text-gray-800" />
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group">
          <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Contato e Endereço</span>
             <MapPin className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="p-6 space-y-4">
             <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase mb-1.5 ml-1">E-mail Corporativo</label>
                <input type="email" name="Email" defaultValue={data?.Email} className="w-full bg-gray-50/50 px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-[#38b473] focus:bg-white focus:ring-4 focus:ring-[#38b473]/5 transition-all font-bold text-gray-800" />
             </div>
             <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase mb-1.5 ml-1">Telefone Principal</label>
                <input type="text" name="Telefone" defaultValue={data?.Telefone} className="w-full bg-gray-50/50 px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-[#38b473] focus:bg-white focus:ring-4 focus:ring-[#38b473]/5 transition-all font-bold text-gray-800" />
             </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-6">
           <button type="submit" className="flex items-center gap-2 bg-[#1a1c23] hover:bg-black text-white font-black py-4 px-10 rounded-2xl shadow-2xl shadow-black/20 text-sm transition-all active:scale-95 group">
              <Save className="w-4 h-4 text-gray-500 group-hover:text-[#38b473] transition-colors" />
              SALVAR ALTERAÇÕES
           </button>
        </div>
      </form>
    </div>
  );
}
