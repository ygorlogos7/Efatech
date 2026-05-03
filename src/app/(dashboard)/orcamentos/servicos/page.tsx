import React from "react";
import Link from "next/link";
import { PlusCircle, SearchIcon, Wrench, Printer, Share2, FileText, RefreshCw, Coins, DollarSign, CheckSquare, MessageCircle, Mail, Edit2, Home } from "lucide-react";
import { getOrcamentosServicos } from "@/actions/orcamentos";
import { MoreActionsDropdown } from "@/components/common/MoreActionsDropdown";
import { DeleteOrcamentoButton } from "@/components/forms/DeleteOrcamentoButton";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { headers } from "next/headers";
import { OrcamentoActions } from "@/components/orcamentos/OrcamentoActions";
import { prisma } from "@/lib/prisma";

export default async function OrcamentosServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ pesquisa?: string }>;
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const defaultBaseUrl = host ? `${protocol}://${host}` : "";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || defaultBaseUrl || "https://seu-sistema.com";

  const resolvedParams = await searchParams;
  const pesquisa = resolvedParams?.pesquisa || "";
  const page = Number(resolvedParams?.page) || 1;
  const { success, data: items, total = 0 } = await getOrcamentosServicos(pesquisa, page, 20);
  
  // Buscar situações para o dropdown
  const { data: situacoes = [] } = await prisma.orcamentoSituacao.findMany({ 
    where: { Ativo: true },
    orderBy: { Nome: "asc" }
  }).then(res => ({ data: res })).catch(() => ({ data: [] }));
  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = total === 0 ? 0 : Math.min(page * 20, total);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-gray-900 font-bold text-2xl mb-0">Orçamentos — Serviços</h2>
          <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <Home className="w-3 h-3" />
            <Link href="/home" className="hover:underline">Início</Link>
            <span>&gt;</span>
            <span>Serviços</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form method="get" className="m-0">
            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden px-3 py-1.5 focus-within:ring-1 focus-within:ring-green-500 transition-all shadow-sm">
              <button type="submit" className="p-0 border-none bg-transparent flex items-center">
                <SearchIcon className="w-4 h-4 text-gray-400 mr-2 cursor-pointer hover:text-green-500 transition-colors" />
              </button>
              <input 
                type="text" 
                name="pesquisa" 
                defaultValue={pesquisa} 
                className="outline-none text-sm w-[180px] text-gray-700" 
                placeholder="Nº do orçamento..." 
              />
            </div>
          </form>

          <Link href="/orcamentos/servicos/create" className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 transition-colors text-white text-sm font-bold px-4 py-2 rounded shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Novo Orçamento
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Nº</th>
              <th className="py-3 px-4">Data Emissão</th>
              <th className="py-3 px-4">Validade</th>
              <th className="py-3 px-4 text-right">Total Serviços</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-center">Situação</th>
              <th className="py-3 px-6 text-right w-[150px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!success || !items || items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <h5 className="text-lg font-medium text-gray-700">Nenhum orçamento de serviços encontrado.</h5>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 font-bold text-gray-900">{item.Numero}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(item.DataEmissao).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-4 text-gray-600">{item.DataValidade ? new Date(item.DataValidade).toLocaleDateString("pt-BR") : "-"}</td>
                  <td className="py-3 px-4 text-right font-medium">R$ {item.TotalServicos.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-700">R$ {item.Total.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-center">
                    {item.Situacao ? (
                      <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase rounded text-white shadow-sm" style={{ backgroundColor: item.Situacao.Cor || "#6c757d" }}>
                        {item.Situacao.Nome}
                      </span>
                    ) : (
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {item.Ativo ? "Aberto" : "Encerrado"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-1 items-center">
                      <Link
                        href={`/orcamentos/servicos/preview/${item.Id}`}
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#00c0ef] hover:bg-[#00a7d0] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Visualizar"
                      >
                        <SearchIcon className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/orcamentos/servicos/edit/${item.Id}`}
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#f39c12] hover:bg-[#db8b0b] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteOrcamentoButton id={item.Id} numero={item.Numero} />
                      <OrcamentoActions item={item} baseUrl={baseUrl} tipo="servicos" situacoes={situacoes} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-md">
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span> de um total de <span className="font-medium">{total}</span>
        </div>

        <div className="flex items-center -space-x-px">
          <Link
            href={`/orcamentos/servicos?page=${Math.max(1, page - 1)}${pesquisa ? `&pesquisa=${pesquisa}` : ""}`}
            className={`px-3 py-2 border border-gray-200 text-gray-500 rounded-l-md hover:bg-gray-50 transition-colors ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            ‹
          </Link>

          {Array.from({ length: Math.ceil(total / 20) }).map((_, i) => {
            const p = i + 1;
            if (p === 1 || p === Math.ceil(total / 20) || (p >= page - 1 && p <= page + 1)) {
              return (
                <Link
                  key={p}
                  href={`/orcamentos/servicos?page=${p}${pesquisa ? `&pesquisa=${pesquisa}` : ""}`}
                  className={`px-4 py-2 border border-gray-200 text-sm font-medium transition-colors ${page === p
                      ? "bg-[#0c1a25] text-white border-[#0c1a25] z-10"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {p}
                </Link>
              );
            }
            if (p === page - 2 || p === page + 2) return <span key={p} className="px-3 py-2 border border-gray-200 bg-white text-gray-400">...</span>;
            return null;
          })}

          <Link
            href={`/orcamentos/servicos?page=${Math.min(Math.ceil(total / 20), page + 1)}${pesquisa ? `&pesquisa=${pesquisa}` : ""}`}
            className={`px-3 py-2 border border-gray-200 text-gray-500 rounded-r-md hover:bg-gray-50 transition-colors ${page === Math.ceil(total / 20) || total === 0 ? 'pointer-events-none opacity-50' : ''}`}
          >
            ›
          </Link>
        </div>
      </div>
    </div>
  );
}
