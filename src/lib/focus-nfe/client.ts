import { FocusAmbiente } from "./types";

function resolveBaseUrl(ambiente: FocusAmbiente) {
  if (ambiente === "producao") {
    return process.env.FOCUS_NFE_BASE_URL_PROD || "https://api.focusnfe.com.br";
  }
  return process.env.FOCUS_NFE_BASE_URL || "https://homologacao.focusnfe.com.br";
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
