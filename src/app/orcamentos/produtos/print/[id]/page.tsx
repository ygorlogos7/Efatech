import React from "react";
import { getOrcamentoById } from "@/actions/orcamentos";
import { getEmpresa } from "@/actions/configuracoes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/common/PrintButton";
import { auth } from "@/auth";

export default async function PrintOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orcamentoId = parseInt(id);

  // Auth Check
  const session = await auth();
  if (!session?.user) {
      redirect("/login");
  }

  const [orcRes, empRes] = await Promise.all([
    getOrcamentoById(orcamentoId),
    getEmpresa()
  ]);

  if (!orcRes.success || !orcRes.data) {
    notFound();
  }

  const orcamento = orcRes.data;
  const empresa = empRes.data || {
    RazaoSocial: "EFATECH ASSISTÊNCIA TÉCNICA E ACESSÓRIOS",
    Cnpj: "41.092.084/0001-18",
    Logradouro: "Praça Lauro Gomes, 20",
    Bairro: "Centro",
    Cidade: "S. Bernardo do Campo",
    Telefone: "(11) 91091-8448",
  };

  const client = orcamento.Clientes;

  return (
    <div className="w-full flex flex-col items-center overflow-hidden bg-gray-100 min-h-screen font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
            @page { margin: 0; size: 80mm auto; }
            body { margin: 0; padding: 0; width: 80mm; overflow: hidden !important; background: white !important; }
            .print-hidden { display: none !important; }
        }

        /* REMOVER SCROLLBARS TOTAL */
        ::-webkit-scrollbar { display: none; }
        html, body { overflow: hidden !important; }

        .receipt-professional {
            width: 80mm;
            background: #fff;
            padding: 3.5mm;
            box-sizing: border-box;
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.05;
            overflow: hidden;
        }

        .dotted-divider { border-bottom: 2px dotted #000; margin: 3px 0; width: 100%; }
        
        .f-label-tiny { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #333; }
        .f-value-client { font-size: 12px; font-weight: 900; display: block; }
        .f-title-main { font-size: 14px; font-weight: 900; text-align: center; display: block; padding: 1px 0; }
        
        .header-container { display: flex; align-items: start; gap: 8px; margin-bottom: 4px; }
        .company-info { flex: 1; font-size: 10px; line-height: 1.1; }
        .company-info b { font-size: 12px; font-weight: 900; }

        .section-header-bar { 
            text-align: center; 
            font-size: 11px; 
            font-weight: 900; 
            text-transform: uppercase;
            background: #f0f0f0;
            padding: 3px;
            border: 1px solid #000;
            margin: 4px 0;
            -webkit-print-color-adjust: exact;
        }

        .validity-box {
            text-align: center;
            padding: 4px;
            border: 2px dotted #000;
            background: #fafafa;
            margin: 5px 0;
        }
      `}} />

      {/* BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) */}
      <div className="max-w-md mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100 w-full px-6">
        <Link href="/orcamentos/produtos" className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <PrintButton label="IMPRIMIR ORÇAMENTO" />
      </div>

      <div className="receipt-professional shadow-2xl print:shadow-none mb-10">
          {/* CABEÇALHO */}
          <div className="header-container">
              <img src="/images/logo_efatech.png" alt="EFATECH" className="w-14 h-14 object-contain shrink-0" />
              <div className="company-info leading-tight">
                  <b>{empresa.RazaoSocial}</b><br />
                  CNPJ: {empresa.Cnpj}<br />
                  {empresa.Logradouro}, {empresa.Numero || '20'} - {empresa.Bairro}<br />
                  {empresa.Cidade} - CEP: {empresa.Cep || '09710-040'}<br />
                  {empresa.Telefone}
              </div>
          </div>

          <div className="dotted-divider" />
          <span className="f-title-main">ORÇAMENTO Nº {orcamento.Numero}</span>
          <div className="dotted-divider" />

          {/* INFO CLIENTE */}
          <div className="my-2 space-y-1.5 px-1">
              <div className="flex justify-between">
                  <span className="f-label-tiny tracking-tighter text-[9px]">EMISSÃO: {new Date(orcamento.DataEmissao).toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                  <span className="f-label-tiny">CLIENTE:</span>
                  <span className="f-value-client uppercase">{client?.Nome || "AVULSO / BALCAO"}</span>
              </div>
              <div>
                  <span className="f-label-tiny">TELEFONE:</span>
                  <span className="f-value-client">{client?.Telefone || "(---) ---- ----"}</span>
              </div>
          </div>

          {/* CONTEÚDO DO ORÇAMENTO */}
          <div className="section-header-bar">DETALHAMENTO DO ORÇAMENTO</div>
          <div className="p-2 border border-black min-h-[60px] bg-gray-50/50">
             <p className="text-[12px] leading-relaxed font-bold uppercase whitespace-pre-wrap">
                {orcamento.Descricao || "NENHUMA DESCRIÇÃO INFORMADA."}
             </p>
          </div>

          {/* TOTAIS */}
          <div className="flex justify-end gap-2 mt-4 bg-gray-100 p-1 border border-black items-center">
              <span className="text-[11px] font-black uppercase">VALOR TOTAL:</span>
              <span className="text-[22px] font-black tracking-tighter">R$ {Number(orcamento.Total).toFixed(2).replace(".", ",")}</span>
          </div>

          {/* VALIDADE */}
          <div className="section-header-bar">VALIDADE E PRAZOS</div>
          <div className="validity-box">
              <span className="f-label-tiny block">Vencimento do Orçamento:</span>
              <span className="text-[14px] font-black tracking-tight italic">
                  {orcamento.DataValidade 
                    ? new Date(orcamento.DataValidade).toLocaleDateString('pt-BR') 
                    : 'CONSULTAR VENDEDOR'}
              </span>
              <p className="text-[8px] font-bold mt-1 uppercase text-blue-600 italic">Preços sujeitos a alteração após esta data.</p>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="dotted-divider" />
          {orcamento.Observacoes && (
            <p className="text-[11px] font-black italic mb-3 text-center uppercase tracking-tighter leading-tight">Obs: {orcamento.Observacoes}</p>
          )}

          <p className="text-center text-[10px] font-black border-y border-black py-1 mb-2">
              *** DOCUMENTO DE ORÇAMENTO ***
          </p>

          {/* ASSINATURAS */}
          <div className="flex justify-between gap-4 mt-10 pb-4">
              <div className="flex-1 border-t border-black text-center pt-1 text-[9px] font-black uppercase">Cliente</div>
              <div className="flex-1 border-t border-black text-center pt-1 text-[9px] font-black uppercase">Efatech</div>
          </div>

          <p className="text-center text-[8px] font-bold text-gray-400 mt-2">
              Efatech ERP - Gestão Especialista
          </p>
      </div>
    </div>
  );
}
