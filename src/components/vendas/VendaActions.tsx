"use client";

import React, { useTransition } from "react";
import { MoreActionsDropdown, ActionItem } from "@/components/common/MoreActionsDropdown";
import { updateSituacaoVenda } from "@/actions/vendas";
import { sendEmailAction } from "@/actions/mail";
import { CheckSquare, DollarSign, Printer, Share2, Mail, MessageCircle, FileText, RefreshCw, Coins, Check, X, Loader2 } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface VendaActionsProps {
  item: any;
  baseUrl: string;
  tipo: string;
}

export function VendaActions({ item, baseUrl, tipo }: VendaActionsProps) {
  const [isPending, startTransition] = useTransition();

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
            { 
                label: "Marcar como Cancelada", 
                icon: <X className="w-3.5 h-3.5 text-red-500" />,
                onClick: () => handleUpdateStatus("Cancelada")
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
        { label: "NF-e" },
        { label: "NFC-e" },
        { label: "NFS-e" },
      ]
    },
    { label: "Gerar", icon: <RefreshCw className="w-4 h-4" /> },
    { label: "Ver no financeiro", icon: <Coins className="w-4 h-4" /> },
  ];

  return <MoreActionsDropdown variant="row" actions={actions} />;
}
