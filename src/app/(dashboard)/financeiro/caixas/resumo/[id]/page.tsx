"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Printer, 
  Package, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  User,
  ExternalLink,
  DollarSign,
  TrendingUp,
  CreditCard,
  ChevronDown
} from "lucide-react";
import { getCaixaPrintData } from "@/actions/caixa";

export default function CaixaResumoPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get("type") as 'vendas' | 'os' | 'completo') || 'vendas';
  
  const [data, setData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (id) {
      startTransition(async () => {
        const resp = await getCaixaPrintData(Number(id), type);
        if (resp.success) setData(resp.data);
      });
    }
  }, [id, type]);

  if (!data) return <div className="p-12 text-gray-400 italic flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" /> Carregando resumo...</div>;

  const { session, abertura, vendas, os, consolidadoGeral, saldoReal, vendasRaw, osRaw } = data;
  
  const totalVendas = vendasRaw?.reduce((acc: number, curr: any) => acc + curr.Total, 0) || 0;
  const totalOS = osRaw?.reduce((acc: number, curr: any) => acc + curr.Total, 0) || 0;
  const totalValue = type === 'completo' ? (totalVendas + totalOS) : (type === 'vendas' ? totalVendas : totalOS);
  const totalItems = type === 'completo' ? ((vendasRaw?.length || 0) + (osRaw?.length || 0)) : (type === 'vendas' ? (vendasRaw?.length || 0) : (osRaw?.length || 0));
  
  const isVendas = type === 'vendas';
  const isOS = type === 'os';
  const isCompleto = type === 'completo';

  const themeColor = isCompleto ? "text-orange-600 bg-orange-50" : (isVendas ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50");
  const borderColor = isCompleto ? "border-orange-100" : (isVendas ? "border-green-100" : "border-blue-100");
  const btnColor = isCompleto ? "bg-orange-600 hover:bg-orange-700" : (isVendas ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700");
  const iconBg = isCompleto ? "bg-orange-500" : (isVendas ? "bg-green-500" : "bg-blue-500");

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 animate-in fade-in duration-500 pb-20">
      {/* Top Navigation */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <Link 
          href="/financeiro/opcoes/caixas"
          className="flex items-center gap-2 text-gray-400 hover:text-gray-800 transition-colors text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar para Caixas
        </Link>
        
        <div className="flex gap-2 relative group">
           <button 
             className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 group-hover:border-blue-300"
           >
             <Printer className="w-4 h-4" /> Imprimir Relatório <ChevronDown className="w-3.5 h-3.5" />
           </button>
           
           <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right scale-95 group-hover:scale-100">
              <button 
                onClick={() => window.open(`/financeiro/caixas/print/${id}?type=vendas`, "_blank")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-green-50 hover:text-green-700 text-left font-bold"
              >
                <Package className="w-4 h-4" /> Somente Vendas Balcão
              </button>
              <button 
                onClick={() => window.open(`/financeiro/caixas/print/${id}?type=os`, "_blank")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left font-bold"
              >
                <FileText className="w-4 h-4" /> Somente Ordens de Serviço
              </button>
              <div className="h-px bg-gray-100 my-1 mx-2" />
              <button 
                onClick={() => window.open(`/financeiro/caixas/print/${id}?type=completo`, "_blank")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-800 hover:bg-orange-50 hover:text-orange-700 text-left font-bold"
              >
                <CheckCircle2 className="w-4 h-4" /> Relatório Geral (Completo)
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Main Dashboard Card */}
        <div className={`bg-white border-2 ${borderColor} rounded-[2rem] shadow-xl p-10 text-center relative overflow-hidden`}>
           <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10 ${iconBg}`} />
           
           <div className="inline-flex items-center justify-center p-4 rounded-2xl mb-4 bg-gray-50 shadow-inner">
              {isCompleto ? <TrendingUp className="w-10 h-10 text-orange-500" /> : (isVendas ? <Package className="w-10 h-10 text-green-500" /> : <FileText className="w-10 h-10 text-blue-500" />)}
           </div>
           
           <h1 className="text-gray-400 text-xs font-black uppercase tracking-[0.25em] mb-3">
             Resumo de Conferência: {isCompleto ? "Geral (Vendas + OS)" : (isVendas ? "Vendas Balcão" : "Ordens de Serviço")}
           </h1>
           
           <div className="flex flex-col items-center">
              <span className={`text-6xl md:text-7xl font-black tracking-tighter ${isVendas ? "text-green-600" : "text-blue-600"}`}>
                {formatCurrency(totalValue)}
              </span>
              <div className="mt-6 flex items-center gap-3 text-gray-500 text-[11px] font-black uppercase bg-gray-50/80 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100 shadow-sm">
                <CheckCircle2 className={`w-4 h-4 ${isCompleto ? "text-orange-500" : (isVendas ? "text-green-500" : "text-blue-500")}`} />
                {totalItems} Lançamentos Gerados na Sessão #{id}
              </div>
           </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                 <Calendar className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Abertura e Fechamento</p>
                 <p className="text-sm font-bold text-gray-700 leading-tight">
                    {new Date(session.DataAbertura).toLocaleDateString()} às {new Date(session.DataAbertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </p>
                 <p className="text-[11px] text-gray-400 mt-0.5">Até o momento do fechamento parcial</p>
              </div>
           </div>
           <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                 <User className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Operador Responsável</p>
                 <p className="text-sm font-bold text-gray-700 leading-tight">{session.FuncionarioNome || "Johnny Andrade Ferreira"}</p>
                 <p className="text-[11px] text-gray-400 mt-0.5">ID de acesso: {session.UsuarioId || '---'}</p>
              </div>
           </div>
        </div>

        {/* Seção Abertura de Caixa */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest">Abertura de Caixa</h3>
           </div>
           <div className="p-6">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <span className="font-bold text-gray-600 text-sm">{abertura.Forma}</span>
                 <span className="font-black text-gray-900 text-lg">{formatCurrency(abertura.Total)}</span>
              </div>
           </div>
        </div>

        {/* Consolidado por Formas de Pagamento */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest">Resumo por Formas de Pagamento</h3>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-white px-3 py-1 rounded-full border border-gray-50 shadow-sm">
                 <TrendingUp className="w-3.5 h-3.5" /> Consolidado Parcial
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-[#fcfcfc] text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-50">
                    <tr>
                       <th className="px-8 py-4">Nome da Forma</th>
                       <th className="px-8 py-4 text-right">À Receber</th>
                       <th className="px-8 py-4 text-right">Pago/Recebido</th>
                       <th className="px-8 py-4 text-right">Total Acumulado</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {consolidadoGeral.map((f: any, i: number) => (
                      <tr key={i} className="group hover:bg-gray-50 transition-colors">
                         <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-blue-400" />
                               <span className="font-bold text-gray-800">{f.Nome}</span>
                            </div>
                         </td>
                         <td className="px-8 py-4 text-right text-gray-400 font-medium">{formatCurrency(f.NaoRecebido)}</td>
                         <td className="px-8 py-4 text-right text-green-600 font-bold">{formatCurrency(f.Recebido)}</td>
                         <td className="px-8 py-4 text-right">
                            <span className="font-black text-gray-900">{formatCurrency(f.Total)}</span>
                         </td>
                      </tr>
                    ))}
                 </tbody>
                 <tfoot className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
                    <tr>
                       <td className="px-8 py-5 font-black text-gray-500 text-[11px] uppercase tracking-widest">Totais Consolidados</td>
                       <td className="px-8 py-5 text-right font-bold text-gray-400">{formatCurrency(consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.NaoRecebido, 0))}</td>
                       <td className="px-8 py-5 text-right font-bold text-green-600">{formatCurrency(consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.Recebido, 0))}</td>
                       <td className="px-8 py-5 text-right">
                          <span className="font-black text-gray-900 text-lg">{formatCurrency(consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.Total, 0))}</span>
                       </td>
                    </tr>
                 </tfoot>
              </table>
           </div>
        </div>

        {/* Detalhamento Individual de Lançamentos */}
        {(isVendas || isCompleto) && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest flex items-center gap-2">
                   <Package className="w-4 h-4 text-green-500" /> Detalhamento de Vendas Balcão
                </h3>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                   <thead className="bg-[#fcfcfc] text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-50">
                      <tr>
                         <th className="px-8 py-4">Data/Hora</th>
                         <th className="px-8 py-4 text-center">Nº Ref</th>
                         <th className="px-8 py-4 text-right">Forma PGTO</th>
                         <th className="px-8 py-4 text-right">Valor Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {vendasRaw && vendasRaw.length > 0 ? vendasRaw.map((item: any, idx: number) => (
                        <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                           <td className="px-8 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                 <span className="font-bold text-gray-700" suppressHydrationWarning>{new Date(item.CreatedAt || item.DataVenda).toLocaleDateString()}</span>
                                 <span className="text-[10px] text-gray-400 font-medium" suppressHydrationWarning>{new Date(item.CreatedAt || item.DataVenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                           </td>
                           <td className="px-8 py-4 text-center">
                              <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-500">#{item.Numero}</span>
                           </td>
                           <td className="px-8 py-4 text-right">
                             <span className="text-[10px] font-black uppercase text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded">{item.FormaPagamento?.Nome || "Diversos"}</span>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <span className="font-black text-gray-900">{formatCurrency(item.Total)}</span>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic font-medium">Nenhum registro de venda para esta sessão.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {(isOS || isCompleto) && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest flex items-center gap-2">
                   <FileText className="w-4 h-4 text-blue-500" /> Detalhamento de Ordens de Serviço
                </h3>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                   <thead className="bg-[#fcfcfc] text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-50">
                      <tr>
                         <th className="px-8 py-4">Data/Hora</th>
                         <th className="px-8 py-4 text-center">Nº Ref</th>
                         <th className="px-8 py-4 text-right">Forma PGTO</th>
                         <th className="px-8 py-4 text-right">Valor Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {osRaw && osRaw.length > 0 ? osRaw.map((item: any, idx: number) => (
                        <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                           <td className="px-8 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                 <span className="font-bold text-gray-700" suppressHydrationWarning>{new Date(item.CreatedAt || item.DataVenda).toLocaleDateString()}</span>
                                 <span className="text-[10px] text-gray-400 font-medium" suppressHydrationWarning>{new Date(item.CreatedAt || item.DataVenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                           </td>
                           <td className="px-8 py-4 text-center">
                              <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-500">#{item.Numero}</span>
                           </td>
                           <td className="px-8 py-4 text-right">
                             <span className="text-[10px] font-black uppercase text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded">{item.FormaPagamento?.Nome || "Diversos"}</span>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <span className="font-black text-gray-900">{formatCurrency(item.Total)}</span>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic font-medium">Nenhum registro de OS para esta sessão.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Closing Action Banner */}
        <div className="flex items-center justify-between bg-[#1b2a33] text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-2 cursor-pointer hover:rotate-12 transition-transform opacity-10">
              <Printer className="w-32 h-32" />
           </div>
           
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                 <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <div>
                 <h4 className="font-black text-xl leading-tight">Saldo Real no Caixa: {formatCurrency(saldoReal)}</h4>
                 <p className="text-gray-400 text-sm font-medium mt-1">Deseja imprimir este relatório de conferência?</p>
              </div>
           </div>
           
           <button 
             onClick={() => window.open(`/financeiro/caixas/print/${id}?type=${type}`, "_blank")}
             className={`flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 group relative z-10 ${btnColor}`}
           >
              Gerar Relatório <ExternalLink className="w-5 h-5 opacity-70 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  );
}
