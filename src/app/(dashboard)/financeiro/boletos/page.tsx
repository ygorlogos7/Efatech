"use client";

import React, { useState, useTransition, useRef } from "react";
import { getBoletos, exportarRemessa, importarRetorno } from "@/actions/financeiro";
import { Barcode, Search, Filter, Download, Upload } from "lucide-react";

export default function BoletosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBoletos = async () => {
    startTransition(async () => {
      const r = await getBoletos();
      if (r.success) setItems(r.data as any[]);
    });
  };

  React.useEffect(() => {
    fetchBoletos();
  }, []);

  const handleExportarRemessa = async () => {
    if (items.length === 0) {
      alert("Não há boletos para exportar.");
      return;
    }
    
    setIsExporting(true);
    try {
      const ids = items.map(i => i.Id);
      const res = await exportarRemessa(ids);
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `REMESSA_${new Date().getTime()}.rem`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert(res.error || "Erro ao exportar remessa.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha técnica ao exportar.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportarRetorno = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      startTransition(async () => {
        const res = await importarRetorno(content);
        if (res.success) {
          alert(res.message);
          fetchBoletos();
        } else {
          alert(res.error);
        }
      });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        onChange={handleImportarRetorno}
        accept=".ret,.txt,.rem"
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Gestão de Boletos</h2>
        <div className="flex gap-2">
           <Link 
            href="/financeiro/boletos/exportar-remessa"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md shadow-sm border border-gray-200 transition-colors"
           >
            <Upload className="w-4 h-4" /> Exportar Remessa
          </Link>
          <Link 
            href="/financeiro/boletos/importar-retorno"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md shadow-sm border border-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" /> Importar Retorno
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por número ou sacado..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Número</th>
              <th className="py-3 px-6">Sacado (Cliente)</th>
              <th className="py-3 px-4 text-right">Valor</th>
              <th className="py-3 px-4 text-center">Vencimento</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-500">
                  <Barcode className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                  <p>Nenhum boleto gerado.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold">{item.Numero}</td>
                <td className="py-3 px-6">Cliente Exemplo</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">R$ {item.Valor.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600">{new Date(item.Vencimento).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded border ${item.Status === "pago" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                    {item.Status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
