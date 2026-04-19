import React from "react";
import Link from "next/link";
import { PlusCircle, SearchIcon, Wrench, Printer, Share2, FileText, RefreshCw, Coins, DollarSign, CheckSquare, MessageCircle, Mail, Edit2 } from "lucide-react";
import { getOrcamentosServicos } from "@/actions/orcamentos";
import { MoreActionsDropdown } from "@/components/common/MoreActionsDropdown";
import { DeleteOrcamentoButton } from "@/components/forms/DeleteOrcamentoButton";

export default async function OrcamentosServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ pesquisa?: string }>;
}) {
  const resolvedParams = await searchParams;
  const pesquisa = resolvedParams?.pesquisa || "";
  const { success, data: items } = await getOrcamentosServicos(pesquisa);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Orçamentos — Serviços</h2>
        <div className="flex items-center gap-3">
          <form method="get">
            <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-green-500 transition-all">
              <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
              <input type="text" name="pesquisa" defaultValue={pesquisa} className="outline-none text-sm w-[180px] text-gray-700" placeholder="Nº do orçamento..." />
            </div>
          </form>
          <Link href="/orcamentos/servicos/create" className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">
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
                  <td className="py-3 px-6 font-bold text-gray-900">#{item.Numero}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(item.DataEmissao).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-4 text-gray-600">{item.DataValidade ? new Date(item.DataValidade).toLocaleDateString("pt-BR") : "-"}</td>
                  <td className="py-3 px-4 text-right font-medium">R$ {item.TotalServicos.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-700">R$ {item.Total.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-medium rounded border bg-yellow-50 text-yellow-700 border-yellow-200">
                      {item.Ativo ? "Aberto" : "Encerrado"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-1 items-center">
                      <Link
                        href={`/orcamentos/servicos/edit/${item.Id}`}
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
                      <MoreActionsDropdown
                        variant="row"
                        actions={[
                          { label: "Link de cobrança", icon: <DollarSign className="w-4 h-4" /> },
                          {
                            label: "Imprimir",
                            icon: <Printer className="w-4 h-4" />,
                            subItems: [
                              { label: "Formato A4", href: `/orcamentos/servicos/print/${item.Id}` },
                              { label: "Cupom", href: `/orcamentos/servicos/print/${item.Id}` },
                              { label: "Produção", href: `/orcamentos/servicos/print/${item.Id}` },
                            ]
                          },
                          { label: "Alterar situação", icon: <CheckSquare className="w-4 h-4" /> },
                          {
                            label: "Compartilhar",
                            icon: <Share2 className="w-4 h-4" />,
                            subItems: [
                              { label: "Via E-mail", icon: <Mail className="w-3.5 h-3.5" /> },
                              { label: "Via WhatsApp", icon: <MessageCircle className="w-3.5 h-3.5" /> },
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
    </div>
  );
}
