"use client";

import React, { useTransition } from "react";
import { MoreActionsDropdown, ActionItem } from "@/components/common/MoreActionsDropdown";
import { updateSituacaoOS, updateSituacaoIdOS } from "@/actions/ordensServico";
import { sendEmailAction } from "@/actions/mail";
import { CheckSquare, DollarSign, Printer, Share2, Mail, MessageCircle, FileText, RefreshCw, Coins, Check, X, Loader2 } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface OSActionsProps {
  item: any;
  baseUrl: string;
  situacoes?: any[];
}

export function OSActions({ item, baseUrl, situacoes = [] }: OSActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (ativo: boolean) => {
    startTransition(async () => {
      const res = await updateSituacaoOS(item.Id, ativo);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  const handleUpdateSituacaoId = (situacaoId: number | null) => {
    startTransition(async () => {
      const res = await updateSituacaoIdOS(item.Id, situacaoId);
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
      const subject = `Ordem de Serviço #${item.Numero} - Efatech PRO`;
      const pdfLink = `${baseUrl}/ordens-servico/print/${item.Id}/a4`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #38b473;">Efatech PRO</h2>
          <p>Olá <strong>${item.Cliente?.Nome || ""}</strong>,</p>
          <p>Sua Ordem de Serviço <strong>#${item.Numero}</strong> está pronta.</p>
          <p>Equipamento: ${item.Equipamento || "N/A"}</p>
          <p>Você pode visualizar e baixar o documento em PDF clicando no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfLink}" style="background-color: #38b473; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visualizar Ordem de Serviço</a>
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

  const actions: ActionItem[] = [
    {
      label: "Imprimir",
      icon: <Printer className="w-4 h-4" />,
      subItems: [
        { label: "Formato A4", href: `/ordens-servico/print/${item.Id}/a4` },
        { label: "Cupom", href: `/ordens-servico/print/${item.Id}` },
      ]
    },
    { label: "Link de cobrança", icon: <DollarSign className="w-4 h-4" /> },
    { 
        label: "Alterar situação", 
        icon: <CheckSquare className="w-4 h-4" />,
        subItems: [
            ...situacoes.map(sit => ({
                label: sit.Nome,
                icon: <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sit.Cor || "#6c757d" }} />,
                onClick: () => handleUpdateSituacaoId(sit.Id)
            })),
            ...(situacoes.length > 0 ? [{ type: "divider" as const }] : []),
            { 
                label: "Marcar como Aberto", 
                icon: <Check className="w-3.5 h-3.5 text-green-500" />,
                onClick: () => handleUpdateStatus(true)
            },
            { 
                label: "Marcar como Encerrado", 
                icon: <X className="w-3.5 h-3.5 text-red-500" />,
                onClick: () => handleUpdateStatus(false)
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
          href: getWhatsAppLink(item.Cliente?.TelefoneCelular || item.Cliente?.Telefone || item.Cliente?.TelefoneComercial, `Olá ${item.Cliente?.Nome || ""}, sua ordem de serviço #${item.Numero} está pronta. Você pode visualizá-la e baixá-lo em PDF através deste link: ${baseUrl}/ordens-servico/print/${item.Id}/a4`) || undefined,
          alertMessage: !(item.Cliente?.TelefoneCelular || item.Cliente?.Telefone || item.Cliente?.TelefoneComercial) ? "Este cliente não possui telefone/celular cadastrado!" : undefined,
          target: "_blank"
        },
      ]
    },
    { label: "Gerar Recibo", icon: <FileText className="w-4 h-4" /> },
    { label: "Ver no financeiro", icon: <Coins className="w-4 h-4" /> },
  ];

  return <MoreActionsDropdown variant="row" actions={actions} />;
}
