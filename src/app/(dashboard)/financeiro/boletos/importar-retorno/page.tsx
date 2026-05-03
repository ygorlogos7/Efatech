"use client";

import React, { useState, useTransition, useRef } from "react";
import { importarRetorno } from "@/actions/financeiro";
import { Download, Home, ChevronRight, FileText, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ImportarRetornoPage() {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      startTransition(async () => {
        const res = await importarRetorno(content);
        setResult({ success: res.success, message: res.success ? res.message || "Importação concluída!" : res.error || "Erro ao processar arquivo." });
        if (res.success) setFile(null);
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-gray-900 font-bold text-2xl mb-0">Importar Retorno</h2>
          <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <Home className="w-3 h-3" />
            <Link href="/home" className="hover:underline">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/financeiro/boletos" className="hover:underline">Boletos</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Retorno</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center space-y-4 hover:border-[#38b473] transition-colors group">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors">
            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#38b473]" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Arraste seu arquivo aqui</h3>
            <p className="text-sm text-gray-500">Ou clique para selecionar o arquivo de retorno (.ret, .txt) do banco.</p>
          </div>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".ret,.txt,.rem"
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Selecionar Arquivo
          </button>
        </div>

        {file && (
          <div className="mt-6 bg-white p-4 rounded-md border border-gray-200 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded">
                <FileText className="w-5 h-5 text-[#38b473]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button 
              onClick={handleImport}
              disabled={isPending}
              className="bg-[#38b473] hover:bg-green-600 text-white px-6 py-2 rounded-md font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
            >
              {isPending ? "Processando..." : "Processar Agora"}
            </button>
          </div>
        )}

        {result && (
          <div className={`mt-6 p-4 rounded-md border flex items-start gap-3 animate-in fade-in zoom-in-95 ${result.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            {result.success ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
            <div>
              <h4 className="font-bold text-sm">{result.success ? "Sucesso!" : "Ocorreu um erro"}</h4>
              <p className="text-sm opacity-90">{result.message}</p>
              {result.success && (
                <Link href="/financeiro/boletos" className="inline-block mt-2 font-bold hover:underline">
                  Voltar para listagem →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md max-w-2xl mx-auto mt-10">
        <h4 className="text-gray-700 font-bold text-sm mb-2">Informações Importantes</h4>
        <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
          <li>O sistema aceita arquivos nos formatos CNAB 400 e CNAB 240.</li>
          <li>Certifique-se de que o arquivo é o original baixado do internet banking.</li>
          <li>Após o processamento, os boletos liquidados serão atualizados automaticamente no financeiro.</li>
        </ul>
      </div>
    </div>
  );
}
