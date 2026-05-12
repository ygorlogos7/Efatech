import { redirect } from "next/navigation";

/** Rota índice: o menu e cards apontam para /financeiro; redireciona para contas a pagar. */
export default function FinanceiroPage() {
  redirect("/financeiro/contas-pagar");
}
