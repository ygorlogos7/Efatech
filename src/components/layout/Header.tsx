"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, Grid, Bell, User, LogOut, Settings, CreditCard, Layout } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/components/providers/SidebarProvider";
import Link from "next/link";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

export function Header({ userName, userEmail }: HeaderProps) {
  const { toggleSidebar } = useSidebar();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract initials (e.g. "Ygor Gomes" -> "YG")
  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(userName);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[60px] bg-[#1a1c23] flex items-center justify-between px-6 text-white shrink-0 shadow-md relative z-[100]">
      {/* Left section: Logo & Hamburger */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-xl font-bold tracking-tight select-none">
          <span>Efatech</span>
          <span className="text-[#38b473]">PRO</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-700 rounded-md transition-all text-gray-300 hover:text-white active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Right section: Icons & User */}
      <div className="flex items-center gap-5" ref={dropdownRef}>
        
        {/* Apps Grid Dropdown */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown('grid')}
            className={`p-1.5 rounded-md transition-colors ${activeDropdown === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
          >
            <Grid className="w-[18px] h-[18px]" />
          </button>
          
          {activeDropdown === 'grid' && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 text-gray-800 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Acesso Rápido</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "PDV", icon: ShoppingBasket, color: "bg-green-100 text-green-600", href: "/vendas/balcao" },
                  { label: "OS", icon: ClipboardList, color: "bg-blue-100 text-blue-600", href: "/ordens-servico" },
                  { label: "Financeiro", icon: Banknote, color: "bg-emerald-100 text-emerald-600", href: "/financeiro" },
                  { label: "Clientes", icon: Users, color: "bg-indigo-100 text-indigo-600", href: "/cadastros/clientes" },
                  { label: "Estoque", icon: Box, color: "bg-orange-100 text-orange-600", href: "/estoque" },
                  { label: "Config", icon: Settings, color: "bg-gray-100 text-gray-600", href: "/configuracoes/gerais" },
                ].map((app, i) => (
                  <Link key={i} href={app.href} className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className={`w-10 h-10 ${app.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {/* Using lowercase strings for simplicity since I can't easily pass Lucide icons here without more imports */}
                      <Layout className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium">{app.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown('bell')}
            className={`p-1.5 rounded-md transition-colors relative ${activeDropdown === 'bell' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#38b473] rounded-full border border-[#1a1c23]"></span>
          </button>

          {activeDropdown === 'bell' && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden text-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-sm">Notificações</h3>
                <span className="text-[10px] bg-[#38b473]/10 text-[#38b473] px-2 py-0.5 rounded-full font-bold">4 NOVAS</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { text: "Venda finalizada com sucesso (Nº 1245)", time: "Há 5 min", icon: "✅" },
                  { text: "Estoque baixo: Produto 'Teclado Gamer'", time: "Há 2 horas", icon: "⚠️" },
                  { text: "Novo cliente cadastrado: Maria Silva", time: "Há 4 horas", icon: "👤" },
                  { text: "Backup do sistema concluído", time: "Ontem", icon: "💾" },
                ].map((notif, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors">
                    <div className="flex gap-3">
                      <span className="text-xl">{notif.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{notif.text}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-center text-xs font-bold text-gray-400 hover:bg-gray-50 hover:text-[#38b473] transition-colors">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-700 relative">
          <button 
            onClick={() => toggleDropdown('user')}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#1a1c23] font-bold text-sm select-none cursor-pointer hover:bg-gray-100 transition-transform active:scale-95 shadow-sm"
          >
            {initials}
          </button>

          {activeDropdown === 'user' && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-gray-50/50 border-b border-gray-50">
                <p className="text-sm font-bold truncate">{userName || "Usuário"}</p>
                <p className="text-[10px] text-gray-500 truncate">{userEmail || "email@efatech.com"}</p>
              </div>
              <div className="p-1">
                <Link href="/configuracoes/usuarios" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors">
                  <User className="w-4 h-4" /> Meu Perfil
                </Link>
                <Link href="/configuracoes/gerais" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors">
                  <Settings className="w-4 h-4" /> Configurações
                </Link>
                <Link href="/configuracoes/plano" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-50 pb-3 mb-1">
                  <CreditCard className="w-4 h-4" /> Meu Plano
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-md hover:bg-red-50 text-red-500 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sair do Sistema
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Stub for missing icons in mapping loop
function ShoppingBasket(props: any) { return <Layout {...props} /> }
function ClipboardList(props: any) { return <Layout {...props} /> }
function Banknote(props: any) { return <Layout {...props} /> }
function Users(props: any) { return <Layout {...props} /> }
function Box(props: any) { return <Layout {...props} /> }
