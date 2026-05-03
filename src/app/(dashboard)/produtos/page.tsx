{/*Alterações:
  19/04/26 - adicionado limite de 20 itens na pagina,adicionado botoes de avançar para proxima pagina 
*/}


import React from "react";
import Link from "next/link";
import { SearchIcon, PlusCircle, Edit2, Box, Package, Copy, Upload, Download, Settings, Trash2, DollarSign, Tag, Printer, Share2, Mail, MessageCircle, FileText, RefreshCw, Coins, Home } from "lucide-react";
import { getProdutos } from "@/actions/produtos";
import { DeleteProdutoButton } from "@/components/forms/DeleteProdutoButton";
import { MoreActionsDropdown } from "@/components/common/MoreActionsDropdown";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ pesquisa?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const pesquisa = resolvedParams?.pesquisa || "";
  const page = Number(resolvedParams?.page) || 1; {/* 19/04/26 - pagina atual*/ }
  const { success, data: items, total = 0 } = await getProdutos(pesquisa, page, 20); {/* 19/04/26 - total de itens limitados a 20 */ }
  const from = total === 0 ? 0 : (page - 1) * 20 + 1; {/* 19/04/26 - total de itens*/ }
  const to = total === 0 ? 0 : Math.min(page * 20, total); {/* 19/04/26 - total de itens*/ }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-gray-900 font-bold text-2xl mb-0">Produtos</h2>
          <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <Home className="w-3 h-3" />
            <Link href="/home" className="hover:underline">Início</Link>
            <span>&gt;</span>
            <span>Produtos</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form method="get" className="m-0">
            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden px-3 py-1.5 focus-within:ring-1 focus-within:ring-green-500 transition-all shadow-sm">
              <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                name="pesquisa"
                defaultValue={pesquisa}
                className="outline-none text-sm w-[200px] text-gray-700"
                placeholder="Buscar por Produto..."
              />
            </div>
          </form>

          <Link href="/produtos/create" className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 transition-colors text-white text-sm font-bold px-4 py-2 rounded shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Adicionar
          </Link>

          <MoreActionsDropdown
            actions={[
              { label: "Importar de uma planilha", icon: <Upload className="w-4 h-4" />, href: "/produtos/import" },
              { label: "Exportar cadastros", icon: <Download className="w-4 h-4" /> },
              { label: "Ajustar valores em massa", icon: <DollarSign className="w-4 h-4 text-green-600" /> },
              { label: "Ajustar produtos em massa", icon: <Settings className="w-4 h-4" /> },
              { label: "Gerar etiquetas", icon: <Tag className="w-4 h-4 text-blue-500" />, href: "/produtos/etiquetas" },
              { label: "Excluir produtos", icon: <Trash2 className="w-4 h-4 text-red-500" /> },
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle border-collapse min-w-[800px]">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
              <tr>
                <th className="py-3 px-6 w-[100px]">Cod. Barras</th>
                <th className="py-3 px-6">Nome do Produto</th>
                <th className="py-3 px-4 text-center">Estoque</th>
                <th className="py-3 px-4 text-right">Preço</th>
                <th className="py-3 px-4 text-center">Situação</th>
                <th className="py-3 px-6 text-right w-[140px]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!success || !items || items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <h5 className="text-lg font-medium text-gray-700">Nenhum produto encontrado no estoque</h5>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 font-mono text-gray-500">{item.Cod_CodigoBarras}</td>
                    <td className="py-3 px-6 font-bold text-gray-900">{item.Cod_Nome}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      <span className={`inline-block px-2 py-0.5 rounded ${item.Cod_Estoque > 10 ? 'bg-green-100 text-green-800' : (item.Cod_Estoque > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                        {item.Cod_Estoque} un.
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700 font-medium">R$ {Number(item.Cod_Preco).toFixed(2).replace('.', ',')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                        {item.Ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/produtos/preview/${item.Id}`}
                          className="flex items-center justify-center w-[30px] h-[30px] bg-[#00c0ef] hover:bg-[#00a7d0] text-white rounded-[3px] transition-colors shadow-sm"
                          title="Visualizar"
                        >
                          <SearchIcon className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/produtos/edit/${item.Id}`}
                          className="flex items-center justify-center w-[30px] h-[30px] bg-[#f39c12] hover:bg-[#db8b0b] text-white rounded-[3px] transition-colors shadow-sm"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <DeleteProdutoButton id={item.Id} nome={item.Cod_Nome} />
                        <MoreActionsDropdown
                          variant="row"
                          actions={[
                            { label: "Clonar", icon: <Copy className="w-4 text-orange-500 h-4" />, href: `/produtos/create?cloneId=${item.Id}` },
                            {
                              label: "Imprimir",
                              icon: <Printer className="w-4 h-4" />,
                              subItems: [
                                { label: "Etiqueta", icon: <Tag className="w-3.5 h-3.5" /> },
                                { label: "Ficha Técnica", icon: <FileText className="w-3.5 h-3.5" /> },
                              ]
                            },
                            {
                              label: "Compartilhar",
                              icon: <Share2 className="w-4 h-4" />,
                              subItems: [
                                { label: "WhatsApp", icon: <MessageCircle className="w-3.5 h-3.5" /> },
                                { label: "E-mail", icon: <Mail className="w-3.5 h-3.5" /> },
                              ]
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>{/* 19/04/26 - paginação */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white border-b rounded-b-md">
          {/* Texto dinâmico que você já começou */}
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span> de um total de <span className="font-medium">{total}</span>
          </div>

          {/* Botões que Funcionam de Verdade */}
          <div className="flex items-center -space-x-px">
            {/* Botão Anterior */}
            <Link
              href={`/produtos?page=${Math.max(1, page - 1)}&pesquisa=${pesquisa}`}
              className={`px-3 py-2 border border-gray-200 text-gray-500 rounded-l-md hover:bg-gray-50 transition-colors ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              ‹
            </Link>

            {/* Gerador de Números de Página */}
            {Array.from({ length: Math.ceil(total / 20) }).map((_, i) => {
              const p = i + 1;
              // Mostra apenas páginas próximas da atual
              if (p === 1 || p === Math.ceil(total / 20) || (p >= page - 1 && p <= page + 1)) {
                return (
                  <Link
                    key={p}
                    href={`/produtos?page=${p}&pesquisa=${pesquisa}`}
                    className={`px-4 py-2 border border-gray-200 text-sm font-medium transition-colors ${page === p
                        ? "bg-[#0c1a25] text-white border-[#0c1a25] z-10"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {p}
                  </Link>
                );
              }
              // Coloca os "..."
              if (p === page - 2 || p === page + 2) return <span key={p} className="px-3 py-2 border border-gray-200 bg-white text-gray-400">...</span>;
              return null;
            })}

            {/* Botão Próximo */}
            <Link
              href={`/produtos?page=${Math.min(Math.ceil(total / 20), page + 1)}&pesquisa=${pesquisa}`}
              className={`px-3 py-2 border border-gray-200 text-gray-500 rounded-r-md hover:bg-gray-50 transition-colors ${page === Math.ceil(total / 20) || total === 0 ? 'pointer-events-none opacity-50' : ''}`}
            >
              ›
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
