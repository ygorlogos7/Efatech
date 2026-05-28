import React from "react";
import Link from "next/link";
import { PlusCircle, SearchIcon, Edit2, Store, Package, Home, Eye } from "lucide-react";
import { getEmpresas } from "@/actions/empresas";
import { DeleteEmpresaButton } from "@/components/forms/DeleteEmpresaButton";

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ pesquisa?: string }>;
}) {
  const resolvedParams = await searchParams;
  const pesquisa = resolvedParams?.pesquisa || "";
  const { success, data: empresas } = await getEmpresas(pesquisa, "cadastro");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-md shadow-sm border border-gray-200 gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-gray-900 font-bold text-xl sm:text-2xl mb-0">Empresas</h2>
          <div className="text-gray-400 text-[10px] sm:text-xs flex items-center gap-1">
            <Home className="w-3 h-3" />
            <Link href="/home" className="hover:underline">Início</Link>
            <span>&gt;</span>
            <span>Empresas</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Barra de Pesquisa */}
          <form method="get" className="m-0 flex-grow sm:flex-grow-0">
            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden px-3 py-1.5 focus-within:ring-1 focus-within:ring-green-500 transition-all shadow-sm">
              <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                name="pesquisa"
                defaultValue={pesquisa}
                className="outline-none text-sm w-full sm:w-[200px] text-gray-700"
                placeholder="Buscar por Empresa..."
              />
            </div>
          </form>

          {/* Botão Adicionar */}
          <Link href="/cadastros/opcoes/empresas/create" className="flex items-center justify-center gap-1.5 bg-[#00a65a] hover:bg-green-600 transition-colors text-white text-sm font-bold px-4 py-2 rounded shadow-sm flex-grow sm:flex-grow-0">
            <PlusCircle className="w-4 h-4" />
            Adicionar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
            <tr>
              <th className="py-3 px-6">Razão Social / Nome Fantasia</th>
              <th className="py-3 px-4">CNPJ</th>
              <th className="py-3 px-4">Telefone</th>
              <th className="py-3 px-4 text-center">Situação</th>
              <th className="py-3 px-6 text-right w-[150px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!success || !empresas || empresas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <h5 className="text-lg font-medium text-gray-700">Nenhuma empresa encontrada.</h5>
                </td>
              </tr>
            ) : (
              empresas.map((item) => (
                <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="font-bold text-gray-900">{item.RazaoSocial}</div>
                    <div className="text-xs text-gray-500 italic">{item.NomeFantasia || "-"}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.Cnpj}</td>
                  <td className="py-3 px-4 text-gray-600">{item.Telefone || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded border ${item.Ativo ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {item.Ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-1 items-center">
                      <Link 
                        href={`/cadastros/opcoes/empresas/preview/${item.Id}`} 
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#00c0ef] hover:bg-[#00a7d0] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Visualizar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link 
                        href={`/cadastros/opcoes/empresas/edit/${item.Id}`} 
                        className="flex items-center justify-center w-[30px] h-[30px] bg-[#f39c12] hover:bg-[#db8b0b] text-white rounded-[3px] transition-colors shadow-sm"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteEmpresaButton id={item.Id} nome={item.RazaoSocial} />
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
