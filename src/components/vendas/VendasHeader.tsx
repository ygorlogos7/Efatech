"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, ChevronDown, Download, FileSpreadsheet, PlusCircle, LayoutGrid, List, Home, Search, Calendar, Lock } from "lucide-react";
import { getCaixaAberto } from "@/actions/caixa";
import { CashierModal } from "./CashierModal";
import { MoreActionsDropdown } from "@/components/common/MoreActionsDropdown";
import { useRouter } from "next/navigation";
import { CloseCashierModal } from "./CloseCashierModal";
import Link from "next/link";
import { downloadCsv } from "@/lib/exportUtils";
import { useNotification } from "@/hooks/use-notification";

interface VendasHeaderProps {
  tipo: "produtos" | "balcao" | "servicos";
  title: string;
  items: any[];
}

export function VendasHeader({ tipo, title, items }: VendasHeaderProps) {
  const router = useRouter();
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [caixaAtivo, setCaixaAtivo] = useState<any>(null);

  // Carregar status do caixa ao entrar na tela
  const checkCaixa = async () => {
    const res = await getCaixaAberto();
    if (res.success) {
      setCaixaAtivo(res.data);
    }
  };

  React.useEffect(() => {
    checkCaixa();
    
    // Refresh status when window gains focus
    window.addEventListener("focus", checkCaixa);
    
    // Periodically check every 10 seconds
    const interval = setInterval(checkCaixa, 10000);
    
    return () => {
      window.removeEventListener("focus", checkCaixa);
      clearInterval(interval);
    };
  }, []);

  const handleVenderClick = async () => {
    setIsPending(true);
    try {
      const res = await getCaixaAberto();
      if (res.success && res.data) {
        setCaixaAtivo(res.data);
        if (!caixaAtivo) {
          success("O caixa já estava aberto em outra tela. Redirecionando...");
        }
        const destination = tipo === "balcao" ? `/pdv/balcao` : `/vendas/${tipo}/create`;
        router.push(destination);
      } else {
        setCaixaAtivo(null);
        setIsCashierModalOpen(true);
      }
    } catch (err: any) {
      console.error("Erro ao verificar caixa:", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleExportExcel = () => {
    if (!items || items.length === 0) return;
    
    const columns = [
      { header: 'Venda Nº', key: 'Numero' },
      { header: 'Data', key: 'DataVenda' },
      { header: 'Produtos', key: 'TotalProdutos' },
      { header: 'Serviços', key: 'TotalServicos' },
      { header: 'Desconto', key: 'Desconto' },
      { header: 'Valor', key: 'Total' },
      { header: 'Status', key: 'Ativo' },
    ];
    
    const rows = items.map(item => ({
      Numero: item.Numero,
      DataVenda: new Date(item.DataVenda).toLocaleDateString('pt-BR'),
      TotalProdutos: item.TotalProdutos.toFixed(2).replace('.', ','),
      TotalServicos: item.TotalServicos.toFixed(2).replace('.', ','),
      Desconto: item.Desconto.toFixed(2).replace('.', ','),
      Total: item.Total.toFixed(2).replace('.', ','),
      Ativo: item.Ativo ? 'Concluída' : 'Cancelada',
    }));
    
    downloadCsv(`vendas_${tipo}.csv`, rows, columns);
  };

  const breadcrumbLabel = tipo === "balcao" ? "Venda Balcão" : tipo === "produtos" ? "Vendas — Produtos" : "Vendas — Serviços";

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-gray-900 font-bold text-xl sm:text-2xl mb-0">{title}</h2>
            <div className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5">
              <Home className="w-2.5 h-2.5" />
              <Link href="/home" className="hover:underline">Início</Link>
              <span>&gt;</span>
              <span>{breadcrumbLabel}</span>
            </div>
          </div>
          
          {caixaAtivo && (
            <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1.5 border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              CAIXA ABERTO (# {caixaAtivo.Id})
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
          {/* Barra de Pesquisa */}
          <form method="get" className="m-0">
            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden px-3 py-1 focus-within:ring-1 focus-within:ring-green-500 transition-all shadow-sm">
              <button type="submit" className="p-0 border-none bg-transparent">
                <Search className="w-4 h-4 text-gray-400 mr-2 cursor-pointer hover:text-green-500 transition-colors" />
              </button>
              <input
                type="text"
                name="pesquisa"
                defaultValue={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('pesquisa') || '' : ''}
                className="outline-none text-sm w-[180px] sm:w-[220px] text-gray-700 py-1"
                placeholder="Buscar por Venda ou Cliente..."
              />
            </div>
          </form>

          {/* Advanced Search */}
          <button className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded shadow-sm transition-colors">
            <Search className="w-3.5 h-3.5" />
            Busca avançada
          </button>

          {/* Date Selector */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {new Date().toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Botão Vender Principal */}
          <button 
            onClick={handleVenderClick}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {caixaAtivo ? "VENDER" : "ABRIR CAIXA E VENDER"}
          </button>

          {/* Botão Fechar Caixa */}
          {caixaAtivo && (
            <button 
              onClick={() => setIsCloseModalOpen(true)}
              className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-4 py-1.5 rounded shadow-sm transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              FECHAR CAIXA
            </button>
          )}

          <MoreActionsDropdown 
            actions={[
              { label: "Importar vendas", icon: <PlusCircle className="w-4 h-4" /> },
              { label: "Exportar para Excel", icon: <List className="w-4 h-4" />, onClick: handleExportExcel },
            ]}
          />
        </div>
      </div>

      {/* Modals & Overlays */}
      <CashierModal 
        isOpen={isCashierModalOpen} 
        onClose={() => setIsCashierModalOpen(false)} 
        onSuccess={() => {
          setIsCashierModalOpen(false);
          checkCaixa();
          // Após abrir, tenta redirecionar para a venda novamente
          const destination = tipo === "balcao" ? `/pdv/balcao` : `/vendas/${tipo}/create`;
          router.push(destination);
        }} 
      />

      {caixaAtivo && (
        <CloseCashierModal 
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            caixaId={caixaAtivo.Id}
            onSuccess={() => {
                checkCaixa();
                router.push(`/vendas/${tipo}`);
            }}
        />
      )}
    </>
  );
}
