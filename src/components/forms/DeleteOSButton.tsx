"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteOrdemServico } from "@/actions/ordensServico";

export function DeleteOSButton({ id, numero }: { id: number; numero: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOrdemServico(id);
      setIsOpen(false);
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-1.5 text-red-500 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors" title="Excluir O.S.">
        <Trash2 className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Excluir Ordem de Serviço</h3>
              <p className="text-sm text-gray-500 mb-5">Tem certeza que deseja excluir a <strong>O.S. #{numero}</strong> permanentemente?</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setIsOpen(false)} disabled={isPending} className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors">Cancelar</button>
                <button onClick={handleDelete} disabled={isPending} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors">
                  {isPending ? "Excluindo..." : "Sim, excluir"}
                </button>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </>
  );
}
