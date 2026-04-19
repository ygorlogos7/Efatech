import { prisma } from "./prisma";
import { headers } from "next/headers";

export type LogType = "INFO" | "ERRO" | "AVISO";

/**
 * Registra uma ação no log do sistema para auditoria e depuração.
 * @param acao O nome da ação realizada (ex: 'Criar Produto')
 * @param modulo O módulo onde a ação ocorreu (ex: 'Produtos')
 * @param descricao Detalhes adicionais ou erro (ex: 'Produto ABC cadastrado' ou 'Falha no banco de dados')
 * @param tipo O tipo do log (INFO ou ERRO para destaque visual)
 * @param usuario Nome do usuário logado (opcional)
 */
export async function logAction(
  acao: string,
  modulo: string,
  descricao: string,
  tipo: LogType = "INFO",
  usuario?: string
) {
  try {
    const head = await headers();
    const ip = head.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const acaoFormatada = tipo === "ERRO" ? `[ERRO] ${acao}` : acao;

    await prisma.logSistema.create({
      data: {
        Acao: acaoFormatada,
        Modulo: modulo.toUpperCase(),
        Descricao: descricao,
        Usuario: usuario || "Sistema",
        Ip: ip,
        Data: new Date(),
      },
    });
  } catch (error) {
    console.error("CRITICAL: Failed to write system log:", error);
  }
}
