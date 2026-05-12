import React from "react";
import Link from "next/link";
import { SearchIcon, PlusCircle, Edit2, ClipboardList, Printer, Eye, Share2, FileText, DollarSign, CheckSquare, Coins, MessageCircle, Mail, Home } from "lucide-react";
import { getOrdensServico } from "@/actions/ordensServico";
import { DeleteOSButton } from "@/components/forms/DeleteOSButton";
import { headers } from "next/headers";
import { OSActions } from "@/components/ordens-servico/OSActions";

export default async function OrdensServicoPage({
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
  const { success, data: items, total = 0 } = await getOrdensServico(pesquisa, page, 20);

  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = total === 0 ? 0 : Math.min(page * 20, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-md shadow-sm border border-gray-200 gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-gray-900 font-bold text-xl sm:text-2xl mb-0">Ordens de Serviço</h2>
          <div className="text-gray-400 text-[10px] sm:text-xs flex items-center gap-1">
            <Home className="w-3 h-3" />
            <Link href="/home" className="hover:underline">Início</Link>
            <span>&gt;</span>
            <span>Ordens de Serviço</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <form method="get" className="m-0">
            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden px-3 py-1.5 focus-within:ring-1 focus-within:ring-green-500 transition-all shadow-sm">
              <button type="submit" className="p-0 border-none bg-transparent flex items-center">
                <SearchIcon className="w-4 h-4 text-gray-400 mr-2 cursor-pointer hover:text-green-500 transition-colors" />
              </button>
              <input 
                type="text" 
                name="pesquisa" 
                defaultValue={pesquisa} 
                className="outline-none text-sm w-[200px] text-gray-700" 
                placeholder="Equipamento ou defeito..." 
              />
            </div>
          </form>

          <Link href="/ordens-servico/create" className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 transition-colors text-white text-sm font-bold px-4 py-2 rounded shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Nova O.S.
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-[80px]">OS Nº</th>
              <th className="py-3 px-4">Equipamento</th>
              <th className="py-3 px-6">Defeito</th>
              <th className="py-3 px-4">Abertura</th>
              <th className="py-3 px-4">Previsão</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right w-[130px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!success || !items || items.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <h5 className="text-lg font-medium text-gray-700">Nenhuma ordem de serviço encontrada.</h5>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{item.Numero}</td>
                  <td className="py-3 px-4 text-gray-700">{item.Equipamento || "-"}</td>
                  <td className="py-3 px-6 text-gray-600 max-w-[200px] truncate">{item.Defeito || "-"}</td>
                  <td className="py-3 px-4 text-gray-500" suppressHydrationWarning>{new Date(item.DataAbertura).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-4 text-gray-700" suppressHydrationWarning>{item.DataPrevisao ? new Date(item.DataPrevisao).toLocaleDateString("pt-BR") : "-"}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-700">R$ {item.Total.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {item.Ativo ? "Aberta" : "Encerrada"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Link 
                        href={`/ordens-servico/preview/${item.Id}`} 
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#00c0ef] hover:bg-[#00a7d0] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Visualizar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link 
                        href={`/ordens-servico/edit/${item.Id}`} 
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#f39c12] hover:bg-[#db8b0b] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteOSButton id={item.Id} numero={item.Numero} />
                      <OSActions item={item} baseUrl={baseUrl} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
      
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white rounded-b-md gap-4">
        <div className="text-xs sm:text-sm text-gray-600">
          Mostrando <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span> de <span className="font-medium">{total}</span>
        </div>

        <div className="flex items-center -space-x-px">
          <Link
            href={`/ordens-servico?page=${Math.max(1, page - 1)}`}
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
                  href={`/ordens-servico?page=${p}`}
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
            href={`/ordens-servico?page=${Math.min(Math.ceil(total / 20), page + 1)}`}
            className={`px-3 py-2 border border-gray-200 text-gray-500 rounded-r-md hover:bg-gray-50 transition-colors ${page === Math.ceil(total / 20) || total === 0 ? 'pointer-events-none opacity-50' : ''}`}
          >
            ›
          </Link>
        </div>
      </div>
    </div>
  );
}
