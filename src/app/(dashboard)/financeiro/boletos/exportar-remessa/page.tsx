"use client";

import React, { useState, useTransition } from "react";
import { getBoletos, exportarRemessa } from "@/actions/financeiro";
import { Barcode, Upload, Home, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ExportarRemessaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getBoletos();
      if (r.success) {
        // Filtrar apenas pendentes para remessa
        setItems((r.data as any[]).filter(i => i.Status === "pendente"));
      }
    });
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      alert("Selecione ao menos um boleto.");
      return;
    }
    
    setIsExporting(true);
    try {
      const res = await exportarRemessa(selectedIds);
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `REMESSA_${new Date().getTime()}.rem`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Arquivo de remessa gerado com sucesso!");
      } else {
        alert(res.error || "Erro ao gerar remessa.");
      }
    } catch (err) {
      alert("Falha técnica ao exportar.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-gray-900 font-bold text-2xl mb-0">Exportar Remessa</h2>
          <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <Home className="w-3 h-3" />
            <Link href="/home" className="hover:underline">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/financeiro/boletos" className="hover:underline">Boletos</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Remessa</span>
          </div>
        </div>

        <button 
          onClick={handleExport}
          disabled={selectedIds.length === 0 || isExporting}
          className="flex items-center gap-1.5 bg-[#38b473] hover:bg-green-600 transition-colors text-white text-sm font-bold px-4 py-2 rounded shadow-sm disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {isExporting ? "Gerando..." : "Gerar Arquivo de Remessa"}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex items-start gap-3">
        <Barcode className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-blue-800 font-bold text-sm">Instruções</h4>
          <p className="text-blue-700 text-sm">Selecione abaixo os boletos que deseja incluir no arquivo de remessa para enviar ao banco.</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={(e) => setSelectedIds(e.target.checked ? items.map(i => i.Id) : [])}
                />
              </th>
              <th className="py-3 px-4">Número</th>
              <th className="py-3 px-4">Sacado</th>
              <th className="py-3 px-4 text-right">Valor</th>
              <th className="py-3 px-4 text-center">Vencimento</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-500">
                  <p>Não há boletos pendentes para exportação.</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.Id)}
                    onChange={() => toggleSelect(item.Id)}
                  />
                </td>
                <td className="py-3 px-4 font-bold">{item.Numero}</td>
                <td className="py-3 px-4 text-gray-600">Cliente Exemplo</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">R$ {item.Valor.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600">{new Date(item.Vencimento).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedIds.length > 0 && (
        <div className="bg-white p-4 rounded-md border border-gray-200 flex justify-between items-center shadow-sm">
          <span className="text-gray-600 text-sm font-medium">
            {selectedIds.length} boleto(s) selecionado(s) para exportação.
          </span>
          <div className="text-green-700 font-bold">
            Total: R$ {items.filter(i => selectedIds.includes(i.Id)).reduce((acc, curr) => acc + curr.Valor, 0).toFixed(2).replace(".", ",")}
          </div>
        </div>
      )}
    </div>
  );
}
