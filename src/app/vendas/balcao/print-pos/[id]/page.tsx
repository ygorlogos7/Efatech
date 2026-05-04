import { getVendaById } from "@/actions/vendas";
import { getEmpresa } from "@/actions/configuracoes";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/common/PrintButton";
import { auth } from "@/auth";

export default async function PrintVendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendaId = Number(id);
  
  if (isNaN(vendaId)) {
    notFound();
  }

  // Auth Check
  const session = await auth();
  if (!session?.user) {
      redirect("/login");
  }

  const [vendaRes, empRes] = await Promise.all([
    getVendaById(vendaId),
    getEmpresa()
  ]);

  if (!vendaRes.success || !vendaRes.data) {
    notFound();
  }

  const venda = vendaRes.data;
  const empresa = empRes.data || {
    RazaoSocial: "EFATECH ASSISTÊNCIA TÉCNICA E ACESSÓRIOS",
    Cnpj: "41.092.084/0001-18",
    Logradouro: "Praça Lauro Gomes, 20",
    Bairro: "Centro",
    Cidade: "S. Bernardo do Campo",
    Telefone: "(11) 91091-8448",
  };

  const cliente = venda.Cliente;

  return (
    <div className="w-full flex flex-col items-center overflow-hidden bg-gray-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
            @page { margin: 0; size: 80mm auto; }
            body { margin: 0; padding: 0; width: 80mm; overflow: hidden !important; background: white !important; -webkit-print-color-adjust: exact; }
            .print-hidden { display: none !important; }
        }

        /* REMOVER SCROLLBARS TOTAL */
        ::-webkit-scrollbar { display: none; }
        html, body { overflow-x: hidden !important; }

        .receipt-professional {
            width: 80mm;
            background: #fff;
            padding: 4mm 2mm;
            box-sizing: border-box;
            font-family: 'Inter', 'Courier New', Courier, monospace;
            line-height: 1.1;
            color: #000;
        }

        .dotted-divider { border-bottom: 1.5pt dashed #000; margin: 6px 0; width: 100%; }
        .solid-divider { border-bottom: 2pt solid #000; margin: 8px 0; width: 100%; }
        
        .os-table-mini { width: 100%; border-collapse: collapse; margin: 4px 0; }
        .os-table-mini th { 
            font-size: 10px; 
            text-transform: uppercase; 
            text-align: left; 
            border-bottom: 1pt solid #000;
            padding-bottom: 2px;
        }
        .os-table-mini td { 
            font-size: 13px; 
            padding: 4px 0; 
            font-weight: 800;
            vertical-align: top;
        }

        .f-label-tiny { font-size: 10px; font-weight: 900; text-transform: uppercase; }
        .f-value-client { font-size: 14px; font-weight: 900; display: block; margin-top: 1px; }
        .f-title-main { font-size: 16px; font-weight: 900; text-align: center; display: block; padding: 4px 0; }
        
        .header-container { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; margin-bottom: 8px; }
        .company-info { font-size: 11px; line-height: 1.2; font-weight: 700; }
        .company-info b { font-size: 14px; font-weight: 900; text-transform: uppercase; }

        .section-header-bar { 
            text-align: center; 
            font-size: 12px; 
            font-weight: 900; 
            text-transform: uppercase;
            border: 1.5pt solid #000;
            padding: 2px;
            margin: 8px 0 4px 0;
            background: #000;
            color: #fff;
            -webkit-print-color-adjust: exact;
        }

        .total-box {
            border: 2pt solid #000;
            padding: 6px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .total-label { font-size: 14px; font-weight: 900; }
        .total-value { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
      `}} />

      {/* BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) */}
      <div className="max-w-md mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100 w-full px-6">
        <Link href="/vendas/balcao" className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <PrintButton label="IMPRIMIR CUPOM" />
      </div>

      <div className="receipt-professional shadow-2xl print:shadow-none mb-10">
          {/* CABEÇALHO */}
          <div className="header-container">
              <img src="/images/logo_efatech.png" alt="EFATECH" className="w-20 h-20 object-contain mb-2" />
              <div className="company-info">
                  <b>{empresa.RazaoSocial}</b><br />
                  CNPJ: {empresa.Cnpj}<br />
                  {empresa.Logradouro}, {empresa.Numero || '20'}<br />
                  {empresa.Bairro} - {empresa.Cidade}<br />
                  CEP: {empresa.Cep || '09710-040'}<br />
                  TEL: {empresa.Telefone}
              </div>
          </div>

          <div className="solid-divider" />
          <span className="f-title-main">COMPROVANTE DE VENDA<br />Nº {venda.Numero}</span>
          <div className="solid-divider" />

          {/* INFO CLIENTE */}
          <div className="my-2 space-y-2 px-1">
              <div className="flex justify-between border-b border-dotted border-black pb-1">
                  <span className="f-label-tiny">DATA: {new Date(venda.DataVenda).toLocaleDateString('pt-BR')}</span>
                  <span className="f-label-tiny">HORA: {new Date(venda.DataVenda).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex flex-col gap-1">
                  <div>
                      <span className="f-label-tiny">VENDEDOR:</span>
                      <span className="font-bold text-[12px] ml-1 uppercase">{venda.Vendedor || "SISTEMA"}</span>
                  </div>
                  <div>
                      <span className="f-label-tiny">CLIENTE:</span>
                      <span className="f-value-client uppercase">{cliente?.Nome || "CONSUMIDOR FINAL"}</span>
                  </div>
                  {cliente?.Telefone && (
                    <div>
                        <span className="f-label-tiny">TEL:</span>
                        <span className="font-bold text-[12px] ml-1">{cliente.Telefone}</span>
                    </div>
                  )}
              </div>
          </div>

          {/* PRODUTOS */}
          <div className="section-header-bar">ITENS DA VENDA</div>
          <table className="os-table-mini">
              <thead>
                  <tr>
                      <th width="15%" className="text-center">QTD</th>
                      <th width="50%">DESCRIÇÃO</th>
                      <th width="35%" className="text-right">TOTAL</th>
                  </tr>
              </thead>
              <tbody>
                  {venda.Itens?.map((item: any) => (
                    <tr key={item.Id}>
                        <td className="text-center">{Number(item.Quantidade)}</td>
                        <td className="leading-tight uppercase">
                          {item.Produtos?.Cod_Nome}
                          <div className="text-[9px] font-medium leading-none mt-0.5">ID: {item.ProdutoId}</div>
                        </td>
                        <td className="text-right">R$ {Number(item.ValorTotal).toFixed(2).replace(".", ",")}</td>
                    </tr>
                  ))}
              </tbody>
          </table>

          {/* TOTAL */}
          <div className="total-box">
              <span className="total-label uppercase">TOTAL GERAL</span>
              <span className="total-value">R$ {Number(venda.Total).toFixed(2).replace(".", ",")}</span>
          </div>
          
          {/* PAGAMENTO */}
          <div className="border-t border-black pt-2">
              <span className="f-label-tiny block mb-1">RESUMO DE PAGAMENTO:</span>
              <table className="w-full text-[11px] font-black uppercase leading-tight">
                  <tbody>
                      <tr className="border-b border-dotted border-gray-400">
                          <td className="py-1">FORMA:</td>
                          <td className="text-right py-1">{venda.FormaPagamento?.Nome || "À VISTA / DINHEIRO"}</td>
                      </tr>
                      {venda.Desconto > 0 && (
                        <tr className="border-b border-dotted border-gray-400 text-red-600">
                            <td className="py-1">DESCONTO:</td>
                            <td className="text-right py-1">- R$ {Number(venda.Desconto).toFixed(2).replace(".", ",")}</td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>

          {/* GARANTIA */}
          <div className="section-header-bar">TERMOS E GARANTIA</div>
          <p className="text-[10px] text-justify leading-tight mb-4 font-bold uppercase">
              {venda.Garantia 
                ? `GARANTIA DE ${venda.Garantia} CONTRA DEFEITOS DE FABRICAÇÃO. `
                : ""
              }
              NÃO COBRIMOS DANOS POR MAU USO, LÍQUIDOS, QUEDAS, RACHADURAS, SOBRECARGA ELÉTRICA OU VIOLAÇÃO DE LACRES.
          </p>
          
          {venda.Observacoes && (
            <div className="border border-dashed border-black p-2 mb-4">
                <span className="f-label-tiny block mb-1">OBSERVAÇÕES:</span>
                <p className="text-[12px] font-bold uppercase italic">{venda.Observacoes}</p>
            </div>
          )}
          
          <div className="solid-divider" />
          <p className="text-center text-[11px] font-black py-1">
              *** DOCUMENTO NÃO FISCAL ***
          </p>
          <div className="solid-divider" />

          <div className="text-center mt-4">
              <p className="text-[12px] font-black uppercase">Obrigado pela preferência!</p>
              <p className="text-[9px] font-bold text-gray-500 mt-2">
                  Efatech ERP - www.efatech.com.br
              </p>
          </div>
          
          <div className="h-10" /> {/* Espaço para corte manual */}
      </div>
    </div>
  );
}
