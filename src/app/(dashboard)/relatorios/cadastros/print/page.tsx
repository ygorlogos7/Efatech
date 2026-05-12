"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRelatorioCadastros } from "@/actions/relatorios";
import { RelatorioPrintChrome } from "@/components/relatorios/RelatorioPrintChrome";

function RelatorioCadastrosPrintContent() {
  const searchParams = useSearchParams();
  const observacao = searchParams.get("observacao") || "";

  const [data, setData] = useState({
    clientes: 0,
    produtos: 0,
    fornecedores: 0,
    funcionarios: 0,
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const resp = await getRelatorioCadastros({ observacao });
      if (resp.success && resp.data) {
        setData({
          clientes: resp.data.clientes ?? 0,
          produtos: resp.data.produtos ?? 0,
          fornecedores: resp.data.fornecedores ?? 0,
          funcionarios: resp.data.funcionarios ?? 0,
        });
      }
    });
  }, [observacao]);

  const total =
    data.clientes +
    data.produtos +
    data.fornecedores +
    data.funcionarios;

  const rows = [
    { label: "Clientes ativos", value: data.clientes },
    { label: "Produtos ativos", value: data.produtos },
    { label: "Fornecedores ativos", value: data.fornecedores },
    { label: "Colaboradores ativos", value: data.funcionarios },
  ];

  if (isPending)
    return <div className="p-8">Gerando relatório de cadastros...</div>;

  return (
    <RelatorioPrintChrome
      backHref="/relatorios/cadastros"
      reportSubtitle="Relatório Consolidado de Cadastros"
    >
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold w-1/3 bg-gray-50">
              Tipo de Relatório
            </td>
            <td className="p-1.5 uppercase font-bold">
              Cadastros Ativos (Consolidado)
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Referência
            </td>
            <td className="p-1.5">Posição na data de emissão do relatório</td>
          </tr>
          {observacao ? (
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 font-bold bg-gray-50">
                Observação
              </td>
              <td className="p-1.5">{observacao}</td>
            </tr>
          ) : null}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Total consolidado (soma dos grupos)
            </td>
            <td className="p-1.5 font-bold">{total}</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Média aproximada por grupo
            </td>
            <td className="p-1.5 font-bold text-[14px]">
              {total > 0 ? Math.round(total / 4) : 0}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12px] font-bold mb-2 uppercase border-b border-black pb-1">
        Detalhamento por Indicador
      </h2>

      <table className="w-full border-collapse border border-black text-center mb-10">
        <thead className="bg-gray-100 border-b border-black font-bold text-[10px]">
          <tr>
            <td className="border-r border-black p-1.5 text-left">Indicador</td>
            <td className="p-1.5 text-right">Quantidade</td>
          </tr>
        </thead>
        <tbody className="text-[10px]">
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-black last:border-b">
              <td className="border-r border-black p-1.5 text-left font-medium">
                {row.label}
              </td>
              <td className="p-1.5 text-right font-bold">{row.value}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-bold text-[11px]">
          <tr>
            <td className="border-r border-black p-2 text-right uppercase">
              Total consolidado
            </td>
            <td className="p-2 text-right text-[13px]">{total}</td>
          </tr>
        </tfoot>
      </table>
    </RelatorioPrintChrome>
  );
}

export default function RelatorioCadastrosPrintPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <RelatorioCadastrosPrintContent />
    </Suspense>
  );
}
