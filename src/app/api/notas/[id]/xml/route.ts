import { auth } from "@/auth";
import { obterXmlNotaFiscal } from "@/lib/focus-nfe/notas-arquivos";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const notaId = Number(id);
  if (!notaId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const { xml, nome } = await obterXmlNotaFiscal(notaId);
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nome}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Falha ao baixar XML." },
      { status: 500 },
    );
  }
}
