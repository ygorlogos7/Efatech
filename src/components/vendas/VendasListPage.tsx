import React from "react";
import Link from "next/link";
import { PlusCircle, Edit2, Eye, ShoppingBasket, Printer, Share2, FileText, RefreshCw, Coins, DollarSign, CheckSquare, MessageCircle, Mail } from "lucide-react";
import { getVendas } from "@/actions/vendas";
import { getWhatsAppLink, getBaseUrl } from "@/lib/whatsapp";

import { MoreActionsDropdown } from "@/components/common/MoreActionsDropdown";
import { DeleteVendaButton } from "@/components/forms/DeleteVendaButton";


import { VendasHeader } from "./VendasHeader";



interface VendasListPageProps {
  tipo: "produtos" | "balcao" | "servicos";
  title: string;
  page?: number;
}

export async function VendasListPage({ tipo, title, page = 1 }: VendasListPageProps) {
  const { success, data: items, total = 0 } = await getVendas(tipo, page, 20);
  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = total === 0 ? 0 : Math.min(page * 20, total);

  return (
    <div className="space-y-6">
      <VendasHeader tipo={tipo} title={title} items={items} />

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[850px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-[80px]">Venda Nº</th>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4 text-right">Produtos</th>
              <th className="py-3 px-4 text-right">Serviços</th>
              <th className="py-3 px-4 text-right">Desconto</th>
              <th className="py-3 px-4 text-right pr-10">Valor</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-6 text-right w-[180px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!success || !items || items.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-500">
                  <ShoppingBasket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <h5 className="text-lg font-medium text-gray-700">Nenhuma venda de {tipo} encontrada.</h5>
                </td>
              </tr>
            ) : (
              (items as any[]).map((item) => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">#{item.Numero}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(item.DataVenda).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-4 text-right text-gray-600">R$ {item.TotalProdutos.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-right text-gray-600">R$ {item.TotalServicos.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-right text-red-500">- R$ {item.Desconto.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-700">R$ {item.Total.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                      {item.Ativo ? "Concluída" : "Cancelada"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Link 
                        href={`/vendas/${tipo}/preview/${item.Id}`} 
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#00c0ef] hover:bg-[#00a7d0] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Visualizar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link 
                        href={`/vendas/${tipo}/edit/${item.Id}`} 
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#f39c12] hover:bg-[#db8b0b] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteVendaButton id={item.Id} numero={item.Numero} tipo={tipo} />
                      <MoreActionsDropdown 
                        variant="row"
                        actions={[
                          { label: "Link de cobrança", icon: <DollarSign className="w-4 h-4" /> },
                          { 
                            label: "Imprimir", 
                            icon: <Printer className="w-4 h-4" />,
                            subItems: [
                              { label: "Formato A4", href: `/vendas/${tipo}/print-a4/${item.Id}` },
                              { label: "Cupom Térmico", href: `/vendas/${tipo}/print/${item.Id}` },
                            ]
                          },
                          { label: "Alterar situação", icon: <CheckSquare className="w-4 h-4" /> },
                          { 
                            label: "Compartilhar", 
                            icon: <Share2 className="w-4 h-4" />,
                            subItems: [
                              { label: "Via E-mail", icon: <Mail className="w-3.5 h-3.5" /> },
                              { 
                                label: "Via WhatsApp", 
                                icon: <MessageCircle className="w-3.5 h-3.5" />,
                                href: getWhatsAppLink(item.Cliente?.TelefoneCelular || item.Cliente?.Telefone || item.Cliente?.TelefoneComercial, `Olá ${item.Cliente?.Nome || ""}, sua venda #${item.Numero} foi concluída. Você pode visualizar o comprovante em PDF através deste link: ${getBaseUrl()}/vendas/${tipo}/print-a4/${item.Id}`) || undefined,
                                alertMessage: !(item.Cliente?.TelefoneCelular || item.Cliente?.Telefone || item.Cliente?.TelefoneComercial) ? "Este cliente não possui telefone/celular cadastrado!" : undefined,
                                target: "_blank"
                              },
                            ]
                          },
                          { 
                            label: "Emitir", 
                            icon: <FileText className="w-4 h-4" />,
                            subItems: [
                              { label: "NF-e" },
                              { label: "NFC-e" },
                              { label: "NFS-e" },
                            ]
                          },
                          { label: "Gerar", icon: <RefreshCw className="w-4 h-4" /> },
                          { label: "Ver no financeiro", icon: <Coins className="w-4 h-4" /> },
                        ]} 
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white rounded-b-md gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            Mostrando <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span> de <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center -space-x-px">
            <Link
              href={`/vendas/${tipo}?page=${Math.max(1, page - 1)}`}
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
                    href={`/vendas/${tipo}?page=${p}`}
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
              href={`/vendas/${tipo}?page=${Math.min(Math.ceil(total / 20), page + 1)}`}
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
