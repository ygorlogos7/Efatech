import { getOrdemServicoById, getOSConfig } from "@/actions/ordensServico";
import { getEmpresa } from "@/actions/configuracoes";
import { notFound } from "next/navigation";
import { ArrowLeft, Cpu, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/forms/PrintButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comprovante de O.S. - Efatech",
};

export default async function PrintOSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const osId = Number(id);
  
  if (isNaN(osId)) {
    notFound();
  }

  const { data: os } = await getOrdemServicoById(osId);
  const { data: empresa } = await getEmpresa();
  const { data: config } = await getOSConfig();

  if (!os) notFound();

  const cliente = os.Cliente;
  const endereco = cliente?.Endereco?.[0]; // Pega o primeiro endereço do cliente

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-black print:p-0 print:bg-white">
      {/* ── BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) ── */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Visualização de Impressão</h2>
          <p className="text-sm text-gray-500">Ordem de Serviço # {os.Numero}</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/ordens-servico" 
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <PrintButton label="IMPRIMIR O.S." />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Estilos base para a área de impressão */
        .print-container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-family: 'Inter', Arial, sans-serif;
            color: #000;
            font-size: 11px;
        }

        /* Cabeçalho superior (Logo e Informações) */
        .os-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            align-items: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        
        .os-header-left {
            width: 150px; height: 75px; 
            background-color: #000; color: #fff; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 800; font-size: 22px;
            letter-spacing: -1px;
        }

        .os-header-center {
            flex-grow: 1;
            padding-left: 25px;
            line-height: 1.4;
        }

        .os-header-right {
            text-align: right;
            line-height: 1.4;
        }

        /* Faixa título */
        .os-title-bar {
            background-color: #000;
            color: #fff;
            padding: 10px 20px;
            font-weight: bold;
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            text-transform: uppercase;
        }

        /* Seções e Tabelas */
        .os-section-title {
            background-color: #f1f3f5;
            border: 1px solid #333;
            border-bottom: none;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 15px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .os-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 10px;
        }

        .os-table th, .os-table td {
            border: 1px solid #333;
            padding: 8px 10px;
            vertical-align: top;
        }

        .os-table td label {
            font-weight: bold;
            display: block;
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .os-content-box {
            border: 1px solid #333;
            padding: 15px;
            min-height: 60px;
            font-size: 11px;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        /* Assinaturas */
        .signature-area {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 40px;
            margin-top: 50px;
            text-align: center;
        }

        .signature-box {
            border-top: 1px solid #000;
            padding-top: 10px;
        }

        .signature-img {
            max-height: 80px;
            margin: 0 auto 10px;
            display: block;
            mix-blend-multiply: true;
        }

        /* Tratamento exclusivo de impressão */
        @media print {
          body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            overflow: visible !important;
          }
          html, main {
            overflow: visible !important;
            height: auto !important;
          }
          .min-h-screen { 
            background: white !important; 
            padding: 0 !important;
            min-height: auto !important;
          }
          #print-area { width: 100% !important; max-width: none !important; margin: 0 !important; box-shadow: none !important; }
          footer, nav, button, .print-hidden, .no-print { display: none !important; }
          
          /* Esconder barra de rolagem e decorações de sistema */
          ::-webkit-scrollbar { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          .print-container {
                border: none;
                box-shadow: none;
                padding: 0;
                width: 100%;
                max-width: 100%;
            }
            .os-header-left {
                background-color: #000 !important;
                color: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .os-title-bar {
                background-color: #000 !important;
                color: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .os-section-title {
                background-color: #f1f3f5 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            @page { margin: 15mm; size: A4 portrait; }
        }
      `}} />

      <div className="print-container">
          {/* Cabeçalho */}
          <div className="os-header">
              <div className="os-header-left">
                  <span><span style={{color: "#00FFAA"}}>E</span>fatech</span>
              </div>
              <div className="os-header-center">
                  <div style={{fontSize: "14px", fontWeight: "bold"}}>{empresa?.RazaoSocial || "EFATECH ASSISTÊNCIA TÉCNICA E ACESSÓRIOS"}</div>
                  <div>CNPJ: {empresa?.Cnpj || "41.092.084/0001-18"}</div>
                  <div>{empresa?.Logradouro || "Praça Lauro Gomes"}, {empresa?.Numero || "20"} - {empresa?.Bairro || "Centro"}</div>
                  <div>{empresa?.Cidade || "São Bernardo do Campo"}/{empresa?.Uf || "SP"} - CEP: {empresa?.Cep || "09710-040"}</div>
              </div>
              <div className="os-header-right">
                  <div style={{fontWeight: "bold"}}>{empresa?.Telefone || "(11) 91091-8448"}</div>
                  <div>{empresa?.Email || "efatechassistencia@gmail.com"}</div>
                  <div style={{fontSize: "10px", marginTop: "5px", color: "#666"}}>Responsável Técnica</div>
              </div>
          </div>

          {/* Barra Título */}
          <div className="os-title-bar">
              <span>ORDEM DE SERVIÇO Nº {os.Numero.toString().padStart(5, '0')}</span>
              <span>DATA: {new Date(os.DataAbertura).toLocaleDateString('pt-BR')}</span>
          </div>

          {/* Dados do Cliente */}
          <div className="os-section-title"><User size={12} /> DADOS DO CLIENTE</div>
          <table className="os-table">
              <tbody>
                <tr>
                    <td width="60%"><label>Nome / Razão Social</label>{cliente?.Nome || "CLIENTE NÃO INFORMADO"}</td>
                    <td width="40%"><label>CPF / CNPJ</label>{cliente?.CPFCNPJ || "---"}</td>
                </tr>
                <tr>
                    <td><label>Endereço</label>{endereco ? `${endereco.Logradouro}, ${endereco.Numero} - ${endereco.Bairro}` : "---"}</td>
                    <td><label>CEP</label>{endereco?.Cep || "---"}</td>
                </tr>
                <tr>
                    <td><label>Cidade / UF</label>{endereco ? `${endereco.Cidade} / ${endereco.UF}` : "---"}</td>
                    <td><label>Telefone / Celular</label>{cliente?.TelefoneCelular || cliente?.Telefone || "---"}</td>
                </tr>
              </tbody>
          </table>

          {/* Dados do Equipamento */}
          <div className="os-section-title"><Cpu size={12} /> INFORMAÇÕES DO EQUIPAMENTO</div>
          <table className="os-table">
              <tbody>
                <tr>
                    <td width="100%"><label>Equipamento / Modelo / Marca</label><strong>{os.Equipamento || "NÃO INFORMADO"}</strong></td>
                </tr>
                <tr>
                    <td width="100%"><label>Previsão de Entrega</label>{os.DataPrevisao ? new Date(os.DataPrevisao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : "NÃO DEFINIDA"}</td>
                </tr>
              </tbody>
          </table>

          {/* Defeito e Solução em Grade */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                  <div className="os-section-title" style={{ marginTop: 0 }}>DEFEITO RELATADO</div>
                  <div className="os-content-box">
                      {os.Defeito || "Nenhuma descrição informada."}
                  </div>
              </div>
              <div>
                  <div className="os-section-title" style={{ marginTop: 0 }}>SOLUÇÃO EXECUTADA</div>
                  <div className="os-content-box">
                      {os.Solucao || "Aguardando execução."}
                  </div>
              </div>
          </div>

          {/* Financeiro */}
          <div className="os-section-title">RESUMO FINANCEIRO</div>
          <table className="os-table">
              <tbody>
                <tr style={{backgroundColor: "#f8f9fa"}}>
                    <td width="80%" style={{textAlign: "right", fontWeight: "bold", fontSize: "12px"}}>VALOR TOTAL DO SERVIÇO / O.S.</td>
                    <td width="20%" style={{textAlign: "center", fontWeight: "bold", fontSize: "14px"}}>R$ {Number(os.Total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
          </table>

          {/* Observações e Termos */}
          <div className="os-section-title"><ShieldCheck size={12} /> TERMOS E OBSERVAÇÕES</div>
          <div className="os-content-box" style={{fontSize: "9px", color: "#555"}}>
              <p style={{fontWeight: "bold", marginBottom: "5px"}}>Termos de Garantia:</p>
              <p>1. O prazo de garantia legal de serviços é de 90 dias conforme CDC, cobrindo apenas as peças substituídas e mão de obra específica.</p>
              <p>2. A garantia será invalidada se houver sinais de mau uso, queda, contato com líquidos ou violação dos lacres de segurança.</p>
              <p>3. Aparelhos não retirados em até 90 dias após o aviso de pronto serão leiloados ou descartados para custear as despesas de armazenagem e peças.</p>
              {os.Observacoes && (
                  <div style={{marginTop: "10px", borderTop: "1px dashed #ccc", paddingTop: "5px"}}>
                      <strong>OBSERVAÇÕES DA OS:</strong> {os.Observacoes}
                  </div>
              )}
              {config?.MensagemRodape && (
                  <div style={{marginTop: "5px", fontWeight: "bold"}}>
                      {config.MensagemRodape}
                  </div>
              )}
          </div>

          {/* Assinaturas */}
          <div className="signature-area">
              <div className="signature-box">
                  {os.AssinaturaTecnico && (
                      <img src={os.AssinaturaTecnico} className="signature-img" alt="Assinatura Técnico" />
                  )}
                  <div style={{fontSize: "10px", fontWeight: "bold"}}>ASSINATURA DO TÉCNICO</div>
                  <div style={{fontSize: "8px", color: "#666"}}>Efatech Assistência Técnica</div>
              </div>
              <div className="signature-box">
                  {os.AssinaturaCliente && (
                      <img src={os.AssinaturaCliente} className="signature-img" alt="Assinatura Cliente" />
                  )}
                  <div style={{fontSize: "10px", fontWeight: "bold"}}>ASSINATURA DO CLIENTE</div>
                  <div style={{fontSize: "8px", color: "#666"}}>{cliente?.Nome || "Autorização de Serviço"}</div>
              </div>
          </div>

          {/* Rodapé Final */}
          <div style={{textAlign: "center", marginTop: "30px", fontSize: "8px", color: "#999", textTransform: "uppercase", letterSpacing: "1px"}}>
              Documento gerado em {new Date().toLocaleString('pt-BR')} · Sistema ERP Efatech
          </div>
      </div>
    </div>
  );
}
