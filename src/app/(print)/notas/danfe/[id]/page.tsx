import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notaId = Number(id);
  const nota = Number.isFinite(notaId)
    ? await prisma.notaFiscal.findUnique({
        where: { Id: notaId },
        select: { Numero: true },
      })
    : null;
  const numero = nota?.Numero ?? notaId;

  return {
    title: { absolute: `NFE-${numero}` },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
      apple: "/icon.svg",
    },
  };
}

export default async function DanfeViewerPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const notaId = Number(id);
  if (!notaId) {
    redirect("/notas/produtos");
  }

  const nota = await prisma.notaFiscal.findUnique({
    where: { Id: notaId },
    select: { Numero: true, FocusRef: true, Status: true },
  });

  if (!nota?.FocusRef) {
    redirect("/notas/produtos");
  }

  const numero = nota.Numero ?? notaId;

  return (
    <iframe
      src={`/api/notas/${notaId}/danfe`}
      title={`DANFE NFE-${numero}`}
      className="fixed inset-0 w-full h-full border-0 bg-white"
    />
  );
}
