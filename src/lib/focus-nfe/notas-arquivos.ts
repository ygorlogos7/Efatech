import { prisma } from "@/lib/prisma";
import { aguardarNfeAutorizada, isNfeAutorizada } from "./aguardar-autorizacao";
import { baixarPdfNfeFocus, baixarXmlNfeFocus } from "./nfe";
import { FocusAmbiente } from "./types";

export async function getNotaFiscalParaDownload(notaId: number) {
  const nota = await prisma.notaFiscal.findUnique({ where: { Id: notaId } });
  if (!nota?.FocusRef) {
    throw new Error("Nota fiscal sem referência de emissão.");
  }
  const ambiente = (nota.Ambiente || "homologacao") as FocusAmbiente;
  return { nota, ambiente, ref: nota.FocusRef };
}

export async function obterPdfNotaFiscal(notaId: number) {
  const { nota, ambiente, ref } = await getNotaFiscalParaDownload(notaId);
  const consulta = await aguardarNfeAutorizada(ref, ambiente, 20000);
  if (!isNfeAutorizada(consulta?.status as string | undefined)) {
    throw new Error(`NF-e ainda não autorizada (${String(consulta?.status || "processando")}).`);
  }
  const buffer = await baixarPdfNfeFocus(ref, ambiente);
  const nome = `NFe-${nota.Numero || nota.Id}.pdf`;
  return { buffer, nome };
}

export async function obterXmlNotaFiscal(notaId: number) {
  const { nota, ambiente, ref } = await getNotaFiscalParaDownload(notaId);
  const consulta = await aguardarNfeAutorizada(ref, ambiente, 20000);
  if (!isNfeAutorizada(consulta?.status as string | undefined)) {
    throw new Error(`NF-e ainda não autorizada (${String(consulta?.status || "processando")}).`);
  }
  const xml = await baixarXmlNfeFocus(ref, ambiente);
  const nome = `NFe-${nota.Numero || nota.Id}.xml`;
  return { xml, nome };
}
