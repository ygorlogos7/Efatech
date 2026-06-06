"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { enviarNotaNfePorEmail, getNotas } from "@/actions/notas";
import { ShoppingCart, Search, Filter, PlusCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

const DANFE_ICON_URL = "https://img.icons8.com/?size=100&id=299&format=png&color=000000";
const XML_ICON_URL = "https://img.icons8.com/?size=100&id=38248&format=png&color=000000";
const EMAIL_ICON_URL = "https://img.icons8.com/?size=100&id=85500&format=png&color=000000";

function getNotaStatusBadge(status?: string) {
  const normalized = (status || "").toLowerCase();

  if (normalized.includes("nao") && normalized.includes("autoriz")) {
    return {
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Icon: Clock,
    };
  }

  if (normalized.includes("autoriz") && !normalized.includes("erro")) {
    return {
      className: "bg-green-50 text-green-700 border-green-200",
      Icon: CheckCircle2,
    };
  }

  if (normalized.includes("rejeit") || normalized.includes("erro") || normalized.includes("deneg")) {
    return {
      className: "bg-red-50 text-red-700 border-red-200",
      Icon: XCircle,
    };
  }

  return {
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Icon: Clock,
  };
}

export default function NotasProdutosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSendNotaEmail = (notaId: number) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await enviarNotaNfePorEmail(notaId);
      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.error || "Falha ao enviar NF-e por e-mail.",
        });
        return;
      }
      setFeedback({
        type: "success",
        message: "NF-e enviada por e-mail com sucesso!",
      });
    });
  };

  React.useEffect(() => {
    startTransition(async () => {
      const r = await getNotas("produto");
      if (r.success) setItems(r.data as any[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-md shadow-sm border border-gray-200 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Notas de Produtos (NFe)</h2>
          <p className="text-xs text-gray-500">Gerenciamento de Notas Fiscais Eletrônicas</p>
        </div>
        {feedback && (
          <div
            className={`w-full sm:w-auto text-sm font-medium px-3 py-2 rounded-md border ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}
        <Link href="/notas/produtos/create" className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#00a859] hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-all active:scale-95 decoration-transparent">
          <PlusCircle className="w-4 h-4" /> Emitir Nova NFe
        </Link>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por número, chave ou cliente..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-[#38b473] focus:ring-1 focus:ring-[#38b473]" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full text-sm text-left border-collapse min-w-[900px]">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-6">Número/Série</th>
              <th className="py-3 px-6">Destinatário</th>
              <th className="py-3 px-4 text-right">Valor Total</th>
              <th className="py-3 px-4 text-center">Emissão</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(isPending || items.length === 0) ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-gray-500">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 opacity-20 text-gray-400"/>
                  </div>
                  <h5 className="text-lg font-bold text-gray-700">{isPending ? "Carregando notas..." : "Nenhuma NFe autorizada."}</h5>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">Emita notas fiscais eletrônicas de produtos diretamente pelo sistema.</p>
                </td>
              </tr>
            ) : items.map(item => {
              const statusBadge = getNotaStatusBadge(item.Status);
              const StatusIcon = statusBadge.Icon;

              return (
              <tr key={item.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6">
                   <div className="font-bold text-gray-900">{item.Numero || "---"}</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Série {item.Serie || 1}</div>
                </td>
                <td className="py-3 px-6 font-medium text-gray-700">{item.Destinatario || "Não informado"}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">R$ {item.ValorTotal.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 px-4 text-center text-gray-600 font-mono text-xs">{new Date(item.DataEmissao).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                   <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border ${statusBadge.className}`}>
                      <StatusIcon className="w-3 h-3" />
                      {(item.Status || "pendente").replace(/_/g, " ").toUpperCase()}
                   </span>
                </td>
                <td className="py-3 px-4 text-center">
                   {item.FocusRef && /autoriz/i.test(item.Status || "") && !/erro|rejeit|deneg|nao/i.test(item.Status || "") ? (
                     <>
                       <a
                         href={`/notas/danfe/${item.Id}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         title="Abrir DANFE (PDF)"
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all"
                       >
                        <img
                          src={DANFE_ICON_URL}
                          alt="DANFE"
                          className="w-6 h-6 object-contain"
                        />
                       </a>
                       <a
                         href={`/api/notas/${item.Id}/xml`}
                         title="Baixar XML"
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all ml-1"
                       >
                        <img
                          src={XML_ICON_URL}
                          alt="XML"
                          className="w-6 h-6 object-contain"
                        />
                       </a>
                       <button
                        type="button"
                        onClick={() => handleSendNotaEmail(item.Id)}
                        title="Enviar NF-e por e-mail"
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all ml-1"
                       >
                        <img
                          src={EMAIL_ICON_URL}
                          alt="Enviar por e-mail"
                          className="w-6 h-6 object-contain"
                        />
                       </button>
                     </>
                   ) : (
                     <span className="text-[10px] text-gray-400">—</span>
                   )}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
