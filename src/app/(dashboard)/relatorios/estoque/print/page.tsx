"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRelatorioEstoque } from "@/actions/relatorios";
import { RelatorioPrintChrome } from "@/components/relatorios/RelatorioPrintChrome";

type ProdutoRow = {
  Id: number;
  Cod_Nome: string;
  Cod_Estoque: number;
  Cod_Preco: unknown;
};

function RelatorioEstoquePrintContent() {
  const searchParams = useSearchParams();
  const nome = searchParams.get("nome") || "";

  const [items, setItems] = useState<ProdutoRow[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const resp = await getRelatorioEstoque({});
      if (resp.success && Array.isArray(resp.data)) {
        setItems(resp.data as ProdutoRow[]);
      }
    });
  }, []);

  const num = (v: unknown) => Number(v ?? 0);

  const filtered = items.filter((p) =>
    nome ? p.Cod_Nome.toLowerCase().includes(nome.toLowerCase()) : true
  );

  const somaEstoque = filtered.reduce((a, p) => a + (p.Cod_Estoque || 0), 0);
  const valorEstoque = filtered.reduce(
    (a, p) => a + num(p.Cod_Preco) * (p.Cod_Estoque || 0),
    0
  );

  const PAGE_SIZE = 20;
  const chunks: ProdutoRow[][] =
    filtered.length === 0
      ? [[]]
      : Array.from(
          { length: Math.ceil(filtered.length / PAGE_SIZE) },
          (_, i) =>
            filtered.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
        );
  const totalPaginas = chunks.length;

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (isPending)
    return <div className="p-8">Gerando relatório de estoque...</div>;

  return (
    <RelatorioPrintChrome
      backHref="/relatorios/estoque"
      reportSubtitle="Relatório de Posição de Estoque"
    >
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold w-1/3 bg-gray-50">
              Tipo de Relatório
            </td>
            <td className="p-1.5 uppercase font-bold">
              Inventário — produtos ativos
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Filtro por nome
            </td>
            <td className="p-1.5">{nome || "— (todos)"}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Itens listados
            </td>
            <td className="p-1.5 font-bold">{filtered.length}</td>
          </tr>
          {filtered.length > PAGE_SIZE ? (
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 font-bold bg-gray-50">
                Detalhamento em páginas
              </td>
              <td className="p-1.5">
                {totalPaginas} páginas de até {PAGE_SIZE} produtos
              </td>
            </tr>
          ) : null}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Unidades em estoque (soma)
            </td>
            <td className="p-1.5 font-bold">{somaEstoque}</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1.5 font-bold bg-gray-50">
              Valor aproximado (preço × quantidade)
            </td>
            <td className="p-1.5 font-bold text-[14px]">
              R$ {formatCurrency(valorEstoque)}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12px] font-bold mb-2 uppercase border-b border-black pb-1">
        Detalhamento por Produto (máx. {PAGE_SIZE} itens por página)
      </h2>

      {chunks.map((chunk, pageIndex) => {
        const isLast = pageIndex === chunks.length - 1;
        const from = filtered.length === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
        const to =
          filtered.length === 0
            ? 0
            : Math.min((pageIndex + 1) * PAGE_SIZE, filtered.length);

        return (
          <div
            key={pageIndex}
            className="mb-8 last:mb-10"
            style={
              !isLast ? ({ breakAfter: "page" } as React.CSSProperties) : undefined
            }
          >
            {totalPaginas > 1 ? (
              <p className="text-[10px] font-bold text-gray-600 mb-2">
                Página {pageIndex + 1} de {totalPaginas} — itens {from} a {to}{" "}
                de {filtered.length}
              </p>
            ) : null}

            <table className="w-full border-collapse border border-black text-center">
              <thead className="bg-gray-100 border-b border-black font-bold text-[10px]">
                <tr>
                  <td className="border-r border-black p-1.5 text-left">
                    Produto
                  </td>
                  <td className="border-r border-black p-1.5">Estoque</td>
                  <td className="border-r border-black p-1.5 text-right">
                    Preço unit.
                  </td>
                  <td className="p-1.5 text-right">Subtotal</td>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {chunk.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-gray-400 italic"
                    >
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  chunk.map((p) => (
                    <tr
                      key={p.Id}
                      className="border-b border-black last:border-b"
                    >
                      <td className="border-r border-black p-1.5 text-left font-medium">
                        {p.Cod_Nome}
                      </td>
                      <td className="border-r border-black p-1.5">
                        {p.Cod_Estoque}
                      </td>
                      <td className="border-r border-black p-1.5 text-right">
                        R$ {formatCurrency(num(p.Cod_Preco))}
                      </td>
                      <td className="p-1.5 text-right font-bold">
                        R$ {formatCurrency(num(p.Cod_Preco) * (p.Cod_Estoque || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {isLast && filtered.length > 0 ? (
                <tfoot className="bg-gray-50 font-bold text-[11px]">
                  <tr>
                    <td
                      colSpan={3}
                      className="border-r border-black p-2 text-right uppercase"
                    >
                      Valor aproximado total
                    </td>
                    <td className="p-2 text-right text-[13px]">
                      R$ {formatCurrency(valorEstoque)}
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        );
      })}
    </RelatorioPrintChrome>
  );
}

export default function RelatorioEstoquePrintPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <RelatorioEstoquePrintContent />
    </Suspense>
  );
}
