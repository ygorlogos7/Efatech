"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Settings, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  ComposedChart, Line
} from "recharts";
import { getDashboardData } from "@/actions/dashboard";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function HomeClient({
  userDisplayName,
}: {
  userDisplayName: string | null;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then((result) => {
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    });
  }, []);

  const totalReceberHoje = data?.totalReceberHoje ?? 0;
  const totalPagarHoje = data?.totalPagarHoje ?? 0;
  const recebimentos = data?.recebimentos ?? { realizado: 0, falta: 0, previsto: 0, percentual: 0 };
  const pagamentos = data?.pagamentos ?? { realizado: 0, falta: 0, previsto: 0, percentual: 0 };
  const fluxoData = data?.fluxoData ?? [];
  const vendasData = data?.vendasData ?? [];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  // Gerar calendário dinâmico
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();

  const calendarRows: any[][] = [];
  let dayCounter = 1;
  let nextMonthDay = 1;
  for (let week = 0; week < 5; week++) {
    const row: any[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const cellIndex = week * 7 + dow;
      if (cellIndex < firstDay) {
        row.push({ val: daysInPrevMonth - firstDay + cellIndex + 1, dim: true });
      } else if (dayCounter <= daysInMonth) {
        if (dayCounter === now.getDate()) {
          row.push({ val: dayCounter, active: true });
        } else {
          row.push(dayCounter);
        }
        dayCounter++;
      } else {
        row.push({ val: nextMonthDay, dim: true });
        nextMonthDay++;
      }
    }
    calendarRows.push(row);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl text-[#1a2b3c] font-medium tracking-tight">
          {greeting}
          {userDisplayName ? `, ${userDisplayName}` : ""}
        </h1>
        <div className="text-sm text-[#5a6c7d] flex items-center gap-1.5 font-medium">
          <Home className="w-4 h-4" /> <span>Inicio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Receber Hoje */}
        <div className="bg-[#28a745] text-white rounded-lg shadow-md shadow-[#28a745]/25 p-5 min-h-[140px] flex flex-col relative overflow-hidden group">
          <h3 className="font-semibold text-sm mb-2 text-white/95">A receber hoje</h3>
          <p className="text-3xl font-bold flex-1">
            {loading ? "..." : formatCurrency(totalReceberHoje)}
          </p>
          <Link href="/financeiro/contas-receber" className="text-xs bg-[#218838] py-2 px-3 mt-4 rounded-md hover:bg-[#1e7e34] transition-colors w-full flex justify-between items-center text-white decoration-transparent">
            <span>Ir para contas a receber</span> <span>&rarr;</span>
          </Link>
          <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-24 h-24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
        </div>

        {/* Card 2: Pagar Hoje */}
        <div className="bg-[#dc3545] text-white rounded-lg shadow-md shadow-[#dc3545]/25 p-5 min-h-[140px] flex flex-col relative overflow-hidden group">
          <h3 className="font-semibold text-sm mb-2 text-white/95">A pagar hoje</h3>
          <p className="text-3xl font-bold flex-1">
            {loading ? "..." : formatCurrency(totalPagarHoje)}
          </p>
          <Link href="/financeiro/contas-pagar" className="text-xs bg-[#c82333] py-2 px-3 mt-4 rounded-md hover:bg-[#bd2130] transition-colors w-full flex justify-between items-center text-white decoration-transparent">
            <span>Ir para contas a pagar</span> <span>&rarr;</span>
          </Link>
          <div className="absolute -right-2 -bottom-4 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-24 h-24"><path d="M3 3h18v18H3zM12 8v8M8 12h8"/></svg>
          </div>
        </div>

        {/* Card 3: Recebimentos (âmbar — destaque visual) */}
        <div className="bg-[#ffc107] text-[#212529] rounded-lg shadow-md shadow-[#ffc107]/35 p-5 min-h-[140px] flex flex-col relative group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-sm text-[#212529]/95">Recebimentos do mes</h3>
            <Settings className="w-4 h-4 text-[#212529]/70" />
          </div>
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0 text-[#212529]">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="150" strokeDashoffset={150 - (150 * (recebimentos.percentual)) / 100} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#212529]">
                {loading ? "..." : `${recebimentos.percentual}%`}
              </div>
            </div>
            <div className="text-xs text-[#212529]/90 space-y-1">
              <p>Realizado: {loading ? "..." : formatCurrency(recebimentos.realizado)}</p>
              <p>Falta: {loading ? "..." : formatCurrency(recebimentos.falta)}</p>
              <p>Previsto: {loading ? "..." : formatCurrency(recebimentos.previsto)}</p>
            </div>
          </div>
          <Link href="/financeiro/fluxo-caixa" className="text-xs w-full text-center mt-3 py-2 rounded-md bg-[#e0a800] hover:bg-[#d39e00] text-[#212529] font-semibold transition-colors block">
            Ir para fluxo de caixa &rarr;
          </Link>
        </div>

        {/* Card 4: Pagamentos */}
        <div className="bg-[#007bff] text-white rounded-lg shadow-md shadow-[#007bff]/25 p-5 min-h-[140px] flex flex-col relative group">
          <div className="flex justify-between items-start mb-2 text-white/95">
            <h3 className="font-semibold text-sm">Pagamentos do mes</h3>
            <Settings className="w-4 h-4 opacity-60" />
          </div>
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-20" />
                <circle cx="28" cy="28" r="24" stroke={pagamentos.percentual >= 100 ? "#28a745" : "currentColor"} strokeWidth="4" fill={pagamentos.percentual >= 100 ? "#28a745" : "none"} strokeDasharray="150" strokeDashoffset={pagamentos.percentual >= 100 ? 0 : 150 - (150 * (pagamentos.percentual)) / 100} className="text-white" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-white">
                {loading ? "..." : `${pagamentos.percentual}%`}
              </div>
            </div>
            <div className="text-xs opacity-90 space-y-1">
              <p>Realizado: {loading ? "..." : formatCurrency(pagamentos.realizado)}</p>
              <p>Falta: {loading ? "..." : formatCurrency(pagamentos.falta)}</p>
              <p>Previsto: {loading ? "..." : formatCurrency(pagamentos.previsto)}</p>
            </div>
          </div>
          <Link href="/financeiro/contas-pagar" className="text-xs w-full text-center mt-3 py-1.5 rounded-md bg-[#0069d9]/80 hover:bg-[#0062cc] text-white transition-colors block">
            Acessar painel completo &rarr;
            <div className="absolute right-0 bottom-2 opacity-10 pointer-events-none scale-150 transform">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg text-[#1a2b3c] font-semibold">Fluxo de caixa</h2>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-64 w-full text-sm">
            {fluxoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fluxoData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `${value}k`} dx={-10} />
                  <Tooltip cursor={{fill: '#f4f7f9'}} />
                  <ReferenceLine y={0} stroke="#E5E7EB" />
                  <Bar dataKey="entry" fill="#28a745" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="exit" fill="#dc3545" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 text-sm">
                Sem dados de fluxo de caixa
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg text-[#1a2b3c] font-semibold">Grafico de vendas</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 w-full text-sm">
            {vendasData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={vendasData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `${value}k`} dx={-10} />
                  <Tooltip cursor={{fill: '#f4f7f9'}} />
                  <Line type="step" dataKey="target" stroke="#000" strokeWidth={1} strokeDasharray="4 4" dot={{r: 4, fill: '#000'}} activeDot={false} />
                  <Bar dataKey="real" fill="#007bff" radius={[0, 0, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 text-sm">
                Sem dados de vendas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Contas Bancarias and Calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white rounded-md shadow-sm">
          <div className="flex justify-between items-center p-6 pb-0">
            <h2 className="text-lg text-[#1a2b3c] font-semibold">Contas bancarias</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 pt-2 h-[220px] flex items-center justify-center text-gray-300">
            <p className="text-sm">Sem dados bancarios configurados</p>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 pb-4">
            <h2 className="text-lg text-[#1a2b3c] font-semibold">Calendario</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-800">{currentMonth} de {currentYear}</span>
              <div className="flex rounded-md overflow-hidden bg-gray-900 border border-gray-900">
                <button className="px-1.5 py-1 text-white hover:bg-gray-800 transition-colors border-r border-gray-700">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-1.5 py-1 text-white hover:bg-gray-800 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 flex-1">
            <table className="w-full h-full text-sm text-center border-collapse">
              <thead className="bg-[#f8f9fa] text-gray-500 text-xs">
                <tr>
                  <th className="py-2.5 font-normal border-b border-r border-gray-100 w-[14.28%]">Dom.</th>
                  <th className="py-2.5 font-normal border-b border-r border-gray-100 w-[14.28%]">Seg.</th>
                  <th className="py-2.5 font-normal border-b border-r border-gray-100 w-[14.28%]">Ter.</th>
                  <th className="py-2.5 font-normal border-b border-r border-gray-100 w-[14.28%]">Qua.</th>
                  <th className="py-2.5 font-normal border-b border-r border-gray-100 w-[14.28%]">Qui.</th>
                  <th className="py-2.5 font-normal border-b border-r border-gray-100 w-[14.28%]">Sex.</th>
                  <th className="py-2.5 font-normal border-b w-[14.28%]">Sab.</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {calendarRows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0">
                    {row.map((day: any, j: number) => {
                      const isObj = typeof day === 'object';
                      const val = isObj ? day.val : day;
                      const isActive = isObj && day.active;
                      const isDim = isObj && day.dim;

                      return (
                        <td 
                          key={j} 
                          className={`py-3 border-r border-gray-100 last:border-r-0 ${isDim ? 'bg-[#f8f9fa] text-gray-400' : ''}`}
                        >
                          <div className={`mx-auto w-8 h-8 flex items-center justify-center ${isActive ? 'border-2 border-gray-800 font-medium rounded-sm text-gray-900 bg-white' : ''}`}>
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
