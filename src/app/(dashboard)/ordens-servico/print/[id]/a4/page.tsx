import { getOrdemServicoById } from "@/actions/ordensServico";
import { getEmpresa } from "@/actions/configuracoes";
import { notFound } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/forms/PrintButton";
import { FloatingPrintActions } from "@/components/common/FloatingPrintActions";

export default async function PrintOSA4Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const osId = Number(id);
  
  if (isNaN(osId)) {
    notFound();
  }

  const { data: os } = await getOrdemServicoById(osId);
  const { data: empresa } = await getEmpresa();

  if (!os) notFound();

  const cliente = os.Cliente;
  const endereco = cliente?.Endereco?.[0]; // Pega o primeiro endereço do cliente

  // Cálculo de 90 dias para garantia (opcional exibir no A4 tbm)
  const dataEntrada = new Date(os.DataAbertura);
  const dataVencimento = new Date(dataEntrada);
  dataVencimento.setDate(dataVencimento.getDate() + 90);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      
      <FloatingPrintActions />

      <style dangerouslySetInnerHTML={{ __html: `
        /* Estilos base para a área de impressão */
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

        /* Cabeçalho superior (Logo e Informações) */
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

        /* Faixa título */
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

        /* Seções e Tabelas */
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

        .info-terms p {
            margin: 2px 0;
            font-size: 10px;
        }

        /* Tratamento exclusivo de impressão */
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
            
            /* Força a cor de fundo cinza nos elementos em CSS para PDF/Impressão (Chrome/Edge) */
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

            .validity-box {
                text-align: center;
                padding: 10px;
                border: 2px dotted #000;
                background: #fff;
                margin: 10px 0;
                color: #000;
            }

            @page { margin: 10mm; size: A4 portrait; }
        }
      `}} />

      {/* BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) */}
      <div className="max-w-[900px] mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100">
          <Link href="/ordens-servico" className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <PrintButton label="IMPRIMIR O.S." />
      </div>

      <div className="print-container">
          {/* Cabeçalho */}
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
                  <div>Responsável: {empresa?.RazaoSocial?.split(' ')[0] || "Johnny Andrade"}<br />Ferreira</div>
              </div>
          </div>

          {/* Barra Título */}
          <div className="os-title-bar">
              <span>ORDEM DE SERVIÇO Nº {os.Numero}</span>
              <span>DATA: {new Date(os.DataAbertura).toLocaleDateString('pt-BR')}</span>
          </div>

          {/* Dados do Cliente */}
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
                    <td><label>Estado:</label> {endereco?.UF || ""}</td>
                </tr>
                <tr>
                    <td><label>Telefone:</label> {cliente?.Telefone || cliente?.TelefoneCelular || ""}</td>
                    <td><label>E-mail:</label> {cliente?.Email || ""}</td>
                </tr>
              </tbody>
          </table>

          {/* Equipamento */}
          <div className="os-section-title">DADOS DO EQUIPAMENTO</div>
          <table className="os-table">
              <tbody>
                <tr>
                    <td width="33%"><label>Equipamento:</label> {os.Equipamento || "-"}</td>
                    <td width="33%"><label>Previsão:</label> {os.DataPrevisao ? new Date(os.DataPrevisao).toLocaleDateString('pt-BR') : "A COMBINAR"}</td>
                    <td width="34%"><label>Situação:</label> {os.Ativo ? "ABERTA" : "FINALIZADA"}</td>
                </tr>
                <tr>
                    <td colSpan={3}>
                        <label>Defeito Reclamado:</label> 
                        <span className="uppercase text-gray-700">{os.Defeito || "NÃO INFORMADO"}</span>
                    </td>
                </tr>
              </tbody>
          </table>

          {/* Detalhes do Serviço */}
          <div className="os-section-title">DETALHAMENTO DO SERVIÇO / SOLUÇÃO</div>
          <table className="os-table">
              <thead>
                <tr className="os-th-gray" style={{textTransform: "uppercase"}}>
                    <th style={{width: "80%"}} className="text-left">DESCRIÇÃO DA SOLUÇÃO / SERVIÇOS EXECUTADOS</th>
                    <th style={{width: "20%"}} className="text-right">VALOR TOTAL (R$)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td className="min-h-[60px] vertical-top h-[80px]">
                        <div className="font-bold uppercase leading-relaxed p-2">
                           {os.Solucao || "AGUARDANDO DIAGNÓSTICO / EXECUÇÃO"}
                        </div>
                    </td>
                    <td className="text-right font-black text-[14px]">
                        {Number(os.Total).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })}
                    </td>
                </tr>
                <tr>
                    <td className="text-right" style={{border: "none", borderRight: "1px solid #ccc"}}><strong>TOTAL OS (R$):</strong></td>
                    <td className="text-right font-bold os-th-gray text-[15px]">
                        {Number(os.Total).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })}
                    </td>
                </tr>
                <tr>
                    <td colSpan={2} className="info-terms" style={{padding: "15px"}}>
                        <p><strong>Termos de garantia / Observações</strong></p>
                        <p className="text-justify leading-tight opacity-70">
                            NÃO GARANTIMOS APARELHOS QUE SOFRAM DANOS PELO CLIENTE COMO MAU USO, CONTATO COM ÁGUA/LÍQUIDOS, CONFIGURAÇÕES INDEVIDAS, INSTALAÇÕES DE SOFTWARE VÍRUS, AGENTES NATURAIS (RAIOS), TRANSPORTE INDEVIDO OU ACIDENTES. NÃO NOS RESPONSABILIZAMOS POR BACKUPS OU DADOS.
                            <br />
                            <strong>VALIDADE DA GARANTIA:</strong> 90 DIAS A PARTIR DE {new Date(os.DataAbertura).toLocaleDateString('pt-BR')}.
                        </p>
                        {os.Observacoes && <p className="mt-4 p-2 bg-gray-50 border-l-4 border-black"><strong>Obs:</strong> {os.Observacoes}</p>}
                    </td>
                </tr>
              </tbody>
          </table>

          {/* Validade da O.S. (Igual ao Cupom) */}
          <div className="os-section-title">VALIDADE DA O.S.</div>
          <div className="validity-box">
              <span className="block font-bold text-[10px]">Válida por 90 dias:</span>
              <span className="text-[16px] font-black tracking-tight italic">
                  {new Date(os.DataAbertura).toLocaleDateString('pt-BR')} até {dataVencimento.toLocaleDateString('pt-BR')}
              </span>
              <p className="text-[10px] font-bold mt-1 uppercase text-red-600">Aparelhos não retirados em 90 dias serão vendidos.</p>
          </div>

          {/* Assinaturas */}
          <div style={{display: "flex", justifyContent: "space-between", marginTop: "80px"}}>
              <div style={{borderTop: "1px solid #000", width: "45%", textAlign: "center", paddingTop: "8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase"}}>
                  Assinatura do Cliente
              </div>
              <div style={{borderTop: "1px solid #000", width: "45%", textAlign: "center", paddingTop: "8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase"}}>
                  Efatech - Técnico Responsável
              </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-gray-400 font-bold border-t pt-2">
              *** ESTE DOCUMENTO NÃO É NOTA FISCAL ***
          </div>
      </div>
    </div>
  );
}
