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
  ChevronDown,
  ArrowDownCircle,
  ArrowUpCircle
} from "lucide-react";
import { getCaixaPrintData } from "@/actions/caixa";
import { RETIRADAS_FORMA_CONSOLIDADO, indiceLinhaParaAlocarSangria } from "@/lib/caixaRelatorioFormas";

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

  const { session, abertura, vendas, os, sangrias, suprimentos, consolidadoGeral, saldoReal, vendasRaw, osRaw } = data;
  
  const totalVendas = vendasRaw?.reduce((acc: number, curr: any) => acc + curr.Total, 0) || 0;
  const totalOS = osRaw?.reduce((acc: number, curr: any) => acc + curr.Total, 0) || 0;
  const totalValue = type === 'completo' ? (totalVendas + totalOS + (suprimentos?.reduce((acc: any, c: any) => acc + c.Total, 0) || 0)) : (type === 'vendas' ? totalVendas : totalOS);
  
  const isCompleto = type === 'completo';

  const valorAberturaNum = Number(abertura?.Recebido ?? session?.ValorAbertura ?? 0);
  const totalRetiradasNum = Array.isArray(sangrias)
    ? sangrias.reduce((acc: number, s: any) => acc + Number(s.Total ?? s.Pago ?? 0), 0)
    : 0;
  const saldoDinheiroAposRetiradas = valorAberturaNum - totalRetiradasNum;
  const showLinhaSaldoAposRetiradas = isCompleto && totalRetiradasNum > 0;

  const consolidadoFormasPagamento = consolidadoGeral.filter((f: any) => f.Nome !== RETIRADAS_FORMA_CONSOLIDADO);
  const idxSangriaAlvo = indiceLinhaParaAlocarSangria(consolidadoFormasPagamento);
  const sangriaAlocadaNaLinha = (i: number) =>
    totalRetiradasNum > 0 && i === idxSangriaAlvo ? totalRetiradasNum : 0;

  const btnColor = isCompleto ? "bg-orange-600 hover:bg-orange-700" : (type === 'vendas' ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700");
  const borderColor = isCompleto ? "border-orange-100" : (type === 'vendas' ? "border-green-100" : "border-blue-100");
  const iconBg = isCompleto ? "bg-orange-500" : (type === 'vendas' ? "bg-green-500" : "bg-blue-500");

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
              {isCompleto ? <TrendingUp className="w-10 h-10 text-orange-500" /> : (type === 'vendas' ? <Package className="w-10 h-10 text-green-500" /> : <FileText className="w-10 h-10 text-blue-500" />)}
           </div>
           
           <h1 className="text-gray-400 text-xs font-black uppercase tracking-[0.25em] mb-3">
             Resumo de Conferência: {isCompleto ? "Geral (Vendas + OS)" : (type === 'vendas' ? "Vendas Balcão" : "Ordens de Serviço")}
           </h1>
           
           <div className="flex flex-col items-center">
              <span className={`text-6xl md:text-7xl font-black tracking-tighter ${type === 'vendas' ? "text-green-600" : (type === 'os' ? "text-blue-600" : "text-orange-600")}`}>
                {formatCurrency(totalValue)}
              </span>
              <div className="mt-6 flex items-center gap-3 text-gray-500 text-[11px] font-black uppercase bg-gray-50/80 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100 shadow-sm">
                <CheckCircle2 className={`w-4 h-4 ${isCompleto ? "text-orange-500" : (type === 'vendas' ? "text-green-500" : "text-blue-500")}`} />
                Lançamentos da Sessão #{id}
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
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Abertura</p>
                 <p className="text-sm font-bold text-gray-700 leading-tight">
                    {new Date(session.DataAbertura).toLocaleDateString()} às {new Date(session.DataAbertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </p>
              </div>
           </div>
           <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                 <User className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Operador Responsável</p>
                 <p className="text-sm font-bold text-gray-700 leading-tight">{session.FuncionarioNome}</p>
              </div>
           </div>
        </div>

        {/* Resumo por Formas de Pagamento */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest">Resumo Consolidado</h3>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-[#fcfcfc] text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-50">
                    <tr>
                       <th className="px-8 py-4">Forma de pagamento</th>
                       <th className="px-8 py-4 text-right">Entradas (+)</th>
                       <th className="px-8 py-4 text-right">Sangria (retiradas)</th>
                       <th className="px-8 py-4 text-right">Saldo líquido (Total)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {consolidadoFormasPagamento.map((f: any, i: number) => {
                      const s = sangriaAlocadaNaLinha(i);
                      const liquido = Number(f.Total) - s;
                      return (
                        <tr key={`${f.Nome}-${i}`} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4">
                            <span className="font-bold text-gray-800">{f.Nome}</span>
                          </td>
                          <td className="px-8 py-4 text-right text-green-600 font-bold">{formatCurrency(f.Recebido)}</td>
                          <td className="px-8 py-4 text-right text-sm">
                            {s > 0 ? (
                              <span className="font-bold text-red-600">-{formatCurrency(s)}</span>
                            ) : (
                              <span className="font-bold text-gray-500">{formatCurrency(0)}</span>
                            )}
                          </td>
                          <td className="px-8 py-4 text-right">
                            <span className="font-black text-gray-900">{formatCurrency(liquido)}</span>
                          </td>
                        </tr>
                      );
                    })}
                 </tbody>
                 <tfoot className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
                    <tr>
                       <td className="px-8 py-5 font-black text-gray-500 text-[11px] uppercase tracking-widest">Total geral</td>
                       <td className="px-8 py-5 text-right font-bold text-green-600">{formatCurrency(consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.Recebido, 0))}</td>
                       <td className="px-8 py-5 text-right font-bold text-red-600">
                         {totalRetiradasNum > 0 ? `-${formatCurrency(totalRetiradasNum)}` : formatCurrency(0)}
                       </td>
                       <td className="px-8 py-5 text-right">
                          <span className="font-black text-gray-900 text-lg">{formatCurrency(saldoReal)}</span>
                       </td>
                    </tr>
                 </tfoot>
              </table>
           </div>
        </div>

        {/* Detalhamento Individual de Sangrias */}
        {isCompleto && sangrias && sangrias.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest flex items-center gap-2">
                   <ArrowDownCircle className="w-4 h-4 text-red-500" /> Detalhamento de Sangrias
                </h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                   <thead className="bg-[#fcfcfc] text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-50">
                      <tr>
                         <th className="px-8 py-4 text-left">Descrição</th>
                         <th className="px-8 py-4 text-right">Origem</th>
                         <th className="px-8 py-4 text-right">Valor retirado</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {sangrias.map((item: any, idx: number) => (
                        <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                           <td className="px-8 py-4 whitespace-nowrap">
                              <span className="font-bold text-gray-700">Retirada #{idx + 1}</span>
                           </td>
                           <td className="px-8 py-4 text-right">
                             <span className="text-[10px] font-black uppercase text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded">Dinheiro</span>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <span className="font-black text-red-600">-{formatCurrency(item.Total)}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                   <tfoot className="bg-gray-50/90 border-t-2 border-gray-200">
                      <tr>
                        <td className="px-8 py-4 font-black text-gray-700 text-xs uppercase tracking-wide" colSpan={2}>
                          Total de saídas / sangrias
                        </td>
                        <td className="px-8 py-4 text-right font-black text-red-600">
                          -{formatCurrency(sangrias.reduce((acc: number, curr: any) => acc + Number(curr.Total ?? curr.Pago ?? 0), 0))}
                        </td>
                      </tr>
                      {showLinhaSaldoAposRetiradas && (
                        <tr className="border-t border-dashed border-gray-300 bg-white">
                          <td className="px-8 py-4 font-bold text-gray-800" colSpan={2}>
                            Saldo atual{" "}
                            <span className="font-medium text-gray-500 text-xs font-sans normal-case">
                              (abertura {formatCurrency(valorAberturaNum)} − retiradas {formatCurrency(totalRetiradasNum)})
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right font-black text-gray-900">
                            {formatCurrency(saldoDinheiroAposRetiradas)}
                          </td>
                        </tr>
                      )}
                   </tfoot>
                </table>
             </div>
          </div>
        )}

        {/* Closing Action Banner */}
        <div className="flex items-center justify-between bg-[#1b2a33] text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-2 opacity-10">
              <Printer className="w-32 h-32" />
           </div>
           
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                 <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <div>
                 <h4 className="font-black text-xl leading-tight">Saldo Real no Caixa: {formatCurrency(saldoReal)}</h4>
                 <p className="text-gray-400 text-sm font-medium mt-1">Gere o PDF para impressão oficial.</p>
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
