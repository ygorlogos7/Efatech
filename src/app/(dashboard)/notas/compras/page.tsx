"use client";

import React, { useState, useTransition } from "react";
import { getNotasCompras } from "@/actions/notas";
import { ShoppingBasket, Upload, Search, Filter, FileCode } from "lucide-react";

export default function NotasComprasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getNotasCompras();
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Notas de Compras (Entrada)</h2>
        <button className="flex items-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors">
          <Upload className="w-4 h-4" /> Importar XML
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
         <div className="p-4 border-b border-gray-100 flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar por fornecedor ou número..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md" />
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md">Manifestar NF-e</button>
         </div>
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Número/Série</th>
              <th className="py-3 px-6">Fornecedor</th>
              <th className="py-3 px-4 text-right">Valor Total</th>
              <th className="py-3 px-4 text-center">Entrada</th>
              <th className="py-3 px-4 text-center">XML</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 text-gray-500 text-sm italic">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <FileCode className="w-8 h-8 opacity-20 text-gray-400" />
                  </div>
                  Nenhuma nota de compra importada. Importe o XML para dar entrada no estoque.
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold">{item.Numero || "---"}</td>
                <td className="py-3 px-6">{item.Fornecedor || "---"}</td>
                <td className="py-3 px-4 text-right font-bold">R$ {item.ValorTotal.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center">{new Date(item.DataEntrada).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                   <button className="text-[#38b473] hover:underline font-medium">Visualizar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
