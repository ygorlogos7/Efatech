"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/providers/SidebarProvider";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Home,
  Users,
  Package,
  Wrench,
  FileText,
  ClipboardList,
  ShoppingBasket,
  Box,
  DollarSign,
  Receipt,
  FileSignature,
  ChevronDown,
  Smartphone,
  MessageSquare,
  LineChart,
  Settings,
  Building2,
  Briefcase,
  Truck,
  Copy,
  MapPin,
  Tag,
  HandCoins,
  Network,
  FlaskConical,
  GitBranch,
  Barcode,
  Megaphone,
  Scale,
  ArrowLeftRight,
  RotateCcw,
  ShoppingCart,
  Layers,
  BarChart2,
  Landmark,
  CreditCard,
  TreePine,
  RefreshCw,
  Percent,
  Upload,
  Download,
  Banknote,
  PiggyBank,
  LayoutGrid,
  Code,
  Award,
  UserPlus,
  Mail,
  List,
  Headset,
  History,
  Star,
  User,
  Image,
  Store
} from "lucide-react";

// Utility function to merge tailwind classes safely
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Removing isExpanded from here to manage purely in component state
const MENU_ITEMS = [
  { href: "/home", label: "Início", icon: Home },
  { 
    id: "cadastros",
    href: "#", 
    label: "Cadastros", 
    icon: Users, 
    hasSubmenu: true,
    subItems: [
      { href: "/cadastros/clientes", label: "Clientes", icon: Users },
      { href: "/cadastros/fornecedores", label: "Fornecedores", icon: Building2 },
      { href: "/cadastros/funcionarios", label: "Funcionários", icon: Briefcase },
      { href: "/cadastros/transportadoras", label: "Transportadoras", icon: Truck },
      { 
        id: "opcoes_auxiliares",
        href: "#", 
        label: "Opções auxiliares", 
        icon: Copy, 
        hasSubmenu: true,
        subItems: [
          { href: "/cadastros/opcoes/tipos-contato", label: "Tipos de contatos", icon: Smartphone },
          { href: "/cadastros/opcoes/tipos-endereco", label: "Tipos de endereços", icon: MapPin },
          { href: "/cadastros/opcoes/campos-extras", label: "Campos extras", icon: FileText },
        ]
      },
    ]
  },
  { 
    id: "produtos",
    href: "#", 
    label: "Produtos", 
    icon: Barcode, 
    hasSubmenu: true,
    subItems: [
      { href: "/produtos", label: "Gerenciar produtos", icon: Box },
      { href: "/produtos/valores-venda", label: "Valores de venda", icon: HandCoins },
      { href: "/produtos/etiquetas", label: "Etiquetas", icon: Tag },
      { 
        id: "produtos_opcoes_auxiliares",
        href: "#", 
        label: "Opções auxiliares", 
        icon: Copy, 
        hasSubmenu: true,
        subItems: [
          { href: "/produtos/opcoes/grupos", label: "Grupos de produtos", icon: Network },
          { href: "/produtos/opcoes/unidades", label: "Unidades de produtos", icon: FlaskConical },
          { href: "/produtos/opcoes/grades", label: "Grades/variações", icon: GitBranch },
          { href: "/produtos/opcoes/campos-extras", label: "Campos extras", icon: FileText },
        ]
      },
    ]
  },
  { 
    id: "servicos",
    href: "#", 
    label: "Serviços", 
    icon: Wrench, 
    hasSubmenu: true,
    subItems: [
      { href: "/servicos", label: "Gerenciar serviços", icon: Wrench },
    ]
  },
  { 
    id: "orcamentos",
    href: "#", 
    label: "Orçamentos", 
    icon: FileText, 
    hasSubmenu: true,
    subItems: [
      { href: "/orcamentos/produtos", label: "Produtos", icon: Box },
      { href: "/orcamentos/servicos", label: "Serviços", icon: Wrench },
      { 
        id: "orcamentos_opcoes",
        href: "#", 
        label: "Opções auxiliares", 
        icon: Copy, 
        hasSubmenu: true,
        subItems: [
          { href: "/orcamentos/opcoes/situacoes", label: "Situações", icon: ClipboardList },
          { href: "/orcamentos/opcoes/campos-extras", label: "Campos extras", icon: FileText },
          { href: "/orcamentos/opcoes/modelos-email", label: "Modelos de e-mail", icon: Receipt },
          { href: "/orcamentos/opcoes/configuracoes", label: "Configurações", icon: Settings },
        ]
      },
    ]
  },
  { 
    id: "ordens_servico",
    href: "#", 
    label: "Ordens de serviços", 
    icon: ClipboardList, 
    hasSubmenu: true,
    subItems: [
      { href: "/ordens-servico", label: "Gerenciar O.S.", icon: ClipboardList },
      { href: "/ordens-servico/painel", label: "Painel", icon: LineChart },
      { 
        id: "os_opcoes",
        href: "#", 
        label: "Opções auxiliares", 
        icon: Copy, 
        hasSubmenu: true,
        subItems: [
          { href: "/ordens-servico/opcoes/situacoes", label: "Situações", icon: ClipboardList },
          { href: "/ordens-servico/opcoes/campos-extras", label: "Campos extras", icon: FileText },
          { href: "/ordens-servico/opcoes/modelos-email", label: "Modelos de e-mail", icon: Receipt },
          { href: "/ordens-servico/opcoes/configuracoes", label: "Configurações", icon: Settings },
        ]
      },
    ]
  },
  { 
    id: "vendas",
    href: "#", 
    label: "Vendas", 
    icon: ShoppingBasket, 
    hasSubmenu: true,
    subItems: [
      { href: "/vendas/produtos", label: "Produtos", icon: Box },
      { href: "/vendas/balcao", label: "Balcão", icon: Package },
      { href: "/vendas/servicos", label: "Serviços", icon: Wrench },
      { 
        id: "vendas_opcoes",
        href: "#", 
        label: "Opções auxiliares", 
        icon: Copy, 
        hasSubmenu: true,
        subItems: [
          { href: "/vendas/opcoes/situacoes", label: "Situações", icon: ClipboardList },
          { href: "/vendas/opcoes/canais", label: "Canais", icon: Megaphone },
          { href: "/vendas/opcoes/campos-extras", label: "Campos extras", icon: FileText },
          { href: "/vendas/opcoes/modelos-email", label: "Modelos de e-mail", icon: Receipt },
          { href: "/vendas/opcoes/balancas", label: "Balanças", icon: Scale },
          { href: "/vendas/opcoes/configuracoes", label: "Configurações", icon: Settings },
        ]
      },
    ]
  },
  {
    id: "estoque",
    href: "#",
    label: "Estoque",
    icon: Box,
    hasSubmenu: true,
    subItems: [
      { href: "/estoque/movimentacoes", label: "Movimentações", icon: Package },
      { href: "/estoque/ajustes", label: "Ajustes", icon: Settings },
      { href: "/estoque/transferencias", label: "Transferências", icon: ArrowLeftRight },
      { href: "/estoque/cotacoes", label: "Cotações", icon: FileText },
      {
        id: "estoque_compras",
        href: "#",
        label: "Compras",
        icon: ShoppingCart,
        hasSubmenu: true,
        subItems: [
          { href: "/estoque/compras/produtos", label: "Produtos", icon: Box },
          { href: "/estoque/compras/servicos", label: "Serviços", icon: Wrench },
        ]
      },
      { href: "/estoque/trocas-devolucoes", label: "Trocas e devoluções", icon: RotateCcw },
      {
        id: "estoque_opcoes",
        href: "#",
        label: "Opções auxiliares",
        icon: Copy,
        hasSubmenu: true,
        subItems: [
          { href: "/estoque/opcoes/situacoes", label: "Situações", icon: ClipboardList },
          { href: "/estoque/opcoes/locais", label: "Locais de estoque", icon: MapPin },
          { href: "/estoque/opcoes/campos-extras", label: "Campos extras", icon: FileText },
        ]
      },
    ]
  },
  {
    id: "financeiro",
    href: "#",
    label: "Financeiro",
    icon: DollarSign,
    hasSubmenu: true,
    subItems: [
      { href: "/financeiro/contas-pagar", label: "Contas a pagar", icon: Banknote },
      { href: "/financeiro/contas-receber", label: "Contas a receber", icon: HandCoins },
      { href: "/financeiro/dre", label: "DRE gerencial", icon: BarChart2 },
      { href: "/financeiro/fluxo-caixa", label: "Fluxo de caixa", icon: LineChart },
      {
        id: "financeiro_boletos",
        href: "#",
        label: "Boletos bancários",
        icon: Barcode,
        hasSubmenu: true,
        subItems: [
          { href: "/financeiro/boletos", label: "Gerenciar boletos", icon: Barcode },
          { href: "/financeiro/boletos/exportar-remessa", label: "Exportar remessa", icon: Upload },
          { href: "/financeiro/boletos/importar-retorno", label: "Importar retorno", icon: Download },
        ]
      },
      {
        id: "financeiro_opcoes",
        href: "#",
        label: "Opções auxiliares",
        icon: Copy,
        hasSubmenu: true,
        subItems: [
          { href: "/financeiro/opcoes/caixas", label: "Caixas", icon: PiggyBank },
          { href: "/financeiro/opcoes/contas-bancarias", label: "Contas bancárias", icon: Landmark },
          { href: "/financeiro/opcoes/formas-pagamento", label: "Formas de pagamento", icon: CreditCard },
          { href: "/financeiro/opcoes/plano-contas", label: "Plano de contas", icon: TreePine },
          { href: "/financeiro/opcoes/situacoes", label: "Situações", icon: ClipboardList },
          { href: "/financeiro/opcoes/centros-custo", label: "Centros de custos", icon: Network },
          { href: "/financeiro/opcoes/conciliacao", label: "Conciliação bancária", icon: RefreshCw },
          { href: "/financeiro/opcoes/transferencias", label: "Transferências", icon: ArrowLeftRight },
          { href: "/financeiro/opcoes/campos-extras", label: "Campos extras", icon: FileText },
          { href: "/financeiro/opcoes/modelos-email", label: "Modelos de e-mails", icon: Receipt },
          { href: "/financeiro/opcoes/tabelas-rateio", label: "Tabelas de rateios", icon: Percent },
          { href: "/financeiro/opcoes/configuracoes", label: "Configurações", icon: Settings },
        ]
      },
    ]
  },
  {
    id: "notas",
    href: "#",
    label: "Notas fiscais",
    icon: Receipt,
    hasSubmenu: true,
    subItems: [
      { href: "/notas/produtos", label: "Notas de produtos", icon: ShoppingCart },
      { href: "/notas/servicos", label: "Notas de serviços", icon: FileText },
      { href: "/notas/consumidor", label: "Notas do consumidor", icon: LayoutGrid },
      { href: "/notas/compras", label: "Notas de compras", icon: ShoppingBasket },
      {
        id: "notas_opcoes",
        href: "#",
        label: "Opções auxiliares",
        icon: Copy,
        hasSubmenu: true,
        subItems: [
          { href: "/notas/opcoes/importar-xml", label: "Importar XML", icon: Code },
          { href: "/notas/opcoes/certificado", label: "Certificado digital", icon: Award },
          { href: "/notas/opcoes/naturezas", label: "Naturezas de operações", icon: ArrowLeftRight },
          { href: "/notas/opcoes/tributacoes", label: "Tributações", icon: Banknote },
          { href: "/notas/opcoes/atividades", label: "Atividades de serviços", icon: Wrench },
          { href: "/notas/opcoes/modelos-email", label: "Modelos de e-mails", icon: Mail },
          { href: "/notas/opcoes/intermediadores", label: "Intermediadores", icon: UserPlus },
          { href: "/notas/opcoes/configuracoes", label: "Configurações", icon: Settings },
        ]
      },
    ]
  },
  {
    id: "contratos",
    href: "#",
    label: "Contratos",
    icon: FileSignature,
    hasSubmenu: true,
    subItems: [
      { href: "/contratos/servicos", label: "Serviços", icon: Wrench },
      { href: "/contratos/locacoes", label: "Locações", icon: ArrowLeftRight },
      { href: "/contratos/assinaturas", label: "Assinaturas", icon: RefreshCw },
      {
        id: "contratos_opcoes",
        href: "#",
        label: "Opções auxiliares",
        icon: Copy,
        hasSubmenu: true,
        subItems: [
          { href: "/contratos/opcoes/situacoes-contratos", label: "Situações de contratos", icon: List },
          { href: "/contratos/opcoes/situacoes-locacoes", label: "Situações de locações", icon: List },
          { href: "/contratos/opcoes/campos-extras", label: "Campos extras", icon: FileText },
          { href: "/contratos/opcoes/configuracoes", label: "Configurações", icon: Settings },
        ]
      },
    ]
  },
  {
    id: "atendimentos",
    href: "#",
    label: "Atendimentos",
    icon: MessageSquare,
    hasSubmenu: true,
    subItems: [
      { href: "/atendimentos/central", label: "Central de atendimentos", icon: Headset },
      { href: "/atendimentos/historico", label: "Histórico", icon: History },
      {
        id: "atendimentos_opcoes",
        href: "#",
        label: "Opções auxiliares",
        icon: Copy,
        hasSubmenu: true,
        subItems: [
          { href: "/atendimentos/opcoes/categorias", label: "Categorias", icon: List },
          { href: "/atendimentos/opcoes/canais", label: "Canais", icon: MessageSquare },
          { href: "/atendimentos/opcoes/situacoes", label: "Situações", icon: List },
          { href: "/atendimentos/opcoes/campos-extras", label: "Campos extras", icon: FileText },
          { href: "/atendimentos/opcoes/configuracoes", label: "Configurações", icon: Settings },
        ]
      },
    ]
  },
  {
    id: "relatorios",
    href: "#",
    label: "Relatórios",
    icon: LineChart,
    hasSubmenu: true,
    subItems: [
      { href: "/relatorios/cadastros", label: "Cadastros", icon: List },
      { href: "/relatorios/vendas", label: "Vendas", icon: ShoppingBasket },
      { href: "/relatorios/ordens-servico", label: "Ordens de serviços", icon: Wrench },
      { href: "/relatorios/estoque", label: "Estoque", icon: Box },
      { href: "/relatorios/financeiro", label: "Financeiro", icon: DollarSign },
      { href: "/relatorios/contratos", label: "Contratos", icon: FileSignature },
      { href: "/relatorios/notas-fiscais", label: "Notas fiscais", icon: Receipt },
      { href: "/relatorios/logs", label: "Logs do sistema", icon: ClipboardList },
    ]
  },
  {
    id: "configuracoes",
    href: "#",
    label: "Configurações",
    icon: Settings,
    hasSubmenu: true,
    subItems: [
      { href: "/configuracoes/gerais", label: "Gerais", icon: Settings },
      { href: "/configuracoes/plano", label: "Meu plano", icon: Star },
      { href: "/configuracoes/usuarios", label: "Usuários", icon: User },
      { href: "/configuracoes/dados-empresa", label: "Dados da empresa", icon: Briefcase },
      { href: "/configuracoes/marca", label: "Marca da empresa", icon: Image },
      { href: "/configuracoes/empresas", label: "Empresas / Lojas", icon: Store },
      { href: "/configuracoes/certificado", label: "Certificado digital", icon: Award },
      { href: "/configuracoes/modelos-email", label: "Modelos de e-mails", icon: Mail },
      { href: "/configuracoes/avisos-email", label: "Avisos por e-mail", icon: Megaphone },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();
  // Store multiple open menus using their IDs
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggleMenu = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full shadow-sm shrink-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-64 translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 pointer-events-none"
    )}>
      {/* Sidebar specific top box */}
      <div className="h-[70px] bg-[#1a1c23] flex items-center justify-center p-4 m-3 rounded-md shadow-md gap-3">
        <Smartphone className="text-[var(--color-primary-green)] w-6 h-6" />
        <span className="text-white font-bold text-lg tracking-wide">Efatech</span>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1">
        {MENU_ITEMS.map((item, index) => {
          const isActive = pathname === item.href;
          const isExpanded = item.id ? !!expandedKeys[item.id] : false;

          return (
            <div key={index} className="px-3">
              <Link
                href={item.href}
                onClick={item.hasSubmenu && item.id ? (e) => toggleMenu(item.id as string, e) : undefined}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-md text-sm transition-colors group",
                  isActive
                    ? "text-[#38b473] bg-green-50/50 font-medium"
                    : (isExpanded ? "text-[#38b473] font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px]",
                      (isActive || isExpanded) ? "text-[#38b473]" : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded ? "rotate-180 text-[#38b473]" : "text-gray-400"
                  )} />
                )}
              </Link>

              {/* Mapeando os subitens Nível 1 */}
              {isExpanded && item.subItems && (
                <div className="ml-10 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-2">
                  {item.subItems.map((sub, sx) => {
                    const isSubActive = pathname === sub.href;
                    const isSubExpanded = sub.id ? !!expandedKeys[sub.id] : false;
                    
                    return (
                      <div key={sx}>
                        <Link 
                          href={sub.href}
                          onClick={sub.hasSubmenu && sub.id ? (e) => toggleMenu(sub.id as string, e) : undefined}
                          className={cn(
                            "flex items-center gap-3 py-2.5 px-3 rounded-md text-[13px] transition-colors",
                            isSubActive 
                              ? "text-[#38b473] font-medium" 
                              : (isSubExpanded ? "text-[#38b473]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900")
                          )}
                        >
                          <sub.icon className={cn("w-4 h-4", (isSubActive || isSubExpanded) ? "text-[#38b473]" : "text-gray-400")} />
                          <span className="flex-1 cursor-pointer">{sub.label}</span>
                          {sub.hasSubmenu && <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSubExpanded ? "rotate-180 text-[#38b473]" : "text-gray-400")} />}
                        </Link>

                        {/* Mapeando subitens Nível 2 (Opções Auxiliares) */}
                        {isSubExpanded && sub.subItems && (
                          <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-2">
                             {sub.subItems.map((child, cx) => {
                               const isChildActive = pathname === child.href;
                               return (
                                 <Link 
                                  key={cx} href={child.href}
                                  className={cn(
                                    "flex items-center gap-2 py-2 px-2 rounded-md text-[12px] transition-colors",
                                    isChildActive 
                                      ? "text-gray-900 bg-gray-50 font-medium" 
                                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                  )}
                                 >
                                   <child.icon className={cn("w-3.5 h-3.5", isChildActive ? "text-gray-700" : "text-gray-400")} />
                                   <span>{child.label}</span>
                                 </Link>
                               )
                             })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
