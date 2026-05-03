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
        
        .os-table-mini { width: 100%; border-collapse: collapse; margin: 2px 0; }
        .os-table-mini th { 
            font-size: 9px; 
            text-transform: uppercase; 
            text-align: left; 
            border-bottom: 1px solid #000;
            padding: 1px 0;
        }
        .os-table-mini td { 
            font-size: 13px; 
            padding: 2.5px 0; 
            font-weight: 700;
        }

        .f-label-tiny { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #333; }
        .f-value-client { font-size: 12px; font-weight: 900; display: inline; margin-left: 4px; }
        .f-value-large { font-size: 18px; font-weight: 900; display: block; line-height: 1.0; }
        .f-title-main { font-size: 15px; font-weight: 900; text-align: center; display: block; padding: 1px 0; }
        
        .header-container { display: flex; align-items: start; gap: 8px; margin-bottom: 2px; }
        .company-info { flex: 1; font-size: 10px; line-height: 1.1; }
        .company-info b { font-size: 12px; font-weight: 900; }

        .section-header-bar { 
            text-align: center; 
            font-size: 11px; 
            font-weight: 900; 
            text-transform: uppercase;
            background: #f0f0f0;
            padding: 1px;
            border: 1px solid #000;
            margin: 2px 0;
            line-height: 1.2;
            -webkit-print-color-adjust: exact;
        }
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
          <span className="f-title-main">COMPROVANTE DE VENDA Nº {venda.Numero}</span>
          <div className="dotted-divider" />

          {/* INFO CLIENTE */}
          <div className="my-1 space-y-0.5 px-0.5">
              <div className="flex justify-between mb-1">
                  <span className="f-label-tiny tracking-tighter text-[9px]">DATA: {new Date(venda.DataVenda).toLocaleDateString('pt-BR')}</span>
                  <span className="f-label-tiny tracking-tighter text-[9px]">VENDEDOR: {venda.Vendedor || "SISTEMA"}</span>
              </div>
              <div className="flex flex-col gap-0.5 mt-1 border-t border-dotted border-gray-300 pt-1">
                  <div>
                      <span className="f-label-tiny">CLIENTE:</span>
                      <span className="f-value-client uppercase">{cliente?.Nome || "AVULSO / BALCAO"}</span>
                  </div>
                  <div>
                      <span className="f-label-tiny">TELEFONE:</span>
                      <span className="f-value-client">{cliente?.Telefone || "(---) ---- ----"}</span>
                  </div>
              </div>
          </div>

          {/* PRODUTOS */}
          <div className="section-header-bar">ITENS DA VENDA</div>
          <table className="os-table-mini">
              <thead>
                  <tr>
                      <th width="15%" className="text-center">QTD</th>
                      <th width="45%">DESCRIÇÃO</th>
                      <th width="40%" className="text-right">TOTAL</th>
                  </tr>
              </thead>
              <tbody>
                  {venda.Itens?.map((item: any) => (
                    <tr key={item.Id}>
                        <td className="text-[13px] text-center">{Number(item.Quantidade)}</td>
                        <td className="text-[12px] leading-tight font-black uppercase">
                          {item.Produtos?.Cod_Nome}
                          <div className="text-[9px] font-medium leading-none text-gray-500">ID: {item.ProdutoId}</div>
                        </td>
                        <td className="text-right">R$ {Number(item.ValorTotal).toFixed(2).replace(".", ",")}</td>
                    </tr>
                  ))}
              </tbody>
          </table>

          {/* TOTAL E PAGAMENTO */}
          <div className="flex justify-between gap-1 mt-3 bg-gray-100 p-1 border border-black items-center">
              <span className="text-[12px] font-black uppercase">TOTAL:</span>
              <span className="text-[16px] font-black tracking-tighter">R$ {Number(venda.Total).toFixed(2).replace(".", ",")}</span>
          </div>
          
          <div className="border border-black border-t-0 bg-white mb-2 pb-0.5">
              <table className="w-full text-[9px] text-center font-bold uppercase leading-tight mt-0.5">
                  <thead>
                      <tr className="border-b border-gray-300 text-gray-500">
                          <td width="33%">FORMA PAG.</td>
                          <td width="33%">VENCIMENTO</td>
                          <td width="34%">VALOR (R$)</td>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td className="pt-0.5">{venda.FormaPagamento?.Nome || "À VISTA"}</td>
                          <td className="pt-0.5">{new Date(venda.DataVenda).toLocaleDateString('pt-BR')}</td>
                          <td className="pt-0.5">{Number(venda.Total).toFixed(2).replace(".", ",")}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          {/* GARANTIA */}
          <div className="section-header-bar">
            {venda.Garantia ? `GARANTIA: ${venda.Garantia}` : "TERMOS DE GARANTIA"}
          </div>
          <p className="text-[9px] text-justify leading-tight mb-2 font-bold uppercase border-l-2 border-black pl-2">
              {venda.Garantia 
                ? `ESTE PRODUTO POSSUI GARANTIA DE ${venda.Garantia} CONTRA DEFEITOS DE FABRICAÇÃO. `
                : ""
              }
              NÃO GARANTIMOS APARELHOS QUE SOFRAM DANOS PELO CLIENTE COMO MAU USO, CONTATO COM ÁGUA/LÍQUIDOS, CONFIGURAÇÕES INDEVIDAS, INSTALAÇÕES DE SOFTWARE VÍRUS, AGENTES NATURAIS (RAIOS), TRANSPORTE INDEVIDO OU ACIDENTES.
          </p>
          
          <div className="dotted-divider" />
          {venda.Observacoes && (
            <p className="text-[11px] font-black italic mb-3 text-center uppercase tracking-tighter">Obs: {venda.Observacoes}</p>
          )}
          
          <p className="text-center text-[10px] font-black border-y border-black py-1 mb-2">
              *** NÃO É DOCUMENTO FISCAL ***
          </p>

          <p className="text-center text-[8px] font-bold text-gray-400 mt-2">
              Efatech ERP - Gestão Especialista
          </p>
      </div>
    </div>
  );
}
