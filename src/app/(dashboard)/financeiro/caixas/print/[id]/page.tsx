"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getCaixaPrintData } from "@/actions/caixa";
import { PrintButton } from "@/components/forms/PrintButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  RETIRADAS_FORMA_CONSOLIDADO,
  isFormaDinheiro,
  totalEntradasDinheiroLinhas,
  valorSangriaExibicao,
} from "@/lib/caixaRelatorioFormas";

export default function CaixaPrintPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as 'vendas' | 'os' | 'completo' || 'completo';
  
  const [data, setData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (id) {
      startTransition(async () => {
        const resp = await getCaixaPrintData(Number(id), type);
        if (resp.success) {
          setData(resp.data);
        }
      });
    }
  }, [id, type]);

  const formatCurrency = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return "0,00";
    return Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (date: any) => {
    if (!date) return "------";
    return new Date(date).toLocaleString("pt-BR");
  };

  if (!data) return <div className="p-8">Carregando relatório detalhado...</div>;

  const { session, abertura, vendas, os, sangrias, consolidadoGeral, saldoReal } = data;

  const valorAberturaNum = Number(abertura?.Recebido ?? session?.ValorAbertura ?? 0);
  const consolidadoFormasPagamento = consolidadoGeral.filter(
    (f: any) => f.Nome !== RETIRADAS_FORMA_CONSOLIDADO
  );
  const entradasDinheiroTotal = totalEntradasDinheiroLinhas(consolidadoFormasPagamento);
  const totalRetiradasNum = Array.isArray(sangrias)
    ? sangrias.reduce(
        (acc: number, s: any) => acc + valorSangriaExibicao(s.Total ?? s.Pago),
        0
      )
    : 0;
  const linhaDinheiro = consolidadoFormasPagamento.find((f: any) =>
    isFormaDinheiro(f.Nome)
  );
  const saldoDinheiroAposRetiradas =
    linhaDinheiro != null
      ? Number(linhaDinheiro.Total)
      : entradasDinheiroTotal - totalRetiradasNum;
  const showLinhaSaldoAposRetiradas = type === "completo" && totalRetiradasNum > 0;

  return (
    <div className="bg-white text-black p-4 font-sans text-[12px] leading-tight max-w-[800px] mx-auto print:max-w-full print:p-0 relative">
      
      {/* BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) */}
      <div className="max-w-[800px] mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100">
          <Link href="/financeiro/opcoes/caixas" className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <PrintButton label="IMPRIMIR RELATÓRIO" />
      </div>
      
      {/* Header Estilo GestãoClick */}
      <div className="border border-gray-300 p-4 mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
           {/* Logo oficial da Efatech */}
           <div className="w-20 h-20">
              <img 
                src="/images/logo_efatech.png" 
                alt="Efatech Logo" 
                className="w-full h-full object-contain"
              />
           </div>
           <div>
              <h1 className="text-[16px] font-bold uppercase tracking-tight">EFATECH ASSISTENCIA TÉCNICA E ACESSÓRIOS</h1>
           </div>
        </div>
        <div className="text-right font-bold text-[10px]">
           <p>(11) 91091-8448</p>
           <p>efatechassistencia@gmail.com</p>
        </div>
      </div>

      {/* Tabela de Resumo Geral */}
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold w-1/3">Situação</td>
            <td className="p-1.5 uppercase">{session.Status}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold">Aberto em</td>
            <td className="p-1.5">{formatDate(session.DataAbertura)}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold">Fechado em</td>
            <td className="p-1.5">{formatDate(session.DataFechamento)}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold">Saldo total</td>
            <td className="p-1.5 font-bold">R$ {formatCurrency(saldoReal)}</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1.5 font-bold">Funcionário</td>
            <td className="p-1.5">{session.FuncionarioNome || "Sistema"}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[14px] font-bold mb-4 border-b border-black pb-1 uppercase">Movimentações de caixa</h2>

      {/* Seção Abertura - Sempre visível se for 'completo' ou se houver saldo inicial */}
      <div className="mb-6">
        <h3 className="font-bold mb-1 uppercase text-[10px]">Abertura de caixa</h3>
        <table className="w-full border-collapse border border-black text-center">
          <thead className="bg-[#f2f2f2] border-b border-black font-bold text-[10px]">
            <tr>
              <td className="border-r border-black p-1 text-left">Forma Pagamento</td>
              <td className="border-r border-black p-1 text-right">Recebido</td>
              <td className="border-r border-black p-1 text-right">À Receber</td>
              <td className="p-1 text-right">Total</td>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            <tr className="border-b border-black last:border-0">
              <td className="border-r border-black p-1 text-left">{abertura.Forma}</td>
              <td className="border-r border-black p-1 text-right">{formatCurrency(abertura.Recebido)}</td>
              <td className="border-r border-black p-1 text-right">{formatCurrency(abertura.AReceber)}</td>
              <td className="p-1 text-right font-bold">{formatCurrency(abertura.Total)}</td>
            </tr>
          </tbody>
          <tfoot className="font-bold border-t border-black bg-[#f9f9f9] text-[10px]">
            <tr>
              <td className="border-r border-black p-1 text-left">Total</td>
              <td className="border-r border-black p-1 text-right">{formatCurrency(abertura.Recebido)}</td>
              <td className="border-r border-black p-1 text-right">{formatCurrency(abertura.AReceber)}</td>
              <td className="p-1 text-right">{formatCurrency(abertura.Total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Seção OS (se aplicável) */}
      {(type === 'os' || type === 'completo') && (
        <div className="mb-6">
          <h3 className="font-bold mb-1 uppercase text-[10px]">Ordens de serviços</h3>
          <table className="w-full border-collapse border border-black text-center">
            <thead className="bg-[#f2f2f2] border-b border-black font-bold text-[10px]">
              <tr>
                <td className="border-r border-black p-1 text-left">Forma Pagamento</td>
                <td className="border-r border-black p-1 text-right">Recebido</td>
                <td className="border-r border-black p-1 text-right">À Receber</td>
                <td className="p-1 text-right">Total</td>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {os.length > 0 ? os.map((o: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0">
                  <td className="border-r border-black p-1 text-left">{o.Forma}</td>
                  <td className="border-r border-black p-1 text-right">{formatCurrency(o.Recebido)}</td>
                  <td className="border-r border-black p-1 text-right">{formatCurrency(o.AReceber)}</td>
                  <td className="p-1 text-right">{formatCurrency(o.Total)}</td>
                </tr>
              )) : (
                <tr className="border-b border-black last:border-0">
                  <td className="border-r border-black p-1 text-left text-gray-400 italic" colSpan={4}>Nenhuma ordem de serviço registrada</td>
                </tr>
              )}
            </tbody>
            <tfoot className="font-bold border-t border-black bg-[#f9f9f9] text-[10px]">
              <tr>
                <td className="border-r border-black p-1 text-left">Total</td>
                <td className="border-r border-black p-1 text-right">{formatCurrency(os.reduce((acc: number, curr: any) => acc + curr.Recebido, 0))}</td>
                <td className="border-r border-black p-1 text-right">{formatCurrency(os.reduce((acc: number, curr: any) => acc + curr.AReceber, 0))}</td>
                <td className="p-1 text-right">{formatCurrency(os.reduce((acc: number, curr: any) => acc + curr.Total, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Seção Vendas (se aplicável) */}
      {(type === 'vendas' || type === 'completo') && (
        <div className="mb-6">
          <h3 className="font-bold mb-1 uppercase text-[10px]">Vendas realizadas no balcão</h3>
          <table className="w-full border-collapse border border-black text-center">
            <thead className="bg-[#f2f2f2] border-b border-black font-bold text-[10px]">
              <tr>
                <td className="border-r border-black p-1 text-left">Forma Pagamento</td>
                <td className="border-r border-black p-1 text-right">Recebido</td>
                <td className="border-r border-black p-1 text-right">À Receber</td>
                <td className="p-1 text-right">Total</td>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {vendas.length > 0 ? vendas.map((v: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-[10px]">
                  <td className="border-r border-black p-1 text-left">{v.Forma}</td>
                  <td className="border-r border-black p-1 text-right">{formatCurrency(v.Recebido)}</td>
                  <td className="border-r border-black p-1 text-right">{formatCurrency(v.AReceber)}</td>
                  <td className="p-1 text-right">{formatCurrency(v.Total)}</td>
                </tr>
              )) : (
                <tr className="border-b border-black last:border-0">
                  <td className="border-r border-black p-1 text-left text-gray-400 italic" colSpan={4}>Nenhuma venda registrada</td>
                </tr>
              )}
            </tbody>
            <tfoot className="font-bold border-t border-black bg-[#f9f9f9] text-[10px]">
              <tr>
                <td className="border-r border-black p-1 text-left">Total</td>
                <td className="border-r border-black p-1 text-right">{formatCurrency(vendas.reduce((acc: number, curr: any) => acc + curr.Recebido, 0))}</td>
                <td className="border-r border-black p-1 text-right">{formatCurrency(vendas.reduce((acc: number, curr: any) => acc + curr.AReceber, 0))}</td>
                <td className="p-1 text-right">{formatCurrency(vendas.reduce((acc: number, curr: any) => acc + curr.Total, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Seção Sangria (NOVA) */}
      {(type === 'completo') && (
        <div className="mb-6">
          <h3 className="font-bold mb-1 uppercase text-[10px]">Sangria de caixa</h3>
          <table className="w-full border-collapse border border-black text-center">
            <thead className="bg-[#f2f2f2] border-b border-black font-bold text-[10px]">
              <tr>
                <td className="border-r border-black p-1 text-left">Movimentações de caixa</td>
                <td className="p-1 text-right">Valor retirado</td>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {sangrias.length > 0 ? (
                sangrias.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-black last:border-0">
                    <td className="border-r border-black p-1 text-left">{s.Forma}</td>
                    <td className="p-1 text-right">{formatCurrency(valorSangriaExibicao(s.Total))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-2 text-gray-500 italic">Nenhuma sangria registrada</td>
                </tr>
              )}
            </tbody>
            {sangrias.length > 0 && (
              <tfoot className="font-bold border-t border-black bg-[#f9f9f9] text-[10px]">
                <tr>
                  <td className="border-r border-black p-1 text-left">Total de saídas / sangrias</td>
                  <td className="p-1 text-right">
                    {formatCurrency(totalRetiradasNum)}
                  </td>
                </tr>
                {showLinhaSaldoAposRetiradas && (
                  <tr className="bg-[#fafafa] border-t border-dashed border-gray-400 font-semibold">
                    <td className="border-r border-black p-1 text-left">
                      Saldo atual{" "}
                      <span className="font-normal text-gray-600 font-sans">
                        (entradas em dinheiro {formatCurrency(entradasDinheiroTotal)} − retiradas {formatCurrency(totalRetiradasNum)})
                      </span>
                    </td>
                    <td className="p-1 text-right text-gray-900">{formatCurrency(saldoDinheiroAposRetiradas)}</td>
                  </tr>
                )}
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Tabela Formas de Pagamento (Consolidado) */}
      <div className="mt-8">
        <h2 className="text-[14px] font-bold mb-2 uppercase border-b border-black">Formas de pagamento</h2>
        <table className="w-full border-collapse border border-black text-center">
           <thead className="bg-[#f2f2f2] border-b border-black font-bold text-[10px]">
              <tr>
                <td className="border-r border-black p-1 text-left">Forma de pagamento</td>
                <td className="border-r border-black p-1 text-right">Entradas (Recebido)</td>
                <td className="border-r border-black p-1 text-right">Sangria (retiradas)</td>
                <td className="p-1 text-right">Saldo líquido (Total)</td>
              </tr>
           </thead>
           <tbody className="text-[10px]">
              {consolidadoFormasPagamento.map((f: any, i: number) => {
                const sangriaLinha = valorSangriaExibicao(f.Pago);
                const liquido = Number(f.Total);
                return (
                  <tr key={`${f.Nome}-${i}`} className="border-b border-black last:border-0">
                    <td className="border-r border-black p-1 text-left">{f.Nome}</td>
                    <td className="border-r border-black p-1 text-right">{formatCurrency(f.Recebido)}</td>
                    <td className="border-r border-black p-1 text-right">
                      {sangriaLinha > 0 ? formatCurrency(sangriaLinha) : formatCurrency(0)}
                    </td>
                    <td className="p-1 text-right font-bold">{formatCurrency(liquido)}</td>
                  </tr>
                );
              })}
           </tbody>
           <tfoot className="font-bold border-t border-black bg-[#f9f9f9] text-[10px]">
              <tr>
                 <td className="border-r border-black p-1 text-left">Total geral</td>
                 <td className="border-r border-black p-1 text-right">{formatCurrency(consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.Recebido, 0))}</td>
                 <td className="border-r border-black p-1 text-right">
                   {totalRetiradasNum > 0 ? formatCurrency(totalRetiradasNum) : formatCurrency(0)}
                 </td>
                 <td className="p-1 text-right font-black">{formatCurrency(saldoReal)}</td>
              </tr>
           </tfoot>
        </table>
      </div>

      <div className="mt-6 text-right">
         <span className="text-[16px] font-bold border-b-2 border-black pb-1">
            Saldo real no caixa: R$ {formatCurrency(saldoReal)}
         </span>
      </div>


       <style jsx global>{`
        @media print {
          @page { margin: 1cm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
