import { ArrowLeft, Phone, MapPin, Hash, User, Calendar, Cpu, ShieldCheck, ClipboardList, Wallet } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/forms/PrintButton";
import { getOrdemServicoById } from "@/actions/ordensServico";
import { getEmpresa } from "@/actions/configuracoes";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PrintOSPage({ params }: PageProps) {
    const { id } = await params;
    
    // Auth Check
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    
    const [osRes, empRes] = await Promise.all([
        getOrdemServicoById(Number(id)),
        getEmpresa()
    ]);

    if (!osRes.success || !osRes.data) {
        notFound();
    }

    const os = osRes.data;
    const empresa = empRes.data || {
        RazaoSocial: "EFATECH ASSISTÊNCIA TÉCNICA E ACESSÓRIOS",
        Cnpj: "41.092.084/0001-18",
        Logradouro: "Praça Lauro Gomes, 20",
        Bairro: "Centro",
        Cidade: "S. Bernardo do Campo",
        Telefone: "(11) 91091-8448",
    };

    // Cálculo de 90 dias
    const dataEntrada = new Date(os.DataAbertura);
    const dataVencimento = new Date(dataEntrada);
    dataVencimento.setDate(dataVencimento.getDate() + 90);

    return (
        <div className="w-full flex flex-col items-center overflow-hidden bg-gray-100 min-h-screen">
            <style dangerouslySetInnerHTML={{
                __html: `
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
                .f-value-client { font-size: 12px; font-weight: 900; display: block; }
                .f-value-large { font-size: 18px; font-weight: 900; display: block; line-height: 1.0; }
                .f-title-main { font-size: 15px; font-weight: 900; text-align: center; display: block; padding: 1px 0; }
                
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
                    padding: 3px;
                    border: 2px dotted #000;
                    background: #fafafa;
                    margin: 5px 0;
                }
            `}} />

            {/* BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) */}
            <div className="max-w-md mx-auto mb-4 mt-6 p-4 print:hidden flex justify-between items-center bg-white shadow-2xl rounded-2xl border border-gray-100">
                <Link href="/ordens-servico" className="px-4 py-1.5 bg-gray-50 text-sm font-bold border rounded-lg hover:bg-black hover:text-white transition-all">
                    ← Voltar
                </Link>
                <PrintButton label="IMPRIMIR O.S." />
            </div>

            <div className="receipt-professional shadow-2xl print:shadow-none mb-10">
                {/* CABEÇALHO */}
                <div className="header-container">
                    <img src="/images/logo_efatech.png" alt="EFATECH" className="w-14 h-14 object-contain shrink-0" />
                    <div className="company-info leading-tight">
                        <b>{empresa.RazaoSocial}</b><br />
                        CNPJ: {empresa.Cnpj}<br />
                        {empresa.Logradouro}, {empresa.Bairro}<br />
                        {empresa.Cidade} - CEP: 09710-040<br />
                        {empresa.Telefone}
                    </div>
                </div>

                <div className="dotted-divider" />
                <span className="f-title-main">ORDEM DE SERVIÇO Nº {os.Numero}</span>
                <div className="dotted-divider" />

                {/* INFO CLIENTE */}
                <div className="my-2 space-y-1.5 px-1">
                    <div className="flex justify-between">
                        <span className="f-label-tiny tracking-tighter text-[9px]">DATA: {new Date(os.DataAbertura).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                        <span className="f-label-tiny">CLIENTE:</span>
                        <span className="f-value-client uppercase">{os.Cliente?.Nome || "AVULSO / BALCAO"}</span>
                    </div>
                    <div>
                        <span className="f-label-tiny">TELEFONE:</span>
                        <span className="f-value-client">{os.Cliente?.Telefone || "(---) ---- ----"}</span>
                    </div>
                </div>

                {/* EQUIPAMENTO */}
                <div className="section-header-bar">EQUIPAMENTO</div>
                <table className="os-table-mini">
                    <thead>
                        <tr>
                            <th width="35%">Aparelho</th>
                            <th width="35%">Marca</th>
                            <th width="30%">Modelo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-[14px]">{os.Equipamento?.split(" ")[0] || "CELULAR"}</td>
                            <td className="text-[14px]">APPLE</td>
                            <td className="text-[14px]">{os.Equipamento?.split(" ").slice(1).join(" ") || "11"}</td>
                        </tr>
                    </tbody>
                </table>

                {/* GARANTIA */}
                <div className="section-header-bar">TERMOS DE GARANTIA</div>
                <p className="text-[9px] text-justify leading-tight mb-3 font-bold uppercase border-l-2 border-black pl-2">
                    NÃO GARANTIMOS APARELHOS QUE SOFRAM DANOS PELO CLIENTE COMO MAU USO, CONTATO COM ÁGUA/LÍQUIDOS, CONFIGURAÇÕES INDEVIDAS, INSTALAÇÕES DE SOFTWARE VÍRUS, AGENTES NATURAIS (RAIOS), TRANSPORTE INDEVIDO OU ACIDENTES. NÃO NOS RESPONSABILIZAMOS POR BACKUPS OU DADOS.
                </p>

                {/* SERVIÇOS */}
                <div className="section-header-bar">DETALHES DO SERVIÇO</div>
                <table className="os-table-mini">
                    <thead>
                        <tr>
                            <th width="60%">Descrição</th>
                            <th width="40%" className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-[12px] leading-tight font-black uppercase">{os.Solucao || "TELA COMPLETA"}</td>
                            <td className="text-right">R$ {Number(os.Total).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-between gap-1 mt-2 bg-gray-100 p-1 border border-black items-center">
                    <span className="text-[11px] font-black uppercase">TOTAL O.S.:</span>
                    <span className="text-[19px] font-black tracking-tighter">R$ {Number(os.Total).toFixed(2)}</span>
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
                                <td className="pt-0.5">{os.FormaPagamento?.Nome || "À VISTA"}</td>
                                <td className="pt-0.5">{new Date(os.DataAbertura).toLocaleDateString('pt-BR')}</td>
                                <td className="pt-0.5">{Number(os.Total).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* VALIDADE (90 DIAS) */}
                <div className="section-header-bar">VALIDADE DA O.S.</div>
                <div className="validity-box">
                    <span className="f-label-tiny block">Válida por 90 dias:</span>
                    <span className="text-[14px] font-black tracking-tight italic">
                        {new Date(os.DataAbertura).toLocaleDateString('pt-BR')} até {dataVencimento.toLocaleDateString('pt-BR')}
                    </span>
                    <p className="text-[8px] font-bold mt-1 uppercase text-red-600">Aparelhos não retirados em 90 dias serão vendidos.</p>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="dotted-divider" />
                <p className="text-[12px] font-black italic mb-3 text-center uppercase tracking-tighter">Obs: {os.Observacoes || "GARANTIA 90 DIAS"}</p>
                
                <p className="text-center text-[10px] font-black border-y border-black py-1 mb-2">
                    *** NÃO É DOCUMENTO FISCAL ***
                </p>

                <div className="flex justify-between text-[11px] font-black mt-3">
                    <span>ENT.: {new Date(os.DataAbertura).toLocaleDateString('pt-BR')}</span>
                    <span>SAÍDA: __/__/____</span>
                </div>

                {/* ASSINATURAS */}
                <div className="flex justify-between gap-4 mt-12 pb-6">
                    <div className="flex-1 border-t border-black text-center pt-1 text-[9px] font-black uppercase">Cliente</div>
                    <div className="flex-1 border-t border-black text-center pt-1 text-[9px] font-black uppercase">Técnico</div>
                </div>

                <p className="text-center text-[8px] font-bold text-gray-400 mt-2">
                    Efatech ERP - Gestão Especialista
                </p>
            </div>
        </div>
    );
}
