"use client";

import React from "react";
import { Users, UserPlus, Shield, User, Search, MoreVertical, Trash2, Edit3, Key } from "lucide-react";

export default function UsuariosConfigPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-2 uppercase">
              <Users className="w-7 h-7 text-[#38b473]" /> Time & Colaboração
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Gerencie permissões e acessos da sua conta</p>
         </div>
         <button className="bg-[#38b473] hover:bg-green-500 text-black font-black py-3 px-8 rounded-2xl shadow-xl shadow-green-500/20 text-sm active:scale-95 transition-all flex items-center gap-2 group">
            <UserPlus className="w-4 h-4 transition-transform group-hover:scale-125" />
            CONVIDAR USUÁRIO
         </button>
       </div>

       <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
             <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#38b473] transition-colors" />
                <input type="text" placeholder="Filtrar por nome, e-mail ou cargo..." className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-100 rounded-xl focus:border-[#38b473]/50 focus:ring-4 focus:ring-[#38b473]/5 shadow-inner transition-all font-bold" />
             </div>
          </div>

          <table className="w-full text-sm text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">
                   <th className="py-5 px-8">Membro</th>
                   <th className="py-5 px-6">Cargo / Perfil</th>
                   <th className="py-5 px-6 text-center">Acesso</th>
                   <th className="py-5 px-6 text-center">Status</th>
                   <th className="py-5 px-8 text-right">Controle</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50/50 transition-colors group">
                   <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-indigo-50">
                            <User className="w-5 h-5 text-indigo-600" />
                         </div>
                         <div>
                            <p className="font-black text-gray-900 group-hover:text-[#38b473] transition-colors italic uppercase tracking-tighter">Ygor Gornati (Admin)</p>
                            <p className="text-[11px] font-bold text-gray-400">adm@efatech.com.br</p>
                         </div>
                      </div>
                   </td>
                   <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                         <Shield className="w-3.5 h-3.5 text-[#38b473]" />
                         <span className="font-black text-[11px] text-gray-700 uppercase tracking-widest">Administrador Master</span>
                      </div>
                   </td>
                   <td className="py-5 px-6 text-center">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Acesso Irrestrito</span>
                   </td>
                   <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-[10px] font-black animate-in zoom-in duration-300">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> ONLINE
                      </div>
                   </td>
                   <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 bg-gray-50 text-gray-400 hover:text-[#38b473] hover:bg-green-50 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                         <button className="p-2 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Key className="w-4 h-4" /></button>
                         <button className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>
  );
}
