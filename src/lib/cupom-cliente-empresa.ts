/** Formata CNPJ para exibição em cupom térmico quando houver 14 dígitos numéricos. */

export function digitsOnlyDoc(input: string | null | undefined): string {
  return (input ?? "").replace(/\D/g, "");
}

export function formatCnpjCupom(raw: string | null | undefined): string {
  const d = digitsOnlyDoc(raw);
  if (d.length !== 14) return (raw ?? "").trim() || "—";
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}
