import { FocusAmbiente } from "./types";

const FOCUS_PROD_DEFAULT = "https://api.focusnfe.com.br";
const FOCUS_HML_DEFAULT = "https://homologacao.focusnfe.com.br";

function normalizeFocusBaseUrl(raw: string | undefined, fallback: string, envName: string) {
  const trimmed = raw?.trim();
  if (!trimmed) return fallback;
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes("focusnfe.com.br")) {
      console.warn(
        `[Focus NFe] ${envName} aponta para "${trimmed}" (host inválido). Usando ${fallback}.`,
      );
      return fallback;
    }
    return trimmed.replace(/\/$/, "");
  } catch {
    console.warn(
      `[Focus NFe] ${envName} inválida ("${trimmed}"). Usando ${fallback}.`,
    );
    return fallback;
  }
}

function resolveBaseUrl(ambiente: FocusAmbiente) {
  if (ambiente === "producao") {
    return normalizeFocusBaseUrl(
      process.env.FOCUS_NFE_BASE_URL_PROD,
      FOCUS_PROD_DEFAULT,
      "FOCUS_NFE_BASE_URL_PROD",
    );
  }
  return normalizeFocusBaseUrl(
    process.env.FOCUS_NFE_BASE_URL,
    FOCUS_HML_DEFAULT,
    "FOCUS_NFE_BASE_URL",
  );
}

function resolveToken(ambiente: FocusAmbiente) {
  if (ambiente === "producao") {
    return process.env.FOCUS_NFE_TOKEN_PROD || process.env.FOCUS_NFE_TOKEN;
  }
  return process.env.FOCUS_NFE_TOKEN;
}

export function getFocusConfig(ambiente: FocusAmbiente) {
  const token = resolveToken(ambiente);
  const baseUrl = resolveBaseUrl(ambiente);
  if (!token) {
    throw new Error("FOCUS_NFE_TOKEN não configurado.");
  }
  return { token, baseUrl };
}

export async function focusFetch(
  path: string,
  init: RequestInit,
  ambiente: FocusAmbiente,
) {
  const { baseUrl, token } = getFocusConfig(ambiente);
  const auth = Buffer.from(`${token}:`).toString("base64");
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Basic ${auth}`);
  if (!headers.has("Content-Type") && init.body && init.method && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  return response;
}
