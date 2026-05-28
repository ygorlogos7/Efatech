import fs from "fs/promises";
import path from "path";
import { baixarPdfNfeFocus, baixarXmlNfeFocus } from "./nfe";
import { FocusAmbiente } from "./types";

export interface ExportLocalNfeInput {
  pasta: string;
  ref: string;
  ambiente: FocusAmbiente;
  chave?: string | null;
  numero?: number | string | null;
  serie?: number | string | null;
  urlDanfe?: string | null;
}

export interface ExportLocalNfeResult {
  pasta: string;
  pdfPath?: string;
  xmlPath?: string;
  avisos: string[];
}

function normalizePasta(pasta: string) {
  const trimmed = pasta.trim();
  if (!trimmed) throw new Error("Informe a pasta de destino para salvar XML e DANFE.");
  const resolved = path.resolve(trimmed);
  if (resolved.includes("..")) {
    throw new Error("Caminho da pasta inválido.");
  }
  return resolved;
}

function buildBaseName(input: ExportLocalNfeInput) {
  const serie = input.serie ?? "1";
  const numero = input.numero ?? "s-num";
  const chaveSuffix = input.chave ? `-${String(input.chave).slice(-8)}` : "";
  const safeRef = input.ref.replace(/[^\w-]/g, "_").slice(0, 40);
  return `NFe-${serie}-${numero}${chaveSuffix}-${safeRef}`;
}

async function downloadDanfePorUrl(urlDanfe: string) {
  const res = await fetch(urlDanfe, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Falha ao baixar DANFE (${res.status}).`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function salvarNfeArquivosLocais(
  input: ExportLocalNfeInput,
): Promise<ExportLocalNfeResult> {
  const pasta = normalizePasta(input.pasta);
  await fs.mkdir(pasta, { recursive: true });

  const baseName = buildBaseName(input);
  const avisos: string[] = [];
  let pdfPath: string | undefined;
  let xmlPath: string | undefined;

  try {
    const xml = await baixarXmlNfeFocus(input.ref, input.ambiente);
    xmlPath = path.join(pasta, `${baseName}.xml`);
    await fs.writeFile(xmlPath, xml, "utf8");
  } catch (err: any) {
    avisos.push(`XML: ${err?.message || "não foi possível salvar."}`);
  }

  try {
    let pdfBuffer: Buffer | null = null;
    if (input.urlDanfe) {
      try {
        pdfBuffer = await downloadDanfePorUrl(input.urlDanfe);
      } catch {
        pdfBuffer = null;
      }
    }
    if (!pdfBuffer) {
      pdfBuffer = await baixarPdfNfeFocus(input.ref, input.ambiente);
    }
    pdfPath = path.join(pasta, `${baseName}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);
  } catch (err: any) {
    avisos.push(`DANFE: ${err?.message || "não foi possível salvar."}`);
  }

  if (!xmlPath && !pdfPath) {
    throw new Error(avisos.join(" "));
  }

  return { pasta, pdfPath, xmlPath, avisos };
}
