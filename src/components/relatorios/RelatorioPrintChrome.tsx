"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/forms/PrintButton";

const GLOBAL_PRINT_CSS = `
  @media print {
    @page { margin: 1.5cm; }
    body, html {
      overflow: visible !important;
      height: auto !important;
    }
    * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    *::-webkit-scrollbar {
      display: none !important;
    }
    .print-container {
      max-width: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    body { -webkit-print-color-adjust: exact; }
    .print-hidden { display: none !important; }
  }
`;

type RelatorioPrintChromeProps = {
  backHref: string;
  reportSubtitle: string;
  children: React.ReactNode;
};

export function RelatorioPrintChrome({
  backHref,
  reportSubtitle,
  children,
}: RelatorioPrintChromeProps) {
  return (
    <div className="bg-white text-black p-4 font-sans text-[12px] leading-tight max-w-[800px] mx-auto print:max-w-full print:p-0 print-container">
      <div className="max-w-[800px] mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100">
        <Link
          href={backHref}
          className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <PrintButton label="IMPRIMIR RELATÓRIO" />
      </div>

      <div className="border border-gray-300 p-4 mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20">
            <img
              src="/images/logo_efatech.png"
              alt="Efatech Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-[16px] font-bold uppercase tracking-tight">
              EFATECH ASSISTENCIA TÉCNICA E ACESSÓRIOS
            </h1>
            <p className="text-[10px] text-gray-500">{reportSubtitle}</p>
          </div>
        </div>
        <div className="text-right font-bold text-[10px]">
          <p>(11) 91091-8448</p>
          <p>efatechassistencia@gmail.com</p>
        </div>
      </div>

      {children}

      <div className="mt-20 flex justify-between items-end">
        <div className="text-[9px] text-gray-400">
          Gerado em {new Date().toLocaleString("pt-BR")} por Efatech ERP
        </div>
        <div className="border-t border-black w-48 text-center pt-1 font-bold text-[10px]">
          Assinatura do Responsável
        </div>
      </div>

      <style jsx global>{GLOBAL_PRINT_CSS}</style>
    </div>
  );
}
