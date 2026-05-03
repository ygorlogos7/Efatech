import { getOrcamentoById } from "@/actions/orcamentos";
import { getEmpresa } from "@/actions/configuracoes";
import { notFound } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/forms/PrintButton";
import { FloatingPrintActions } from "@/components/common/FloatingPrintActions";
import { AutoPrint } from "@/components/common/AutoPrint";
import { auth } from "@/auth";

export default async function PrintOrcamentoServicoA4Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orcId = Number(id);
  
  if (isNaN(orcId)) {
    notFound();
  }

  const res = await getOrcamentoById(orcId);
  const empRes = await getEmpresa();

  if (!res.success || !res.data) notFound();
  
  const orcamento = res.data;
  const empresa = empRes.data;
  const cliente = orcamento.Clientes;
  const endereco = cliente?.Endereco?.[0];
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      

      <AutoPrint />

      <style dangerouslySetInnerHTML={{ __html: `
        .print-container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            color: #000;
            font-size: 11px;
        }

        .os-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            align-items: center;
        }
        
        .os-header-left {
            width: 150px; height: 75px; 
            background-color: #000; color: #fff; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: bold; font-size: 18px;
        }

        .os-header-center {
            flex-grow: 1;
            padding-left: 20px;
            line-height: 1.3;
        }

        .os-header-right {
            text-align: right;
            line-height: 1.3;
            font-weight: bold;
        }

        .os-title-bar {
            background-color: #e9ecef;
            padding: 8px 15px;
            font-weight: bold;
            text-align: center;
            font-size: 14px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            border: 1px solid #ccc;
        }

        .os-section-title {
            background-color: #f1f3f5;
            border: 1px solid #ccc;
            border-bottom: none;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 5px;
        }

        .os-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 15px;
        }

        .os-table th, .os-table td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            vertical-align: middle;
        }

        .os-table td label {
            font-weight: bold;
            margin-right: 5px;
        }

        @media print {
            body { background: #fff; }
            .no-print, nav, footer, .print-hidden { display: none !important; }
            .print-container {
                border: none;
                box-shadow: none;
                padding: 0;
                width: 100%;
                max-width: 100%;
            }
            
            .os-title-bar, .os-section-title, .os-th-gray {
                background-color: #f1f3f5 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .os-header-left {
                background-color: #000 !important;
                color: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            @page { margin: 10mm; size: A4 portrait; }
        }
      `}} />      {session && (
        <div className="max-w-[900px] mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100">
            <Link href="/orcamentos/servicos" className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <PrintButton label="IMPRIMIR ORÇAMENTO" />
        </div>
      )}

      <div className="print-container">
          <div className="os-header">
              <div className="os-header-left">
                  <span><span style={{color: "#00FFAA"}}>E</span>fatech</span>
              </div>
              <div className="os-header-center">
                  <div style={{fontSize: "13px", fontWeight: "bold"}}>{empresa?.RazaoSocial || "EFATECH ASSISTÊNCIA TÉCNICA E ACESSÓRIOS"}</div>
                  <div>CNPJ: {empresa?.Cnpj || "41.092.084/0001-18"}</div>
                  <div>{empresa?.Logradouro || "Praça Lauro Gomes"}, {empresa?.Numero || "20"} - {empresa?.Bairro || "Centro"}</div>
                  <div>{empresa?.Cidade || "São Bernardo do Campo"}/{empresa?.Uf || "SP"} - CEP: {empresa?.Cep || "09710-040"}</div>
              </div>
              <div className="os-header-right">
                  <div>{empresa?.Telefone || "(11) 91091-8448"}</div>
                  <div>{empresa?.Email || "efatechassistencia@gmail.com"}</div>
              </div>
          </div>

          <div className="os-title-bar">
              <span>ORÇAMENTO Nº {orcamento.Numero}</span>
              <span>EMISSÃO: {new Date(orcamento.CreatedAt).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="os-section-title">DADOS DO CLIENTE</div>
          <table className="os-table">
              <tbody>
                <tr>
                    <td width="50%"><label>Cliente:</label> {cliente?.Nome || "CLIENTE AVULSO / BALCAO"}</td>
                    <td width="50%"><label>CNPJ/CPF:</label> {cliente?.CPFCNPJ || ""}</td>
                </tr>
                <tr>
                    <td><label>Endereço:</label> {endereco ? `${endereco.Logradouro}, ${endereco.Numero} - ${endereco.Bairro}` : ""}</td>
                    <td><label>CEP:</label> {endereco?.Cep || ""}</td>
                </tr>
                <tr>
                    <td><label>Cidade:</label> {endereco?.Cidade || ""}</td>
                    <td><label>Telefone:</label> {cliente?.Telefone || cliente?.TelefoneCelular || ""}</td>
                </tr>
              </tbody>
          </table>

          <div className="os-section-title">DETALHAMENTO DO ORÇAMENTO</div>
          <table className="os-table">
              <thead>
                <tr className="os-th-gray" style={{textTransform: "uppercase"}}>
                    <th style={{width: "80%"}} className="text-left">DESCRIÇÃO DOS PRODUTOS / SERVIÇOS</th>
                    <th style={{width: "20%"}} className="text-right">VALOR (R$)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td className="min-h-[60px] vertical-top h-auto">
                        <div className="font-bold uppercase leading-relaxed p-2 whitespace-pre-wrap">
                           {orcamento.Descricao || "NENHUMA DESCRIÇÃO INFORMADA."}
                        </div>
                    </td>
                    <td className="text-right font-black text-[14px]">
                        {Number(orcamento.Total).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })}
                    </td>
                </tr>
                <tr>
                    <td className="text-right" style={{borderRight: "1px solid #ccc"}}><strong>VALOR TOTAL:</strong></td>
                    <td className="text-right font-bold os-th-gray text-[15px]">
                        {Number(orcamento.Total).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })}
                    </td>
                </tr>
              </tbody>
          </table>

          <div className="os-section-title">VALIDADE E OBSERVAÇÕES</div>
          <table className="os-table">
              <tbody>
                <tr>
                    <td>
                        <label>Válido até:</label> 
                        {orcamento.DataValidade ? new Date(orcamento.DataValidade).toLocaleDateString('pt-BR') : "CONSULTAR VENDEDOR"}
                    </td>
                </tr>
                {orcamento.Observacoes && (
                    <tr>
                        <td><label>Obs:</label> {orcamento.Observacoes}</td>
                    </tr>
                )}
              </tbody>
          </table>

          <div style={{display: "flex", justifyContent: "space-between", marginTop: "80px"}}>
              <div style={{borderTop: "1px solid #000", width: "45%", textAlign: "center", paddingTop: "8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase"}}>
                  Assinatura do Cliente
              </div>
              <div style={{borderTop: "1px solid #000", width: "45%", textAlign: "center", paddingTop: "8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase"}}>
                  Efatech
              </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-gray-400 font-bold border-t pt-2">
              *** DOCUMENTO DE ORÇAMENTO ***
          </div>
      </div>
    </div>
  );
}
