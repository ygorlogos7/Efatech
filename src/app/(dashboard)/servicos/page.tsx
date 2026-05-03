import React from "react";
import Link from "next/link";
import { SearchIcon, PlusCircle, Edit2, Wrench, Copy, Home } from "lucide-react";
import { getServicos } from "@/actions/servicos";
import { DeleteServicoButton } from "@/components/forms/DeleteServicoButton";
import { MoreActionsDropdown } from "@/components/common/MoreActionsDropdown";

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ pesquisa?: string }>;
}) {
  const resolvedParams = await searchParams;
  const pesquisa = resolvedParams?.pesquisa || "";
  const { success, data: items } = await getServicos(pesquisa);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-md shadow-sm border border-gray-200 gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-gray-900 font-bold text-xl sm:text-2xl mb-0">Serviços</h2>
          <div className="text-gray-400 text-[10px] sm:text-xs flex items-center gap-1">
            <Home className="w-3 h-3" />
            <Link href="/home" className="hover:underline">Início</Link>
            <span>&gt;</span>
            <span>Serviços</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <form method="get" className="m-0 flex-grow sm:flex-grow-0">
            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden px-3 py-1.5 focus-within:ring-1 focus-within:ring-green-500 transition-all shadow-sm">
              <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                name="pesquisa" 
                defaultValue={pesquisa} 
                className="outline-none text-sm w-full sm:w-[200px] text-gray-700" 
                placeholder="Buscar por Serviço..." 
              />
            </div>
          </form>

          <Link href="/servicos/create" className="flex items-center justify-center gap-1.5 bg-[#00a65a] hover:bg-green-600 transition-colors text-white text-sm font-bold px-4 py-2 rounded shadow-sm flex-grow sm:flex-grow-0">
            <PlusCircle className="w-4 h-4" />
            Adicionar
          </Link>
          
          <MoreActionsDropdown 
            actions={[
               { label: "Exportar cadastros", icon: <Wrench className="w-4 h-4" /> },
               { label: "Importar de planilha", icon: <Wrench className="w-4 h-4" /> },
            ]} 
          />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle border-collapse min-w-[800px]">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
              <tr>
                <th className="py-3 px-6">Identificação Serviço</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Valor Venda</th>
                <th className="py-3 px-4 text-right">Trib.</th>
                <th className="py-3 px-4 text-center">Situação</th>
                <th className="py-3 px-6 text-right w-[140px]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!success || !items || items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <h5 className="text-lg font-medium text-gray-700">Nenhum serviço catalogado</h5>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 font-bold text-gray-900">
                      {item.Nome} <br />
                      <span className="text-xs font-normal text-gray-500">{item.CodigoServico}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{item.Categoria || "-"}</td>
                    <td className="py-3 px-4 text-right text-green-700 font-bold">R$ {Number(item.ValorVenda).toFixed(2).replace('.', ',')}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {Number(item.PercentualTributos) > 0 ? `${Number(item.PercentualTributos).toFixed(2)}%` : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {item.Ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/servicos/preview/${item.Id}`} className="p-1.5 text-blue-400 hover:text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors" title="Visualizar">
                          <SearchIcon className="w-4 h-4" />
                        </Link>
                        <Link href={`/servicos/edit/${item.Id}`} className="p-1.5 text-blue-500 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50 transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <Link href={`/servicos/create?cloneId=${item.Id}`} className="p-1.5 text-orange-500 hover:text-orange-700 border border-orange-200 rounded hover:bg-orange-50 transition-colors" title="Clonar Serviço">
                           <Copy className="w-4 h-4" />
                        </Link>
                        <DeleteServicoButton id={item.Id} nome={item.Nome} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
