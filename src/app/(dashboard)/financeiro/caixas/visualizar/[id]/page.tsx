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
  ArrowBigDown
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
    return <div className="p-8 text-gray-500 italic">Carregando detalhes...</div>;
  }

  const { session, vendas, totaisGerais } = data;

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
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
          <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5">
             <h3 className="text-[14px] font-bold text-gray-600">Dados gerais</h3>
          </div>
          <div className="p-0">
             <table className="w-full text-sm border-collapse">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="w-64 px-4 py-3 font-bold text-gray-700 border-r border-gray-50">Aberto em</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(session.DataAbertura)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50">Fechado em</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(session.DataFechamento)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50">Funcionário</td>
                    <td className="px-4 py-3 text-gray-600">{session.FuncionarioNome}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50">Cadastrada por</td>
                    <td className="px-4 py-3 text-gray-600 font-medium text-blue-600">{session.FuncionarioNome}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700 border-r border-gray-50">Cadastrado em</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(session.DataAbertura)}</td>
                  </tr>
                </tbody>
             </table>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center gap-2 mt-8 mb-4">
           <Monitor className="w-5 h-5 text-gray-600" />
           <h2 className="text-[18px] font-normal text-gray-700">Movimentações de caixa</h2>
        </div>

        {/* Card: Abertura de Caixa */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5">
             <h3 className="text-[14px] font-bold text-gray-600">Abertura de caixa</h3>
          </div>
          <div className="p-4">
             <table className="w-full text-[13px] border-collapse border border-gray-200">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">Forma Pagamento</th>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">Recebido</th>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">À Receber</th>
                    <th className="px-3 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="px-3 py-2 border-r border-gray-200 font-medium">Dinheiro à Vista</td>
                    <td className="px-3 py-2 border-r border-gray-200">{formatCurrency(session.ValorAbertura)}</td>
                    <td className="px-3 py-2 border-r border-gray-200">0,00</td>
                    <td className="px-3 py-2">{formatCurrency(session.ValorAbertura)}</td>
                  </tr>
                </tbody>
             </table>
          </div>
        </div>

        {/* Card: Vendas Balcão */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5">
             <h3 className="text-[14px] font-bold text-gray-600">Vendas realizadas no balcão</h3>
          </div>
          <div className="p-4">
             <table className="w-full text-[13px] border-collapse border border-gray-200">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">Forma Pagamento</th>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">Recebido</th>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">À Receber</th>
                    <th className="px-3 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.length === 0 ? (
                    <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400 italic">Nenhuma venda registrada nesta sessão.</td></tr>
                  ) : vendas.map((v: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 text-gray-600">
                      <td className="px-3 py-2 border-r border-gray-200 font-medium">{v.Forma}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{formatCurrency(v.Recebido)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{formatCurrency(v.AReceber)}</td>
                      <td className="px-3 py-2">{formatCurrency(v.Total)}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Card: Formas de Pagamento (Resumo Geral) */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-[#fcfcfc] border-b border-gray-100 px-4 py-2.5">
             <h3 className="text-[14px] font-bold text-gray-600">Formas de pagamento</h3>
          </div>
          <div className="p-4">
             <table className="w-full text-[13px] border-collapse border border-gray-200">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">Nome</th>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">Não Pago/recebido</th>
                    <th className="px-3 py-2 border-r border-gray-200 text-left">Pago/recebido</th>
                    <th className="px-3 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                   {/* Linha consolidada por forma */}
                   {vendas.map((v: any, idx: number) => (
                     <tr key={idx} className="border-b border-gray-100 text-gray-600">
                        <td className="px-3 py-2 border-r border-gray-200 font-medium">{v.Forma}</td>
                        <td className="px-3 py-2 border-r border-gray-200">0,00</td>
                        <td className="px-3 py-2 border-r border-gray-200">{formatCurrency(v.Recebido + (v.Forma === "Dinheiro à Vista" ? session.ValorAbertura : 0))}</td>
                        <td className="px-3 py-2 font-bold">{formatCurrency(v.Total + (v.Forma === "Dinheiro à Vista" ? session.ValorAbertura : 0))}</td>
                     </tr>
                   ))}
                   {/* Linha Total Geral */}
                   <tr className="bg-gray-50 font-bold">
                      <td className="px-3 py-2 border-r border-gray-200">Total</td>
                      <td className="px-3 py-2 border-r border-gray-200">0,00</td>
                      <td className="px-3 py-2 border-r border-gray-200 text-blue-600">{formatCurrency(totaisGerais.SaldoReal)}</td>
                      <td className="px-3 py-2 text-blue-600">{formatCurrency(totaisGerais.SaldoReal)}</td>
                   </tr>
                </tbody>
             </table>
          </div>
        </div>

        {/* Real Balance Footer */}
        <div className="flex justify-end p-4">
           <div className="text-[17px] font-bold text-gray-800">
              Saldo real no caixa: <span className="text-gray-900">{formatCurrency(totaisGerais.SaldoReal)}</span>
           </div>
        </div>

      </div>
    </div>
  );
}
