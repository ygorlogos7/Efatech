"use client";

import { useNotification as useNotifContext } from "../components/providers/NotificationProvider";

/**
 * Hook para disparar notificações em qualquer componente do dashboard.
 * @returns Função notify(mensagem, tipo, título?)
 */
export function useNotification() {
  const { notify } = useNotifContext();
  
  const success = (msg: string, title: string = "Sucesso") => notify(msg, "success", title);
  const error = (msg: string, title: string = "Erro") => notify(msg, "error", title);
  const warn = (msg: string, title: string = "Atenção") => notify(msg, "warning", title);

  return { success, error, warn };
}
