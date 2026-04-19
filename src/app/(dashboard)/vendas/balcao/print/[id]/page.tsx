import { getVendaById } from "@/actions/vendas";
import { getEmpresa } from "@/actions/configuracoes";
import { notFound } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/common/PrintButton";

export default async function PrintVendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendaId = Number(id);
  
  if (isNaN(vendaId)) {
    notFound();
  }

  const { data: venda } = await getVendaById(vendaId);
  const { data: empresa } = await getEmpresa();

  if (!venda) notFound();

  const cliente = venda.Cliente;
  const endereco = cliente?.Endereco?.[0]; // Pega o primeiro endereço do cliente

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* ── BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) ── */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Comprovante de Venda</h2>
          <p className="text-sm text-gray-500">Visualização de impressão para o cliente</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/vendas/balcao" 
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <PrintButton 
            label="IMPRIMIR" 
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-bold shadow-md transition"
          />
        </div>
      </div>

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

            @page { margin: 10mm; size: A4 portrait; }
        }
      `}} />

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
              <span>COMPROVANTE DE VENDA Nº {venda.Numero}</span>
              <span>{new Date(venda.DataVenda).toLocaleDateString('pt-BR')}</span>
          </div>

          {/* Período Execução */}
          <div className="os-section-title">DETALHES DA VENDA</div>
          <table className="os-table">
              <tbody>
                <tr>
                    <td width="50%"><label>Data da Venda:</label> {new Date(venda.DataVenda).toLocaleString('pt-BR')}</td>
                    <td width="50%"><label>Vendedor responsável:</label> {venda.Vendedor || ""}</td>
                </tr>
              </tbody>
          </table>

          {/* Dados do Cliente */}
          <div className="os-section-title">DADOS DO CLIENTE</div>
          <table className="os-table">
              <tbody>
                <tr>
                    <td width="50%"><label>Cliente:</label> {cliente?.Nome || "CLIENTE PADRÃO BALCÃO"}</td>
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

          {/* Serviços / Produtos */}
          <div className="os-section-title">PRODUTOS DA VENDA</div>
          <table className="os-table">
              <thead>
                <tr className="os-th-gray" style={{textTransform: "uppercase"}}>
                    <th style={{width: "10%"}} className="text-center">QTD</th>
                    <th style={{width: "50%"}} className="text-left">DESCRIÇÃO DO PRODUTO</th>
                    <th style={{width: "20%"}} className="text-center">V. UNIT (R$)</th>
                    <th style={{width: "20%"}} className="text-right">VALOR TOTAL (R$)</th>
                </tr>
              </thead>
              <tbody>
                {venda.Itens?.map((item: any) => (
                  <tr key={item.Id}>
                      <td className="text-center">{Number(item.Quantidade)}</td>
                      <td>
                        {item.Produtos?.Cod_Nome} 
                        <br />
                        <span className="text-muted" style={{fontSize: "9px"}}>Código: {item.Produtos?.Cod_CodigoBarras || item.ProdutoId}</span>
                      </td>
                      <td className="text-center">{Number(item.Produtos?.Cod_Preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="text-right font-bold">{Number(item.ValorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr>
                    <td colSpan={3} className="text-right" style={{border: "none", borderRight: "1px solid #ccc"}}><strong>TOTAL (R$):</strong></td>
                    <td className="text-right font-bold os-th-gray text-[13px]">
                        {Number(venda.Total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
                <tr>
                    <td colSpan={4} className="info-terms" style={{padding: "10px"}}>
                        <p><strong>Termos de garantia / Observações</strong></p>
                        <p>NÃO GARANTIMOS APARELHOS QUE SOFRAM DANOS PELO CLIENTE COMO MAU USO, CONTATO COM ÁGUA, CONFIGURAÇÕES INDEVIDAS, INSTALAÇÕES DE SOFTWARE VÍRUS, AGENTES NATURAIS (RAIOS), TRANSPORTE INDEVIDO OU ACIDENTES. NÃO NOS RESPONSABILIZAMOS POR BACKUPS OU DANOS.</p>
                        {venda.Observacoes && <p className="mt-2"><strong>Obs:</strong> {venda.Observacoes}</p>}
                    </td>
                </tr>
              </tbody>
          </table>

          {/* Assinaturas */}
          <div style={{display: "flex", justifyContent: "space-between", marginTop: "60px"}}>
              <div style={{borderTop: "1px solid #000", width: "45%", textAlign: "center", paddingTop: "5px"}}>
                  Assinatura do Cliente
              </div>
              <div style={{borderTop: "1px solid #000", width: "45%", textAlign: "center", paddingTop: "5px"}}>
                  Efatech Assistência Técnica
              </div>
          </div>
      </div>
    </div>
  );
}
