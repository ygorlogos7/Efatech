"use client";
import React, { useRef } from "react";
import { downloadCsv, downloadTxt } from "@/lib/exportUtils";

export function ExportImportButtons({ items }: { items: any[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      console.log("Imported file content:", content);
      // You can add parsing logic here (e.g., CSV -> JSON) as needed.
    };
    reader.readAsText(file);
  };

  const handleExportCsv = () => {
    const columns = [
      { header: "Venda Nº", key: "Numero" },
      { header: "Data", key: "DataVenda" },
      { header: "Produtos", key: "TotalProdutos" },
      { header: "Serviços", key: "TotalServicos" },
      { header: "Desconto", key: "Desconto" },
      { header: "Valor", key: "Total" },
      { header: "Status", key: "Ativo" },
    ];
    const rows = items.map((item) => ({
      Numero: `#${item.Numero}`,
      DataVenda: new Date(item.DataVenda).toLocaleDateString("pt-BR"),
      TotalProdutos: item.TotalProdutos.toFixed(2).replace(".", ",") + " R$",
      TotalServicos: item.TotalServicos.toFixed(2).replace(".", ",") + " R$",
      Desconto: item.Desconto.toFixed(2).replace(".", ","),
      Total: item.Total.toFixed(2).replace(".", ",") + " R$",
      Ativo: item.Ativo ? "Concluída" : "Cancelada",
    }));
    downloadCsv("vendas.csv", rows, columns);
  };

  const handleExportTxt = () => {
    const content = items
      .map((item) => {
        return [
          `Venda Nº: #${item.Numero}`,
          `Data: ${new Date(item.DataVenda).toLocaleDateString("pt-BR")}`,
          `Produtos: R$ ${item.TotalProdutos.toFixed(2).replace(".", ",")}`,
          `Serviços: R$ ${item.TotalServicos.toFixed(2).replace(".", ",")}`,
          `Desconto: R$ ${item.Desconto.toFixed(2).replace(".", ",")}`,
          `Valor: R$ ${item.Total.toFixed(2).replace(".", ",")}`,
          `Status: ${item.Ativo ? "Concluída" : "Cancelada"}`,
        ].join("\n");
      })
      .join("\n\n");
    downloadTxt("vendas.txt", content);
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={handleImportClick}
        className="bg-[#1a252f] hover:bg-black text-white py-2 px-4 rounded font-black uppercase tracking-wider transition-colors"
      >
        Importar
      </button>
      <input
        type="file"
        accept=".csv,.txt"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        onClick={handleExportCsv}
        className="bg-[#1a252f] hover:bg-black text-white py-2 px-4 rounded font-black uppercase tracking-wider transition-colors"
      >
        Exportar CSV
      </button>

      <button
        onClick={handleExportTxt}
        className="bg-[#1a252f] hover:bg-black text-white py-2 px-4 rounded font-black uppercase tracking-wider transition-colors"
      >
        Exportar TXT
      </button>
    </div>
  );
}
