import { consultarNfeFocus } from "./nfe";
import { FocusAmbiente, FocusNfeResponse } from "./types";

function isStatusFinal(status?: string) {
  const s = String(status || "").toLowerCase();
  if (/erro|rejeit|deneg/.test(s)) return true;
  if (/autoriz/.test(s) && !/nao/.test(s)) return true;
  return false;
}

export function isNfeAutorizada(status?: string) {
  const s = String(status || "").toLowerCase();
  return /autoriz/.test(s) && !/erro|rejeit|deneg|nao/.test(s);
}

export async function aguardarNfeAutorizada(
  ref: string,
  ambiente: FocusAmbiente,
  timeoutMs = 35000,
): Promise<FocusNfeResponse> {
  const inicio = Date.now();
  let ultima: FocusNfeResponse = {};

  while (Date.now() - inicio < timeoutMs) {
    ultima = await consultarNfeFocus(ref, ambiente);
    if (isStatusFinal(ultima.status as string | undefined)) {
      return ultima;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return ultima;
}
