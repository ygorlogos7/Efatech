"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";
import { deleteOrcamento } from "@/actions/orcamentos";

export function DeleteOrcamentoButton({ id, numero }: { id: number; numero: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOrcamento(id);
      setIsOpen(false);
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center justify-center w-[30px] h-[30px] bg-[#dd4b39] hover:bg-[#c23321] text-white rounded-[3px] transition-colors shadow-sm" 
        title="Excluir Orçamento"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-mono italic">Excluir Orçamento</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">Tem certeza que deseja apagar o **Orçamento #{numero}**? Esta ação não pode ser desfeita.</p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setIsOpen(false)} 
                  disabled={isPending} 
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-md transition-all text-sm uppercase tracking-wide"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={isPending} 
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-all text-sm uppercase tracking-wide shadow-md"
                >
                  {isPending ? "Apagando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
