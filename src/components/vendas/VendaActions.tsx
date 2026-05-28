"use client";

import React, { useEffect, useState, useTransition } from "react";
import { MoreActionsDropdown, ActionItem } from "@/components/common/MoreActionsDropdown";
import { updateSituacaoVenda } from "@/actions/vendas";
import { sendEmailAction } from "@/actions/mail";
import { emitirNfeFromVenda, getEmpresasInternasEmissoras } from "@/actions/notas";
import { CheckSquare, DollarSign, Printer, Share2, Mail, MessageCircle, FileText, RefreshCw, Coins, Check, X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface VendaActionsProps {
  item: any;
  baseUrl: string;
  tipo: string;
}

export function VendaActions({ item, baseUrl, tipo }: VendaActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [empresasInternas, setEmpresasInternas] = useState<any[]>([]);
  const [isEmitNfeModalOpen, setIsEmitNfeModalOpen] = useState(false);
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState<number | null>(null);
  const [emitNfeFeedback, setEmitNfeFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    getEmpresasInternasEmissoras().then((res) => {
      if (res.success) {
        const empresas = res.data || [];
        setEmpresasInternas(empresas);
        setEmpresaSelecionadaId(empresas[0]?.Id ?? null);
      }
    });
  }, []);

  const handleUpdateStatus = (status: string) => {
    startTransition(async () => {
      const res = await updateSituacaoVenda(item.Id, status);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  const handleSendEmail = () => {
    const email = item.Cliente?.Email;
    if (!email) {
      alert("Este cliente não possui e-mail cadastrado!");
      return;
    }

    startTransition(async () => {
      const subject = `Venda #${item.Numero} - Efatech PRO`;
      const pdfLink = `${baseUrl}/vendas/${tipo}/print-a4/${item.Id}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #38b473;">Efatech PRO</h2>
          <p>Olá <strong>${item.Cliente?.Nome || ""}</strong>,</p>
          <p>Sua Venda <strong>#${item.Numero}</strong> foi concluída.</p>
          <p>Você pode visualizar e baixar o comprovante em PDF clicando no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfLink}" style="background-color: #38b473; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visualizar Comprovante</a>
          </div>
          <p style="font-size: 12px; color: #666;">Se o botão não funcionar, copie e cole este link no seu navegador: ${pdfLink}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Este é um e-mail automático, por favor não responda.</p>
        </div>
      `;

      const res = await sendEmailAction({ to: email, subject, html });
      if (res.success) {
        alert("E-mail enviado com sucesso!");
      } else {
        alert("Erro ao enviar e-mail: " + res.error);
      }
    });
  };

  const handleEmitNfe = (empresaInternaId?: number) => {
    startTransition(async () => {
      const res = await emitirNfeFromVenda(item.Id, empresaInternaId);
      if (!res.success) {
        setEmitNfeFeedback({
          type: "error",
          message: res.error || "Falha ao emitir NF-e.",
        });
        return;
      }
      const status = res.data?.status || "processando";
      const motivo = res.data?.motivo ? `\n\nMotivo SEFAZ: ${res.data.motivo}` : "";
      const exp = res.data?.exportLocal;
      const expErr = res.data?.exportLocalErro;
      const emailAuto = res.data?.emailAutomatico;
      let arquivosMsg = "";
      let emailMsg = "";
      if (exp?.pasta) {
        const partes = [
          exp.xmlPath ? `XML: ${exp.xmlPath}` : null,
          exp.pdfPath ? `DANFE: ${exp.pdfPath}` : null,
        ].filter(Boolean);
        arquivosMsg = `\n\nArquivos salvos em:\n${exp.pasta}${partes.length ? `\n${partes.join("\n")}` : ""}`;
        if (exp.avisos?.length) {
          arquivosMsg += `\n\nAvisos: ${exp.avisos.join(" | ")}`;
        }
      } else if (expErr) {
        arquivosMsg = `\n\nAviso (pasta local): ${expErr}`;
      }
      if (emailAuto?.sent) {
        emailMsg = "\n\nE-mail automático da NF-e enviado ao cliente com DANFE e XML.";
      } else if (emailAuto?.error) {
        emailMsg = `\n\nAviso (e-mail automático): ${emailAuto.error}`;
      }
      setEmitNfeFeedback({
        type: "success",
        message: `NF-e enviada para processamento (${status}).${motivo}${arquivosMsg}${emailMsg}`,
      });
    });
  };

  const actions: ActionItem[] = [
    { label: "Link de cobrança", icon: <DollarSign className="w-4 h-4" /> },
    {
      label: "Imprimir",
      icon: <Printer className="w-4 h-4" />,
      subItems: [
        { label: "Formato A4", href: `/vendas/${tipo}/print-a4/${item.Id}` },
        { label: "Cupom", href: `/vendas/${tipo}/print-pos/${item.Id}` },
      ]
    },
    { 
        label: "Alterar situação", 
        icon: <CheckSquare className="w-4 h-4" />,
        subItems: [
            { 
                label: "Marcar como Concluída", 
                icon: <Check className="w-3.5 h-3.5 text-green-500" />,
                onClick: () => handleUpdateStatus("Concluída")
            },
            { 
                label: "Marcar como Aberta", 
                icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500" />,
                onClick: () => handleUpdateStatus("Aberta")
            },
        ]
    },
    {
      label: "Compartilhar",
      icon: <Share2 className="w-4 h-4" />,
      subItems: [
        { 
            label: isPending ? "Enviando..." : "Via E-mail", 
            icon: isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />,
            onClick: handleSendEmail,
            disabled: isPending
        },
        { 
          label: "Via WhatsApp", 
          icon: <MessageCircle className="w-3.5 h-3.5" />,
          href: getWhatsAppLink(item.Cliente?.TelefoneCelular || item.Cliente?.Telefone || item.Cliente?.TelefoneComercial, `Olá ${item.Cliente?.Nome || ""}, sua venda #${item.Numero} foi concluída. Você pode visualizar o comprovante em PDF através deste link: ${baseUrl}/vendas/${tipo}/print-a4/${item.Id}`) || undefined,
          alertMessage: !(item.Cliente?.TelefoneCelular || item.Cliente?.Telefone || item.Cliente?.TelefoneComercial) ? "Este cliente não possui telefone/celular cadastrado!" : undefined,
          target: "_blank"
        },
      ]
    },
    {
      label: "Emitir",
      icon: <FileText className="w-4 h-4" />,
      subItems: [
        {
          label: "NF-e",
          onClick: () => {
            if (!empresasInternas.length) {
              setEmitNfeFeedback({
                type: "error",
                message: "Nenhuma empresa interna ativa para emissão.",
              });
              return;
            }
            setEmpresaSelecionadaId(empresasInternas[0]?.Id ?? null);
            setEmitNfeFeedback(null);
            setIsEmitNfeModalOpen(true);
          },
        },
        { label: "NFC-e" },
        { label: "NFS-e" },
      ]
    },
    { label: "Gerar", icon: <RefreshCw className="w-4 h-4" /> },
    { label: "Ver no financeiro", icon: <Coins className="w-4 h-4" /> },
  ];

  return (
    <>
      <MoreActionsDropdown variant="row" actions={actions} />

      {isEmitNfeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Selecionar empresa para emissão de NF-e</h3>
              <button
                onClick={() => {
                  setIsEmitNfeModalOpen(false);
                  setEmitNfeFeedback(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Empresa emitente</label>
                <select
                  value={empresaSelecionadaId ?? ""}
                  onChange={(e) => setEmpresaSelecionadaId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium"
                >
                  {empresasInternas.map((emp) => (
                    <option key={emp.Id} value={emp.Id}>
                      {emp.NomeFantasia || emp.RazaoSocial}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsEmitNfeModalOpen(false);
                    setEmitNfeFeedback(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEmitNfe(empresaSelecionadaId ?? undefined)}
                  className="px-4 py-2 text-sm font-bold bg-[#00a65a] hover:bg-green-600 text-white rounded-md"
                  disabled={isPending || !empresaSelecionadaId}
                >
                  {isPending ? "Emitindo..." : "Emitir NF-e"}
                </button>
              </div>
            </div>
          </div>
          {emitNfeFeedback && (
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-md border ${
              emitNfeFeedback.type === "error" ? "border-red-200" : "border-green-200"
            }`}>
              <div className={`px-4 py-3 border-b flex items-center gap-2 font-bold ${
                emitNfeFeedback.type === "error" ? "text-red-700 border-red-100 bg-red-50" : "text-green-700 border-green-100 bg-green-50"
              }`}>
                {emitNfeFeedback.type === "error" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {emitNfeFeedback.type === "error" ? "Pendências para emissão" : "Emissão enviada"}
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {emitNfeFeedback.message}
                </pre>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </>
  );
}
