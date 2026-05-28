import { focusFetch, getFocusConfig } from "./client";
import { FocusAmbiente, FocusNfePayload, FocusNfeResponse } from "./types";

function extractFocusErrorMessage(data: any, status: number) {
  if (!data) return `Falha Focus NFe (${status}).`;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map((i) => (typeof i === "string" ? i : JSON.stringify(i))).join(" | ");
  const motivos = [
    data.motivo,
    data.erro,
    data.error,
    data.mensagem,
    data.message,
    data.descricao,
  ].filter(Boolean);
  if (motivos.length) return String(motivos.join(" | "));
  if (Array.isArray(data.erros) && data.erros.length) return data.erros.map((e: any) => e?.mensagem || e?.message || JSON.stringify(e)).join(" | ");
  return `Falha Focus NFe (${status}).`;
}

async function baixarPorUrlDaFocus(urlOuCaminho: string, ambiente: FocusAmbiente) {
  const { baseUrl, token } = getFocusConfig(ambiente);
  const auth = Buffer.from(`${token}:`).toString("base64");
  const url = /^https?:\/\//i.test(urlOuCaminho)
    ? urlOuCaminho
    : `${baseUrl}${urlOuCaminho.startsWith("/") ? "" : "/"}${urlOuCaminho}`;
  return fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
}

function isDownloadUrlDaFocus(urlOuCaminho: string, baseUrl: string) {
  if (!urlOuCaminho) return false;
  if (urlOuCaminho.startsWith("/v2/")) return true;
  if (urlOuCaminho.startsWith("/arquivos")) return true;
  if (!/^https?:\/\//i.test(urlOuCaminho)) return false;
  try {
    const u = new URL(urlOuCaminho);
    const b = new URL(baseUrl);
    return (
      u.hostname === b.hostname &&
      (u.pathname.startsWith("/v2/") || u.pathname.startsWith("/arquivos"))
    );
  } catch {
    return false;
  }
}

function isPainelHtml(texto: string) {
  const s = (texto || "").toLowerCase();
  return s.includes("<!doctype html") && s.includes("painel focus nfe");
}

export async function emitirNfeFocus(
  ref: string,
  payload: FocusNfePayload,
  ambiente: FocusAmbiente,
) {
  const res = await focusFetch(`/v2/nfe?ref=${encodeURIComponent(ref)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, ambiente);
  const data = (await res.json().catch(() => ({}))) as FocusNfeResponse;
  if (!res.ok) {
    throw new Error(extractFocusErrorMessage(data, res.status));
  }
  return data;
}

export async function consultarNfeFocus(ref: string, ambiente: FocusAmbiente) {
  const res = await focusFetch(`/v2/nfe/${encodeURIComponent(ref)}`, { method: "GET" }, ambiente);
  const data = (await res.json().catch(() => ({}))) as FocusNfeResponse;
  if (!res.ok) {
    throw new Error(extractFocusErrorMessage(data, res.status));
  }
  return data;
}

export async function baixarXmlNfeFocus(ref: string, ambiente: FocusAmbiente) {
  const { baseUrl } = getFocusConfig(ambiente);
  const res = await focusFetch(
    `/v2/nfe/${encodeURIComponent(ref)}.xml`,
    { method: "GET", headers: { Accept: "application/xml" } },
    ambiente,
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(extractFocusErrorMessage(data, res.status));
  }
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const body = await res.text();
  const trimmed = body.trimStart();

  // Alguns ambientes da Focus retornam XML com content-type diferente.
  if (contentType.includes("xml") || trimmed.startsWith("<")) {
    return body;
  }

  const parsed = (() => {
    try {
      return JSON.parse(body || "{}");
    } catch {
      return { message: body || "XML ainda não disponível para download." };
    }
  })();
  const urlXml =
    parsed?.url_xml ||
    parsed?.caminho_xml_nota_fiscal ||
    parsed?.xml ||
    null;
  if (typeof urlXml === "string" && urlXml && isDownloadUrlDaFocus(urlXml, baseUrl)) {
    const resUrl = await baixarPorUrlDaFocus(urlXml, ambiente);
    if (resUrl.ok) {
      const xml = await resUrl.text();
      if (xml.trimStart().startsWith("<")) return xml;
    }
  }
  throw new Error(
    extractFocusErrorMessage(parsed, res.status) ||
      "XML ainda não disponível para download.",
  );
}

export async function baixarPdfNfeFocus(ref: string, ambiente: FocusAmbiente) {
  const { baseUrl } = getFocusConfig(ambiente);
  const res = await focusFetch(
    `/v2/nfe/${encodeURIComponent(ref)}.pdf`,
    { method: "GET", headers: { Accept: "application/pdf" } },
    ambiente,
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(extractFocusErrorMessage(data, res.status));
  }
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const bytes = Buffer.from(await res.arrayBuffer());
  const pdfSignature = bytes.subarray(0, 4).toString("ascii");

  // Aceita por header OU assinatura real do arquivo (%PDF).
  if (contentType.includes("pdf") || pdfSignature === "%PDF") {
    return bytes;
  }

  const text = bytes.toString("utf8");
  if (isPainelHtml(text)) {
    throw new Error("A Focus retornou a página do painel no lugar do PDF do DANFE.");
  }
  const parsed = (() => {
    try {
      return JSON.parse(text || "{}");
    } catch {
      return { message: text || "DANFE ainda não disponível para download." };
    }
  })();
  const urlPdf = parsed?.url_danfe || parsed?.url_danfe_pdf || parsed?.caminho_danfe || parsed?.danfe || parsed?.pdf || null;
  if (typeof urlPdf === "string" && urlPdf && isDownloadUrlDaFocus(urlPdf, baseUrl)) {
    const resUrl = await baixarPorUrlDaFocus(urlPdf, ambiente);
    if (resUrl.ok) {
      const buf = Buffer.from(await resUrl.arrayBuffer());
      if (buf.subarray(0, 4).toString("ascii") === "%PDF") {
        return buf;
      }
    }
  }

  const consulta = await consultarNfeFocus(ref, ambiente).catch(() => null);
  const caminhos = [
    (consulta as any)?.caminho_danfe,
    (consulta as any)?.url_danfe_pdf,
    (consulta as any)?.url_danfe,
    `/v2/nfe/${encodeURIComponent(ref)}.pdf`,
  ].filter((v) => typeof v === "string" && !!v) as string[];

  for (const caminho of caminhos) {
    if (!isDownloadUrlDaFocus(caminho, baseUrl) && !caminho.startsWith("/v2/nfe/")) {
      continue;
    }
    const r = await baixarPorUrlDaFocus(caminho, ambiente);
    if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.subarray(0, 4).toString("ascii") === "%PDF") {
      return buf;
    }
  }

  throw new Error(
    extractFocusErrorMessage(parsed, res.status) ||
      "DANFE ainda não disponível para download.",
  );
}

export async function cancelarNfeFocus(
  ref: string,
  justificativa: string,
  ambiente: FocusAmbiente,
) {
  const res = await focusFetch(`/v2/nfe/${encodeURIComponent(ref)}`, {
    method: "DELETE",
    body: JSON.stringify({ justificativa }),
  }, ambiente);
  const data = (await res.json().catch(() => ({}))) as FocusNfeResponse;
  if (!res.ok) {
    throw new Error(extractFocusErrorMessage(data, res.status));
  }
  return data;
}
