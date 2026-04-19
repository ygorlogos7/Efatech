import React from "react";
import { getValoresVenda } from "@/actions/produtosAux";
import { DollarSign, Box } from "lucide-react";

export default async function ValoresVendaPage() {
  const { success, data } = await getValoresVenda();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-dark font-bold text-3xl text-gray-900 mb-0">Valores de Venda</h2>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle border-collapse min-w-[600px]">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
              <tr>
                <th className="py-3 px-6">Descrição Lucro</th>
                <th className="py-3 px-6 text-center">Lucro (%)</th>
              </tr>
            </thead>
            <tbody>
              {!success || !data || data.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-16 text-gray-500">
                    <Box className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <h5 className="text-lg font-medium text-gray-700">Nenhum valor de venda cadastrado.</h5>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 font-bold text-gray-900">{item.Desc_Lucro}</td>
                    <td className="py-3 px-6 text-center text-green-600 font-bold">{item.Lucro}%</td>
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
