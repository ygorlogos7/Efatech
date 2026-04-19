"use client";

import React, { useState } from "react";
import { Home, Upload, FileSpreadsheet, Info, AlertTriangle, CheckCircle, X } from "lucide-react";
import Link from "next/link";

export default function ImportProdutosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) return;
    setIsUploading(true);
    // Real implementation would call a server action here
    setTimeout(() => {
        alert("Simulação: Arquivo '" + file.name + "' enviado para processamento. (Implementação real requer biblioteca xlsx)");
        setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold text-2xl mb-0 italic">Importar produtos</h3>
        <div className="text-gray-500 text-sm flex items-center gap-1 font-semibold">
          <Home className="w-4 h-4 mr-1 text-gray-400" />
          <Link href="/home" className="hover:underline">Início</Link>
          <span className="text-gray-300">/</span>
          <Link href="/produtos" className="hover:underline">Produtos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400">Importar produtos</span>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex gap-3 text-yellow-800">
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold mb-1">Dicas para importação:</p>
                            <ul className="list-disc list-inside space-y-1 opacity-90">
                                <li>Selecione um arquivo **.xlsx** do seu computador.</li>
                                <li>A planilha deve conter colunas de Nome, Código de Barras e Preço.</li>
                                <li>Capacidade máxima: **1000 itens** por arquivo ou **2MB**.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group relative">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="bg-gray-800 text-white p-3 rounded-md mb-4 group-hover:bg-gray-700 transition-colors">
                            <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-gray-600 font-bold">
                            {file ? file.name : "Selecione um arquivo"}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 uppercase">Clique ou arraste o arquivo aqui</p>
                    </div>
                </div>

                <div className="md:w-1/3 border-l border-gray-100 pl-8 hidden md:block">
                     <h4 className="font-bold text-gray-800 text-lg mb-4">Instruções</h4>
                     <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Para garantir que seus produtos sejam importados corretamente, utilize nosso modelo padrão.
                     </p>
                     <Link href="#" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-bold border-b border-blue-200 w-fit">
                        <FileSpreadsheet className="w-4 h-4" />
                        Baixe nossa planilha padrão
                     </Link>

                     <div className="mt-8 pt-8 border-t border-gray-100 italic">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-2">Ajuda</p>
                        <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 font-bold">
                            Assistir vídeo tutorial &rarr;
                        </Link>
                     </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={handleImport}
                  disabled={!file || isUploading}
                  className="flex items-center gap-2 bg-[#00b050] hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2.5 px-8 rounded shadow-sm transition-all"
                >
                    {isUploading ? "Processando..." : <><CheckCircle className="w-4 h-4" /> Importar</>}
                </button>
                <Link href="/produtos" className="flex items-center gap-2 bg-[#ef5350] hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded shadow-sm transition-all">
                    <X className="w-4 h-4" /> Cancelar
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
