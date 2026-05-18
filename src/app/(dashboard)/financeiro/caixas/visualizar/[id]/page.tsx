"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Monitor, 
  Home, 
  ChevronRight, 
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle
} from "lucide-react";
import { getCaixaSessaoDetalhes } from "@/actions/caixa";

export default function VisualizarCaixaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (id) {
      startTransition(async () => {
        const resp = await getCaixaSessaoDetalhes(Number(id));
        if (resp.success) setData(resp.data);
      });
    }
  }, [id]);

  const formatDate = (date: any) => {
    if (!date) return "------";
    return new Date(date).toLocaleString("pt-BR");
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
           <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-500 font-medium animate-pulse uppercase tracking-widest text-[11px]">Carregando detalhes do caixa...</p>
        </div>
      </div>
    );
  }

  const { session, vendas, sangrias, suprimentos, totaisGerais } = data;

  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      {/* Header & Breadcrumbs */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-normal text-gray-700">Visualizar caixa</h1>
        </div>
        
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-blue-500 cursor-pointer">Caixas</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Visualizar</span>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Card: Dados Gerais */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5 flex justify-between items-center">
             <h3 className="text-[14px] font-bold text-gray-600">Dados gerais</h3>
             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${session.Status === 'Aberto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {session.Status}
             </span>
          </div>
          <div className="p-0">
             <table className="w-full text-sm border-collapse">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="w-64 px-4 py-3 font-bold text-gray-700 border-r border-gray-50 uppercase text-[11px]">Aberto em</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(session.DataAbertura)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50 uppercase text-[11px]">Fechado em</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(session.DataFechamento)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50 uppercase text-[11px]">Atendente</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{session.FuncionarioNome}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50 uppercase text-[11px]">Valor de Abertura</td>
                    <td className="px-4 py-3 text-gray-600 font-bold">R$ {formatCurrency(session.ValorAbertura)}</td>
                  </tr>
                  {session.ValorFechamento !== null && (
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50 uppercase text-[11px]">Valor de Fechamento (Físico)</td>
                      <td className="px-4 py-3 text-gray-600 font-bold">R$ {formatCurrency(session.ValorFechamento)}</td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center gap-2 mt-8 mb-4">
           <Monitor className="w-5 h-5 text-gray-600" />
           <h2 className="text-[18px] font-normal text-gray-700">Movimentações de caixa</h2>
        </div>

        {/* Cards Grid: Entradas, Saídas, Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 border border-gray-200 rounded shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                 <ArrowUpCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Entradas</p>
                 <p className="text-xl font-black text-green-700">R$ {formatCurrency(totaisGerais.Entradas)}</p>
              </div>
           </div>
           <div className="bg-white p-6 border border-gray-200 rounded shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                 <ArrowDownCircle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Saídas</p>
                 <p className="text-xl font-black text-red-700">R$ {formatCurrency(totaisGerais.Saidas)}</p>
              </div>
           </div>
           <div className="bg-white p-6 border border-gray-200 rounded shadow-sm flex items-center gap-4 border-l-4 border-l-blue-600">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                 <DollarSign className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Saldo Atual</p>
                 <p className="text-xl font-black text-blue-700">R$ {formatCurrency(totaisGerais.SaldoReal)}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Vendas e OS */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-green-600" />
               <h3 className="text-[14px] font-bold text-gray-600">Vendas e Serviços (Entradas)</h3>
            </div>
            <div className="p-0">
               <table className="w-full text-[13px] border-collapse">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Forma Pagamento</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendas.length === 0 ? (
                      <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400 italic">Nenhuma movimentação registrada.</td></tr>
                    ) : vendas.filter((v: any) => v.Recebido > 0).map((v: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">{v.Forma}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">R$ {formatCurrency(v.Recebido)}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>

          {/* Card: Sangrias (Saídas) */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
               <ArrowDownCircle className="w-4 h-4 text-red-600" />
               <h3 className="text-[14px] font-bold text-gray-600">Sangrias (Retiradas do Caixa)</h3>
            </div>
            <div className="p-0">
               <table className="w-full text-[13px] border-collapse">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Descrição</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sangrias.length === 0 ? (
                      <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400 italic">Nenhuma sangria registrada.</td></tr>
                    ) : sangrias.map((s: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">{s.Descricao || "Sangria de caixa"}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">R$ {formatCurrency(s.Valor)}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Card: Formas de Pagamento (Consolidado Geral) */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
             <CreditCard className="w-4 h-4 text-blue-600" />
             <h3 className="text-[14px] font-bold text-gray-600">Resumo Consolidado por Forma de Pagamento</h3>
          </div>
          <div className="p-0">
             <table className="w-full text-[13px] border-collapse">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Forma</th>
                    <th className="px-4 py-3 text-right">Entradas (+)</th>
                    <th className="px-4 py-3 text-right">Saídas (-)</th>
                    <th className="px-4 py-3 text-right">Líquido (=)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {vendas.map((v: any, idx: number) => (
                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">{v.Forma}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">R$ {formatCurrency(v.Recebido)}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">R$ {formatCurrency(v.Pago)}</td>
                        <td className="px-4 py-3 text-right font-black text-gray-900">R$ {formatCurrency(v.Total)}</td>
                     </tr>
                   ))}
                </tbody>
                <tfoot className="bg-gray-50 font-black">
                   <tr>
                      <td className="px-4 py-4 text-[12px] uppercase">Total Geral do Caixa</td>
                      <td className="px-4 py-4 text-right text-green-700">R$ {formatCurrency(totaisGerais.Entradas)}</td>
                      <td className="px-4 py-4 text-right text-red-700">R$ {formatCurrency(totaisGerais.Saidas)}</td>
                      <td className="px-4 py-4 text-right text-blue-700 text-lg">R$ {formatCurrency(totaisGerais.SaldoReal)}</td>
                   </tr>
                </tfoot>
             </table>
          </div>
        </div>

        {/* Information Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex gap-3 text-blue-800 rounded">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div className="text-[12px]">
             <p className="font-bold uppercase tracking-tight mb-1">Nota de Auditoria</p>
             <p>Este relatório consolida todas as movimentações vinculadas a esta sessão de caixa. O saldo atual é o valor que deve estar presente no caixa (considerando todas as formas de pagamento) no momento do fechamento.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
