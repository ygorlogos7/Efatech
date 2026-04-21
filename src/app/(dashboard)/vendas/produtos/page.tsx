import { VendasListPage } from "@/components/vendas/VendasListPage";

export default async function VendasProdutosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  return <VendasListPage tipo="produtos" title="Vendas — Produtos" page={page} />;
}
