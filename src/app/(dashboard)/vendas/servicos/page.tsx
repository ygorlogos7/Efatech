import { VendasListPage } from "@/components/vendas/VendasListPage";

export default async function VendasServicosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  return <VendasListPage tipo="servicos" title="Vendas — Serviços" page={page} />;
}
