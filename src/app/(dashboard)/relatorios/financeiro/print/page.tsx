"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRelatorioFinanceiro } from "@/actions/relatorios";
import { RelatorioPrintChrome } from "@/components/relatorios/RelatorioPrintChrome";

type ContaPagar = {
  Id: number;
  Descricao: string;
  Valor: unknown;
  Vencimento: Date | string;
  Pagamento?: Date | string | null;
};

type ContaReceber = {
  Id: number;
  Descricao: string;
  Valor: unknown;
  Vencimento: Date | string;
  Recebimento?: Date | string | null;
};

type Linha = {
  id: string;
  tipo: "Pagar" | "Receber";
  descricao: string;
  vencimento: string;
  valor: number;
  situacao: string;
};

type LinhaComSort = Linha & { _t: number };

function RelatorioFinanceiroPrintContent() {
  const searchParams = useSearchParams();
  const texto = searchParams.get("texto") || "";

  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [isPending, startTransition] = useTransition();

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (d: Date | string) => {
    if (!d) return "---";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const num = (v: unknown) => Number(v ?? 0);

  useEffect(() => {
    startTransition(async () => {
      const resp = await getRelatorioFinanceiro({});
      if (!resp.success || !resp.data) return;

      const cp = (resp.data.contasPagar || []) as ContaPagar[];
      const cr = (resp.data.contasReceber || []) as ContaReceber[];

      const merged: Linha[] = (
        [
          ...cp.map(
            (c): LinhaComSort => ({
              id: `p-${c.Id}`,
              tipo: "Pagar",
              descricao: c.Descricao,
              vencimento: formatDate(c.Vencimento),
              valor: num(c.Valor),
              situacao: c.Pagamento ? "Pago" : "Pendente",
              _t: new Date(c.Vencimento).getTime(),
            })
          ),
          ...cr.map(
            (c): LinhaComSort => ({
              id: `r-${c.Id}`,
              tipo: "Receber",
              descricao: c.Descricao,
              vencimento: formatDate(c.Vencimento),
              valor: num(c.Valor),
              situacao: c.Recebimento ? "Recebido" : "Pendente",
              _t: new Date(c.Vencimento).getTime(),
            })
          ),
        ] as LinhaComSort[]
      )
        .sort((a, b) => b._t - a._t)
        .map(({ _t, ...row }) => row);

      const t = texto.trim().toLowerCase();
      setLinhas(
        t
          ? merged.filter((l) => l.descricao.toLowerCase().includes(t))
          : merged
      );
    });
  }, [texto]);

  const aPagarPendente = linhas
    .filter((l) => l.tipo === "Pagar" && l.situacao === "Pendente")
    .reduce((a, l) => a + l.valor, 0);
  const aReceberPendente = linhas
    .filter((l) => l.tipo === "Receber" && l.situacao === "Pendente")
    .reduce((a, l) => a + l.valor, 0);

  if (isPending)
    return <div className="p-8">Gerando relatório financeiro...</div>;

  return (
    <RelatorioPrintChrome
      backHref="/relatorios/financeiro"
      reportSubtitle="Relatório de Contas a Pagar e Receber (recentes)"
    >
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold w-1/3 bg-gray-50">
              Tipo de Relatório
            </td>
            <td className="p-1.5 uppercase font-bold">
              Lançamentos financeiros (amostra)
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Escopo
            </td>
            <td className="p-1.5">
              Últimas contas a pagar e receber carregadas no sistema
            </td>
          </tr>
          {texto ? (
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 font-bold bg-gray-50">
                Filtro por descrição
              </td>
              <td className="p-1.5">{texto}</td>
            </tr>
          ) : null}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              A pagar (pendente)
            </td>
            <td className="p-1.5 font-bold">
              R$ {formatCurrency(aPagarPendente)}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              A receber (pendente)
            </td>
            <td className="p-1.5 font-bold">
              R$ {formatCurrency(aReceberPendente)}
            </td>
          </tr>
          <tr>
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Saldo líquido (pendente)
            </td>
            <td className="p-1.5 font-bold text-[14px]">
              R$ {formatCurrency(aReceberPendente - aPagarPendente)}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12px] font-bold mb-2 uppercase border-b border-black pb-1">
        Detalhamento dos Lançamentos
      </h2>

      <table className="w-full border-collapse border border-black text-center mb-10">
        <thead className="bg-gray-100 border-b border-black font-bold text-[10px]">
          <tr>
            <td className="border-r border-black p-1.5 text-left">Tipo</td>
            <td className="border-r border-black p-1.5 text-left">Descrição</td>
            <td className="border-r border-black p-1.5">Vencimento</td>
            <td className="border-r border-black p-1.5">Situação</td>
            <td className="p-1.5 text-right">Valor</td>
          </tr>
        </thead>
        <tbody className="text-[10px]">
          {linhas.map((l) => (
            <tr key={l.id} className="border-b border-black last:border-b">
              <td className="border-r border-black p-1.5 text-left font-medium whitespace-nowrap">
                {l.tipo === "Pagar" ? "Pagar" : "Receber"}
              </td>
              <td className="border-r border-black p-1.5 text-left">
                {l.descricao}
              </td>
              <td className="border-r border-black p-1.5">{l.vencimento}</td>
              <td className="border-r border-black p-1.5">{l.situacao}</td>
              <td className="p-1.5 text-right font-bold">
                R$ {formatCurrency(l.valor)}
              </td>
            </tr>
          ))}
          {linhas.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-4 text-center text-gray-400 italic"
              >
                Nenhum lançamento encontrado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </RelatorioPrintChrome>
  );
}

export default function RelatorioFinanceiroPrintPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <RelatorioFinanceiroPrintContent />
    </Suspense>
  );
}
