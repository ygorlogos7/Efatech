"use client";

import React from "react";
import { MessageSquare, PlusCircle } from "lucide-react";

export default function AtendimentoCanaisPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 text-3xl font-bold text-gray-900">
        <h2>Canais de Atendimento</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Novo Canal
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-12 text-center text-gray-500">
         <div className="flex justify-center gap-6 mb-4 opacity-30">
            <MessageSquare className="w-10 h-10" />
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold italic">W</div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">f</div>
         </div>
         <p>Integre seus canais: WhatsApp, Instagram, Messenger e E-mail.</p>
      </div>
    </div>
  );
}
