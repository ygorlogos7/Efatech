import React from "react";
import { Home, FileSignature } from "lucide-react";
import Link from "next/link";
import { ContratoForm } from "@/components/forms/ContratoForm";

export default function CreateContratoServicoPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-2">
          <FileSignature className="w-8 h-8 text-[#38b473]" />
          Novo Contrato
        </h3>
        <div className="text-gray-500 text-xs font-bold flex items-center gap-1 uppercase tracking-widest">
          <Home className="w-4 h-4 mr-1 text-[#38b473]" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span className="opacity-30">&gt;</span>
          <Link href="/contratos/servicos" className="hover:underline">Contratos de Serviços</Link>
          <span className="opacity-30">&gt;</span>
          <span className="text-gray-400 font-black italic">Novo</span>
        </div>
      </div>
      <ContratoForm />
    </div>
  );
}
