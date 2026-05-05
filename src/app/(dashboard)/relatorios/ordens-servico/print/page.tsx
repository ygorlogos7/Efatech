"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRelatorioOrdensServico } from "@/actions/relatorios";
import { PrintButton } from "@/components/forms/PrintButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function RelatorioOSPrintContent() {
  const searchParams = useSearchParams();
  const dataInicio = searchParams.get("dataInicio") || "";
  const dataFim = searchParams.get("dataFim") || "";
  const cliente = searchParams.get("cliente") || "";
  
  const [data, setData] = useState<any[]>([]);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const resp = await getRelatorioOrdensServico({ dataInicio, dataFim, cliente }, 1, 9999);
      if (resp.success) {
        setData(resp.data || []);
        setFaturamentoTotal(resp.faturamentoTotal || 0);
      }
    });
  }, [dataInicio, dataFim, cliente]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (date: string) => {
    if (!date) return "---";
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  if (isPending) return <div className="p-8">Gerando relatório de O.S. consolidado...</div>;

  return (
    <div className="bg-white text-black p-4 font-sans text-[12px] leading-tight max-w-[800px] mx-auto print:max-w-full print:p-0 print-container">
      
      {/* BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) */}
      <div className="max-w-[800px] mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100">
          <Link href="/relatorios/ordens-servico" className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <PrintButton label="IMPRIMIR RELATÓRIO" />
      </div>
      
      {/* Header Estilo GestãoClick */}
      <div className="border border-gray-300 p-4 mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="w-20 h-20">
              <img 
                src="/images/logo_efatech.png" 
                alt="Efatech Logo" 
                className="w-full h-full object-contain"
              />
           </div>
           <div>
              <h1 className="text-[16px] font-bold uppercase tracking-tight">EFATECH ASSISTENCIA TÉCNICA E ACESSÓRIOS</h1>
              <p className="text-[10px] text-gray-500">Relatório Consolidado de Ordens de Serviço</p>
           </div>
        </div>
        <div className="text-right font-bold text-[10px]">
           <p>(11) 91091-8448</p>
           <p>efatechassistencia@gmail.com</p>
        </div>
      </div>

      {/* Tabela de Resumo do Relatório */}
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold w-1/3 bg-gray-50">Tipo de Relatório</td>
            <td className="p-1.5 uppercase font-bold">Assistência Técnica (O.S. Consolidado Diário)</td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">Período</td>
            <td className="p-1.5">
               {dataInicio ? formatDate(dataInicio) : "Início"} até {dataFim ? formatDate(dataFim) : "Hoje"}
            </td>
          </tr>
          {cliente && (
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 font-bold bg-gray-50">Filtro de Cliente</td>
              <td className="p-1.5">{cliente}</td>
            </tr>
          )}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">Dias com Atendimento</td>
            <td className="p-1.5 font-bold">{data.length} dias</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">Faturamento Total em Serviços</td>
            <td className="p-1.5 font-bold text-[14px]">R$ {formatCurrency(faturamentoTotal)}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12px] font-bold mb-2 uppercase border-b border-black pb-1">Detalhamento por Dia</h2>

      <table className="w-full border-collapse border border-black text-center mb-10">
        <thead className="bg-gray-100 border-b border-black font-bold text-[10px]">
          <tr>
            <td className="border-r border-black p-1.5 text-left">Data</td>
            <td className="border-r border-black p-1.5">Quantidade de O.S.</td>
            <td className="p-1.5 text-right">Total do Dia</td>
          </tr>
        </thead>
        <tbody className="text-[10px]">
          {data.map((item, i) => (
            <tr key={i} className="border-b border-black last:border-b">
              <td className="border-r border-black p-1.5 text-left font-medium">{formatDate(item.data)}</td>
              <td className="border-r border-black p-1.5">{item.qtd} atendimentos</td>
              <td className="p-1.5 text-right font-bold">R$ {formatCurrency(item.total)}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-400 italic">Nenhum dado encontrado para o período.</td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-gray-50 font-bold text-[11px]">
           <tr>
              <td colSpan={2} className="border-r border-black p-2 text-right uppercase">Total de Serviços</td>
              <td className="p-2 text-right text-[13px]">R$ {formatCurrency(faturamentoTotal)}</td>
           </tr>
        </tfoot>
      </table>

      <div className="mt-20 flex justify-between items-end">
         <div className="text-[9px] text-gray-400">
            Gerado em {new Date().toLocaleString("pt-BR")} por Efatech ERP
         </div>
         <div className="border-t border-black w-48 text-center pt-1 font-bold text-[10px]">
            Assinatura do Responsável
         </div>
      </div>

       <style jsx global>{`
        @media print {
          @page { margin: 1.5cm; }
          body, html { 
            overflow: visible !important; 
            height: auto !important; 
          }
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          *::-webkit-scrollbar {
            display: none !important;
          }
          .print-container {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          body { -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function RelatorioOSPrintPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <RelatorioOSPrintContent />
    </Suspense>
  );
}
