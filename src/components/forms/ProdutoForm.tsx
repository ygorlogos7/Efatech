"use client";

import React, { useTransition } from "react";
import { createProduto, updateProduto } from "@/actions/produtos";
import { Edit, Package, Check, X, DollarSign, Box } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";

interface ProdutoFormProps {
  initialData?: any;
  isReadOnly?: boolean;
  isClone?: boolean;
}

export function ProdutoForm({ initialData, isReadOnly = false, isClone = false }: ProdutoFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();

  const isEdit = !!initialData && !isReadOnly && !isClone;
  
  const [barcode, setBarcode] = React.useState(initialData?.Cod_CodigoBarras || "");

  const generateBarcode = () => {
    // Gerar um código de barras aleatório de 13 dígitos
    const random = Math.floor(Math.random() * 9000000000000) + 1000000000000;
    setBarcode(random.toString());
  };

  const handleSubmit = (formData: FormData) => {
    // Se estiver editando, o campo desabilitado não vai no formData, então adicionamos manualmente se necessário
    // Mas o formulário já tem o hidden input se estiver editando.
    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateProduto(initialData.Id, formData);
      } else {
        r = await createProduto(formData);
      }

      if (r?.success === false) {
        error(r.error || "Ocorreu um erro ao salvar o produto.", "Falha na Operação");
      } else {
        success(isEdit ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!", "Operação Concluída");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">Dados do Produto</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Situação</label>
            <select name="Ativo" defaultValue={initialData ? (initialData.Ativo ? "true" : "false") : "true"} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Produto *</label>
            <input type="text" name="Cod_Nome" defaultValue={initialData?.Cod_Nome} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Código de Barras *</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name={isEdit ? "" : "Cod_CodigoBarras"} 
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                disabled={isReadOnly || isEdit} 
                required 
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" 
              />
              {isEdit && <input type="hidden" name="Cod_CodigoBarras" value={barcode} />}
              {!isEdit && !isReadOnly && (
                <button 
                  type="button" 
                  onClick={generateBarcode}
                  className="bg-gray-800 hover:bg-black text-white text-[10px] font-bold px-3 py-1 rounded transition-colors uppercase whitespace-nowrap"
                >
                  Gerar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Precificação</h3>
          </div>
          <div className="p-5">
            <label className="block text-xs font-bold text-gray-700 mb-1">Preço (R$) *</label>
            <input type="number" step="0.01" name="Cod_Preco" defaultValue={initialData?.Cod_Preco} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Box className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800 text-sm">Estoque</h3>
          </div>
          <div className="p-5">
            <label className="block text-xs font-bold text-gray-700 mb-1">Quantidade em Estoque *</label>
            <input type="number" step="1" name="Cod_Estoque" defaultValue={initialData?.Cod_Estoque || 0} disabled={isReadOnly} required className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <button type="submit" disabled={isPending} className="flex items-center gap-1.5 bg-[#00a65a] hover:bg-green-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors disabled:opacity-50">
            <Check className="w-4 h-4" />
            {isPending ? "Salvando..." : (isEdit ? "Salvar Alterações" : (isClone ? "Criar Cópia" : "Cadastrar Produto"))}
          </button>
          <Link href="/produtos" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>
      )}
      
      {isReadOnly && (
        <div className="flex gap-3 pt-2 pb-10">
          <Link href={`/produtos/edit/${initialData.Id}`} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <Edit className="w-4 h-4" />
            Editar Produto
          </Link>
          <Link href="/produtos" className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded shadow-sm text-sm transition-colors">
            <X className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      )}
    </form>
  );
}
