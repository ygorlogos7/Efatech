"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/home": "Inicio",
  "/cadastros/clientes": "Clientes",
  "/cadastros/fornecedores": "Fornecedores",
  "/cadastros/funcionarios": "Funcionarios",
  "/cadastros/transportadoras": "Transportadoras",
  "/produtos": "Produtos",
  "/produtos/create": "Novo Produto",
  "/produtos/valores-venda": "Valores de Venda",
  "/produtos/etiquetas": "Etiquetas",
  "/produtos/import": "Importar Produtos",
  "/servicos": "Servicos",
  "/servicos/create": "Novo Servico",
  "/orcamentos/produtos": "Orcamentos Produtos",
  "/orcamentos/servicos": "Orcamentos Servicos",
  "/ordens-servico": "Ordens de Servico",
  "/vendas/produtos": "Vendas Produtos",
  "/vendas/servicos": "Vendas Servicos",
  "/vendas/balcao": "Vendas Balcao",
  "/estoque/movimentacoes": "Estoque - Movimentacoes",
  "/estoque/ajustes": "Estoque - Ajustes",
  "/estoque/compras/produtos": "Compras Produtos",
  "/estoque/compras/servicos": "Compras Servicos",
  "/estoque/trocas-devolucoes": "Trocas e Devolucoes",
  "/financeiro/contas-pagar": "Contas a Pagar",
  "/financeiro/contas-receber": "Contas a Receber",
  "/financeiro/fluxo-caixa": "Fluxo de Caixa",
  "/financeiro/caixas": "Caixas",
  "/financeiro/contas-bancarias": "Contas Bancarias",
  "/financeiro/transferencias": "Transferencias",
  "/financeiro/boletos": "Boletos",
  "/notas/produtos": "Notas Fiscais (NFe)",
  "/notas/servicos": "Notas de Servico (NFSe)",
  "/notas/consumidor": "Nota Consumidor (NFCe)",
  "/notas/compras": "Notas de Compra",
  "/atendimentos/central": "Central de Atendimentos",
  "/relatorios/vendas": "Relatorios - Vendas",
  "/relatorios/estoque": "Relatorios - Estoque",
  "/relatorios/financeiro": "Relatorios - Financeiro",
  "/relatorios/cadastros": "Relatorios - Cadastros",
  "/relatorios/ordens-servico": "Relatorios - Ordens de Servico",
  "/relatorios/notas-fiscais": "Relatorios - Notas Fiscais",
  "/relatorios/logs": "Relatorios - Logs",
  "/configuracoes/dados-empresa": "Dados da Empresa",
  "/configuracoes/usuarios": "Usuarios",
  "/configuracoes/gerais": "Configuracoes Gerais",
  "/configuracoes/plano": "Plano",
  "/configuracoes/empresas": "Empresas",
  "/configuracoes/certificado": "Certificado Digital",
};

function getTitle(pathname: string): string {
  // Exact match
  if (routeTitles[pathname]) return routeTitles[pathname];

  // Try removing trailing slash
  const clean = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (routeTitles[clean]) return routeTitles[clean];

  // Try matching closest parent path
  const segments = clean.split("/").filter(Boolean);
  for (let i = segments.length; i > 0; i--) {
    const partial = "/" + segments.slice(0, i).join("/");
    if (routeTitles[partial]) return routeTitles[partial];
  }

  // Fallback: capitalize last segment
  const lastSegment = segments[segments.length - 1];
  if (lastSegment) {
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  }

  return "";
}

export function usePageTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const title = getTitle(pathname);
    document.title = title ? `${title} | Efatech PRO` : "Efatech PRO";
  }, [pathname]);
}
