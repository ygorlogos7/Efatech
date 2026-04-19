import React from "react";
import Link from "next/link";
import { SearchIcon, PlusCircle, Edit2, ClipboardList, Printer } from "lucide-react";
import { getOrdensServico } from "@/actions/ordensServico";
import { DeleteOSButton } from "@/components/forms/DeleteOSButton";

export default async function OrdensServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ pesquisa?: string }>;
}) {
  const resolvedParams = await searchParams;
  const pesquisa = resolvedParams?.pesquisa || "";
  const { success, data: items } = await getOrdensServico(pesquisa);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h2>
        <div className="flex items-center gap-3">
          <form method="get">
            <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-green-500 transition-all">
              <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
              <input type="text" name="pesquisa" defaultValue={pesquisa} className="outline-none text-sm w-[200px] text-gray-700" placeholder="Equipamento ou defeito..." />
            </div>
          </form>
          <Link href="/ordens-servico/create" className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Nova O.S.
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
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
                  <td className="py-3 px-4 font-bold text-gray-900">#{item.Numero}</td>
                  <td className="py-3 px-4 text-gray-700">{item.Equipamento || "-"}</td>
                  <td className="py-3 px-6 text-gray-600 max-w-[200px] truncate">{item.Defeito || "-"}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(item.DataAbertura).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-4 text-gray-500">{item.DataPrevisao ? new Date(item.DataPrevisao).toLocaleDateString("pt-BR") : "-"}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-700">R$ {item.Total.toFixed(2).replace(".", ",")}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded border ${item.Ativo ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {item.Ativo ? "Aberta" : "Encerrada"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/ordens-servico/preview/${item.Id}`} className="p-1.5 text-blue-400 hover:text-blue-600 border border-blue-100 rounded hover:bg-blue-50 transition-colors" title="Visualizar">
                        <SearchIcon className="w-4 h-4" />
                      </Link>
                      <Link href={`/ordens-servico/print/${item.Id}`} className="p-1.5 text-indigo-500 hover:text-indigo-700 border border-indigo-100 rounded hover:bg-indigo-50 transition-colors" title="Imprimir OS">
                        <Printer className="w-4 h-4" />
                      </Link>
                      <Link href={`/ordens-servico/edit/${item.Id}`} className="p-1.5 text-blue-500 hover:text-blue-700 border border-blue-100 rounded hover:bg-blue-50 transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <DeleteOSButton id={item.Id} numero={item.Numero} />
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
