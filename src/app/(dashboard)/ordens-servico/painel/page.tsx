import React from "react";
import { getOrdensServico } from "@/actions/ordensServico";
import { ClipboardList, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react";

export default async function OSPainelPage() {
  const { success, data: items } = await getOrdensServico();

  const abertas = items?.filter(i => i.Ativo).length ?? 0;
  const encerradas = items?.filter(i => !i.Ativo).length ?? 0;
  const total = items?.length ?? 0;
  const faturamento = items?.reduce((acc, i) => acc + i.Total, 0) ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Painel — Ordens de Serviço</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><ClipboardList className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total de O.S.</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Abertas</p>
            <p className="text-2xl font-bold text-yellow-600">{abertas}</p>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Encerradas</p>
            <p className="text-2xl font-bold text-green-600">{encerradas}</p>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Faturamento</p>
            <p className="text-xl font-bold text-emerald-700">R$ {faturamento.toFixed(2).replace(".", ",")}</p>
          </div>
        </div>
      </div>

      {/* Últimas abertas */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <h3 className="font-semibold text-gray-800 text-sm">O.S. em Aberto</h3>
        </div>
        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-2 px-4">Nº</th>
              <th className="py-2 px-4">Equipamento</th>
              <th className="py-2 px-4">Abertura</th>
              <th className="py-2 px-4">Previsão</th>
              <th className="py-2 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {!items || items.filter(i => i.Ativo).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhuma O.S. em aberto. 🎉</td></tr>
            ) : items.filter(i => i.Ativo).slice(0, 10).map((item) => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-4 font-bold">#{item.Numero}</td>
                <td className="py-2 px-4">{item.Equipamento || "-"}</td>
                <td className="py-2 px-4 text-gray-500">{new Date(item.DataAbertura).toLocaleDateString("pt-BR")}</td>
                <td className="py-2 px-4 text-gray-500">{item.DataPrevisao ? new Date(item.DataPrevisao).toLocaleDateString("pt-BR") : "-"}</td>
                <td className="py-2 px-4 text-right font-bold text-green-700">R$ {item.Total.toFixed(2).replace(".", ",")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
