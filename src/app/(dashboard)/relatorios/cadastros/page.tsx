"use client";

import React from "react";
import { List, Users, ShoppingBasket, Box, Package, UserCheck, Search, Filter } from "lucide-react";

export default function RelatoriosCadastrosPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
              <List className="w-8 h-8 text-[#38b473]" /> Relatório de Cadastros
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Visão Geral da Base de Dados</p>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center gap-4 group cursor-pointer hover:border-[#38b473] transition-all">
             <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
             </div>
             <div>
                <p className="font-black text-gray-900 uppercase tracking-tighter">Clientes Cadastrados</p>
                <p className="text-gray-400 font-bold">Total: --</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center gap-4 group cursor-pointer hover:border-[#38b473] transition-all">
             <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#38b473] group-hover:bg-[#38b473] group-hover:text-white transition-all">
                <Box className="w-6 h-6" />
             </div>
             <div>
                <p className="font-black text-gray-900 uppercase tracking-tighter">Produtos Ativos</p>
                <p className="text-gray-400 font-bold">Total: --</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center gap-4 group cursor-pointer hover:border-[#38b473] transition-all">
             <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-all">
                <UserCheck className="w-6 h-6" />
             </div>
             <div>
                <p className="font-black text-gray-900 uppercase tracking-tighter">Fornecedores</p>
                <p className="text-gray-400 font-bold">Total: --</p>
             </div>
          </div>
       </div>
    </div>
  );
}
