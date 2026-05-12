"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRelatorioVendas } from "@/actions/relatorios";
import { RelatorioPrintChrome } from "@/components/relatorios/RelatorioPrintChrome";

function RelatorioVendasPrintContent() {
  const searchParams = useSearchParams();
  const dataInicio = searchParams.get("dataInicio") || "";
  const dataFim = searchParams.get("dataFim") || "";
  const cliente = searchParams.get("cliente") || "";

  const [data, setData] = useState<any[]>([]);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const resp = await getRelatorioVendas(
        { dataInicio, dataFim, cliente },
        1,
        9999
      );
      if (resp.success) {
        setData(resp.data || []);
        setFaturamentoTotal(resp.faturamentoTotal || 0);
      }
    });
  }, [dataInicio, dataFim, cliente]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "---";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  if (isPending)
    return <div className="p-8">Gerando relatório consolidado...</div>;

  return (
    <RelatorioPrintChrome
      backHref="/relatorios/vendas"
      reportSubtitle="Relatório Consolidado de Vendas"
    >
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold w-1/3 bg-gray-50">
              Tipo de Relatório
            </td>
            <td className="p-1.5 uppercase font-bold">
              Vendas Balcão (Consolidado Diário)
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Período
            </td>
            <td className="p-1.5">
              {dataInicio ? formatDate(dataInicio) : "Início"} até{" "}
              {dataFim ? formatDate(dataFim) : "Hoje"}
            </td>
          </tr>
          {cliente ? (
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 font-bold bg-gray-50">
                Filtro de Cliente
              </td>
              <td className="p-1.5">{cliente}</td>
            </tr>
          ) : null}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Total de Dias com Venda
            </td>
            <td className="p-1.5 font-bold">{data.length} dias</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Faturamento Bruto Total
            </td>
            <td className="p-1.5 font-bold text-[14px]">
              R$ {formatCurrency(faturamentoTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12px] font-bold mb-2 uppercase border-b border-black pb-1">
        Detalhamento por Dia
      </h2>

      <table className="w-full border-collapse border border-black text-center mb-10">
        <thead className="bg-gray-100 border-b border-black font-bold text-[10px]">
          <tr>
            <td className="border-r border-black p-1.5 text-left">Data</td>
            <td className="border-r border-black p-1.5">
              Quantidade de Vendas
            </td>
            <td className="p-1.5 text-right">Total do Dia</td>
          </tr>
        </thead>
        <tbody className="text-[10px]">
          {data.map((item, i) => (
            <tr key={i} className="border-b border-black last:border-b">
              <td className="border-r border-black p-1.5 text-left font-medium">
                {formatDate(item.data)}
              </td>
              <td className="border-r border-black p-1.5">{item.qtd}</td>
              <td className="p-1.5 text-right font-bold">
                R$ {formatCurrency(item.total)}
              </td>
            </tr>
          ))}
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="p-4 text-center text-gray-400 italic"
              >
                Nenhum dado encontrado para o período.
              </td>
            </tr>
          ) : null}
        </tbody>
        <tfoot className="bg-gray-50 font-bold text-[11px]">
          <tr>
            <td
              colSpan={2}
              className="border-r border-black p-2 text-right uppercase"
            >
              Total Acumulado
            </td>
            <td className="p-2 text-right text-[13px]">
              R$ {formatCurrency(faturamentoTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </RelatorioPrintChrome>
  );
}

export default function RelatorioVendasPrintPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <RelatorioVendasPrintContent />
    </Suspense>
  );
}
