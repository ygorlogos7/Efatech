export const dynamic = "force-dynamic";

import { VendasListPage } from "@/components/vendas/VendasListPage";

export default async function VendasBalcaoPage({ searchParams }: { searchParams: Promise<{ page?: string; pesquisa?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const pesquisa = resolvedParams?.pesquisa || "";
  return <VendasListPage tipo="balcao" title="Vendas — Balcão" page={page} pesquisa={pesquisa} />;
}
