"use client";

import React, { useState } from "react";
import { PlusCircle, ShoppingBag, List, Calendar, Search, ChevronDown } from "lucide-react";
import { MoreActionsDropdown } from "@/components/common/MoreActionsDropdown";
import { CashierModal } from "./CashierModal";
import { getCaixaAberto } from "@/actions/caixa";
import { useRouter } from "next/navigation";
import { CloseCashierModal } from "./CloseCashierModal";
import { Lock } from "lucide-react";

interface VendasHeaderProps {
  tipo: "produtos" | "balcao" | "servicos";
  title: string;
  items: any[];
}

export function VendasHeader({ tipo, title }: VendasHeaderProps) {
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
    return () => window.removeEventListener("focus", checkCaixa);
  }, []);

  const handleVenderClick = async () => {
    setIsPending(true);
    try {
      const res = await getCaixaAberto();
      if (res.success && res.data) {
        setCaixaAtivo(res.data);
        router.push(`/pdv/${tipo}`);
      } else {
        setCaixaAtivo(null);
        router.push("/financeiro/caixas/abrir");
      }
    } catch (err: any) {
      console.error("Erro ao verificar caixa:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {caixaAtivo && (
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-2 border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    CAIXA ABERTO (# {caixaAtivo.Id})
                </div>
            )}
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Botão Vender Principal */}
            <button 
                onClick={handleVenderClick}
                disabled={isPending}
                className="flex items-center gap-2 bg-[#00b050] hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-md shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {caixaAtivo ? "VENDER" : "ABRIR CAIXA E VENDER"}
            </button>

            {/* Botão Fechar Caixa (Só aparece se estiver aberto) */}
            {caixaAtivo && (
                <button 
                    onClick={() => setIsCloseModalOpen(true)}
                    className="flex items-center gap-2 border-2 border-red-100 text-red-600 hover:bg-red-50 text-sm font-bold px-5 py-2.5 rounded-md transition-all active:scale-95"
                >
                    <Lock className="w-4 h-4" />
                    FECHAR CAIXA
                </button>
            )}

            {/* Mais Ações */}
            <MoreActionsDropdown 
              label="Mais ações"
              actions={[
                { label: "Importar vendas", icon: <PlusCircle className="w-4 h-4" /> },
                { label: "Exportar para Excel", icon: <List className="w-4 h-4" /> },
              ]}
            />

            {/* View Toggle */}
            <button className="p-2.5 text-gray-400 hover:text-gray-600 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
             {/* Date Selector */}
             <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
               <Calendar className="w-4 h-4 text-gray-400" />
               {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
               <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
             </button>

             {/* Advanced Search */}
             <button className="flex items-center gap-2 bg-[#0c1a25] hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-md shadow-sm transition-colors">
               <Search className="w-4 h-4" />
               Busca avançada
             </button>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <CashierModal 
        isOpen={false} 
        onClose={() => {}} 
        onSuccess={() => {}} 
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
