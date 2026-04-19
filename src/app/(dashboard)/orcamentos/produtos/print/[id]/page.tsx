import React from "react";
import { getOrcamentoById } from "@/actions/orcamentos";
import { 
  FileText, User, Phone, Mail, MapPin, Calendar, 
  Package, DollarSign, PenTool, Printer, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/common/PrintButton";

export default async function PrintOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const { success, data: orcamento } = await getOrcamentoById(id);

  if (!success || !orcamento) {
    notFound();
  }

  const client = orcamento.Clientes;
  const address = client?.Endereco?.[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:pb-0">
      {/* Barra de Ações (Oculta na Impressão) */}
      <div className="max-w-4xl mx-auto py-6 px-4 flex justify-between items-center print:hidden">
        <Link href="/orcamentos/produtos" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar para Lista
        </Link>
        <PrintButton label="Imprimir Orçamento" />
      </div>

      {/* DOCUMENTO A4 */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-full p-10 font-sans text-gray-900 border border-gray-100 print:border-none rounded-xl print:rounded-none">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b-2 border-[#1a1c23] pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1a1c23] rounded-xl flex items-center justify-center">
              <FileText className="w-10 h-10 text-[#38b473]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Efatech PRO</h1>
              <p className="text-xs font-bold text-[#38b473] tracking-widest uppercase">Soluções Corporativas</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-gray-900">ORÇAMENTO Nº {orcamento.Numero}</h2>
            <p className="text-xs text-gray-500 font-medium">Emissão: {new Date(orcamento.DataEmissao).toLocaleDateString('pt-BR')}</p>
            <p className="text-xs text-red-600 font-bold uppercase mt-1">Vencimento: {orcamento.DataValidade ? new Date(orcamento.DataValidade).toLocaleDateString('pt-BR') : 'N/D'}</p>
          </div>
        </div>

        {/* Grade de Dados */}
        <table className="w-full mb-8 border-collapse">
            <thead>
                <tr>
                    <th colSpan={2} className="bg-gray-100 p-2 text-left text-[10px] font-black uppercase tracking-wider border border-gray-200">
                        <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-[#38b473]" /> Identificação do Cliente
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody className="text-xs border border-gray-200">
                <tr className="border-b border-gray-100">
                    <td className="p-3 border-r border-gray-100" width="60%"><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Cliente / Razão Social</label><strong>{client?.Nome || "NÃO INFORMADO"}</strong></td>
                    <td className="p-3"><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">CPF / CNPJ</label><strong>{client?.CPFCNPJ || "NÃO INFORMADO"}</strong></td>
                </tr>
                <tr>
                    <td className="p-3 border-r border-gray-100"><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Endereço</label>{address ? `${address.Logradouro}, ${address.Numero} - ${address.Bairro}` : "NÃO CADASTRADO"}</td>
                    <td className="p-3"><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Cidade / UF</label>{address ? `${address.Cidade} / ${address.UF}` : "N/D"}</td>
                </tr>
            </tbody>
        </table>

        {/* Seção Principal: Descrição */}
        <div className="mb-8">
            <div className="bg-[#1a1c23] text-white p-2 text-[10px] font-black uppercase tracking-wider rounded-t-lg flex items-center gap-2">
                <Package className="w-3 h-3 text-[#38b473]" /> Detalhamento do Orçamento
            </div>
            <div className="border-2 border-[#1a1c23] p-6 rounded-b-lg min-h-[400px] whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {orcamento.Descricao || "Nenhuma descrição detalhada informada."}
            </div>
        </div>

        {/* Resumo Financeiro Removido (Orçamento Gratuito) */}

        {/* Termos e Assinaturas */}
        <div className="grid grid-cols-2 gap-8 items-center mt-20">
            <div className="text-center pt-8 border-t border-gray-300">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-16">Aceite do Cliente</p>
                <div className="h-0.5 w-full bg-gray-200 mb-2"></div>
                <p className="text-[9px] font-black text-gray-900 uppercase">{client?.Nome || "Assinatura do Cliente"}</p>
            </div>
            <div className="text-center pt-8 border-t border-gray-300">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-16">Responsável Efatech</p>
                <div className="h-0.5 w-full bg-gray-200 mb-2"></div>
                <p className="text-[9px] font-black text-gray-900 uppercase">Consultor de Vendas</p>
            </div>
        </div>

        {/* Rodapé */}
        <div className="mt-20 pt-6 border-t border-gray-100 text-center">
            <p className="text-[8px] text-gray-400 uppercase font-black tracking-[0.2em]">Obrigado pela preferência! — Efatech Sistemas e Tecnologia</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          @page { margin: 0; size: auto; }
          .rounded-xl { border-radius: 0 !important; }
          .shadow-2xl { box-shadow: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @page {
            size: A4;
            margin: 0;
        }
      `}} />
    </div>
  );
}
