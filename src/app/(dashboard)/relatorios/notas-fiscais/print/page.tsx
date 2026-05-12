"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRelatorioNotasFiscais } from "@/actions/relatorios";
import { RelatorioPrintChrome } from "@/components/relatorios/RelatorioPrintChrome";

type Linha = {
  id: string;
  origem: "Saída (NF-e)" | "Entrada (compra)";
  numero: string;
  data: string;
  parceiro: string;
  status: string;
  valor: number;
};

type LinhaComSort = Linha & { _t: number };

function RelatorioNotasFiscaisPrintContent() {
  const searchParams = useSearchParams();
  const texto = searchParams.get("texto") || "";

  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [isPending, startTransition] = useTransition();

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return "---";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const num = (v: unknown) => Number(v ?? 0);

  useEffect(() => {
    startTransition(async () => {
      const resp = await getRelatorioNotasFiscais();
      if (!resp.success || !resp.data) return;

      const nf = resp.data.notasFiscais || [];
      const nc = resp.data.notasCompra || [];

      const merged: Linha[] = (
        [
          ...nf.map(
            (n: any): LinhaComSort => ({
              id: `nf-${n.Id}`,
              origem: "Saída (NF-e)",
              numero:
                n.Numero != null && n.Serie != null
                  ? `${n.Numero}/${n.Serie}`
                  : String(n.Numero ?? "—"),
              data: formatDate(n.DataEmissao),
              parceiro: n.Destinatario || "—",
              status: n.Status || "—",
              valor: num(n.ValorTotal),
              _t: new Date(n.DataEmissao).getTime(),
            })
          ),
          ...nc.map(
            (n: any): LinhaComSort => ({
              id: `nc-${n.Id}`,
              origem: "Entrada (compra)",
              numero:
                n.Numero != null && n.Serie != null
                  ? `${n.Numero}/${n.Serie}`
                  : String(n.Numero ?? "—"),
              data: formatDate(n.DataEntrada || n.DataEmissao),
              parceiro: n.Fornecedor || "—",
              status: "Entrada",
              valor: num(n.ValorTotal),
              _t: new Date(n.DataEntrada || n.DataEmissao || 0).getTime(),
            })
          ),
        ] as LinhaComSort[]
      )
        .sort((a, b) => b._t - a._t)
        .map(({ _t, ...row }) => row);

      const t = texto.trim().toLowerCase();
      setLinhas(
        t
          ? merged.filter(
              (l) =>
                l.parceiro.toLowerCase().includes(t) ||
                l.numero.toLowerCase().includes(t) ||
                l.status.toLowerCase().includes(t)
            )
          : merged
      );
    });
  }, [texto]);

  const saida = linhas.filter((l) => l.origem.startsWith("Saída"));
  const entrada = linhas.filter((l) => l.origem.startsWith("Entrada"));
  const valorSaida = saida.reduce((a, l) => a + l.valor, 0);
  const valorEntrada = entrada.reduce((a, l) => a + l.valor, 0);

  if (isPending)
    return <div className="p-8">Gerando relatório de notas fiscais...</div>;

  return (
    <RelatorioPrintChrome
      backHref="/relatorios/notas-fiscais"
      reportSubtitle="Relatório de Notas Fiscais e Entradas"
    >
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold w-1/3 bg-gray-50">
              Tipo de Relatório
            </td>
            <td className="p-1.5 uppercase font-bold">
              NF-e de saída e notas de compra (amostra)
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Registros na lista
            </td>
            <td className="p-1.5 font-bold">{linhas.length}</td>
          </tr>
          {texto ? (
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 font-bold bg-gray-50">
                Filtro
              </td>
              <td className="p-1.5">{texto}</td>
            </tr>
          ) : null}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              NF-e — quantidade / valor
            </td>
            <td className="p-1.5 font-bold">
              {saida.length} — R$ {formatCurrency(valorSaida)}
            </td>
          </tr>
          <tr>
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Compras — quantidade / valor
            </td>
            <td className="p-1.5 font-bold text-[14px]">
              {entrada.length} — R$ {formatCurrency(valorEntrada)}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12px] font-bold mb-2 uppercase border-b border-black pb-1">
        Detalhamento por Documento
      </h2>

      <table className="w-full border-collapse border border-black text-center mb-10">
        <thead className="bg-gray-100 border-b border-black font-bold text-[10px]">
          <tr>
            <td className="border-r border-black p-1.5 text-left">Origem</td>
            <td className="border-r border-black p-1.5">Número</td>
            <td className="border-r border-black p-1.5">Data</td>
            <td className="border-r border-black p-1.5 text-left">
              Destinatário / Fornecedor
            </td>
            <td className="border-r border-black p-1.5">Status</td>
            <td className="p-1.5 text-right">Valor</td>
          </tr>
        </thead>
        <tbody className="text-[10px]">
          {linhas.map((l) => (
            <tr key={l.id} className="border-b border-black last:border-b">
              <td className="border-r border-black p-1.5 text-left font-medium whitespace-nowrap">
                {l.origem}
              </td>
              <td className="border-r border-black p-1.5">{l.numero}</td>
              <td className="border-r border-black p-1.5">{l.data}</td>
              <td className="border-r border-black p-1.5 text-left">
                {l.parceiro}
              </td>
              <td className="border-r border-black p-1.5">{l.status}</td>
              <td className="p-1.5 text-right font-bold">
                R$ {formatCurrency(l.valor)}
              </td>
            </tr>
          ))}
          {linhas.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="p-4 text-center text-gray-400 italic"
              >
                Nenhuma nota encontrada.
              </td>
            </tr>
          ) : null}
        </tbody>
        <tfoot className="bg-gray-50 font-bold text-[11px]">
          <tr>
            <td
              colSpan={5}
              className="border-r border-black p-2 text-right uppercase"
            >
              Valor total listado
            </td>
            <td className="p-2 text-right text-[13px]">
              R$ {formatCurrency(linhas.reduce((a, l) => a + l.valor, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </RelatorioPrintChrome>
  );
}

export default function RelatorioNotasFiscaisPrintPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <RelatorioNotasFiscaisPrintContent />
    </Suspense>
  );
}
