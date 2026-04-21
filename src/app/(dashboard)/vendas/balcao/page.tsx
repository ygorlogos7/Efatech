import { VendasListPage } from "@/components/vendas/VendasListPage";

export default async function VendasBalcaoPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  return <VendasListPage tipo="balcao" title="Vendas — Balcão" page={page} />;
}
