"use client";

import React, { useTransition } from "react";
import { createProduto, getProdutoFiscalDefaults, updateProduto } from "@/actions/produtos";
import { Edit, Package, Check, X, DollarSign, Box, Wand2 } from "lucide-react";
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
  const [codNcm, setCodNcm] = React.useState(initialData?.cod_ncm || "");
  const [codCfop, setCodCfop] = React.useState(initialData?.cod_cfop || "");
  const [icmsOrigem, setIcmsOrigem] = React.useState(String(initialData?.icms_origem ?? 0));
  const [icmsCstCsosn, setIcmsCstCsosn] = React.useState(initialData?.icms_cst_csosn || "");
  const [pisCst, setPisCst] = React.useState(initialData?.pis_cst || "");
  const [cofinsCst, setCofinsCst] = React.useState(initialData?.cofins_cst || "");
  const [unidadeComercial, setUnidadeComercial] = React.useState(initialData?.unidade_comercial || "UN");

  const applyFiscalDefaults = async () => {
    const res = await getProdutoFiscalDefaults();
    if (!res.success || !res.data) {
      error(res.error || "Não foi possível preencher os campos fiscais automaticamente.");
      return;
    }
    setCodCfop(res.data.cod_cfop || "");
    setIcmsOrigem(String(res.data.icms_origem ?? 0));
    setIcmsCstCsosn(res.data.icms_cst_csosn || "");
    setPisCst(res.data.pis_cst || "");
    setCofinsCst(res.data.cofins_cst || "");
    setUnidadeComercial(res.data.unidade_comercial || "UN");
    success("Campos fiscais preenchidos automaticamente.");
  };

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

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Dados Fiscais (NF-e)</h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => void applyFiscalDefaults()}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Auto preencher fiscal
            </button>
          )}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">NCM</label>
            <input type="text" name="cod_ncm" value={codNcm} onChange={(e) => setCodNcm(e.target.value)} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CFOP</label>
            <input type="text" name="cod_cfop" value={codCfop} onChange={(e) => setCodCfop(e.target.value)} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Unidade</label>
            <input type="text" name="unidade_comercial" value={unidadeComercial} onChange={(e) => setUnidadeComercial(e.target.value)} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Origem ICMS</label>
            <input type="number" name="icms_origem" value={icmsOrigem} onChange={(e) => setIcmsOrigem(e.target.value)} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CST/CSOSN ICMS</label>
            <input type="text" name="icms_cst_csosn" value={icmsCstCsosn} onChange={(e) => setIcmsCstCsosn(e.target.value)} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CST PIS</label>
            <input type="text" name="pis_cst" value={pisCst} onChange={(e) => setPisCst(e.target.value)} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CST COFINS</label>
            <input type="text" name="cofins_cst" value={cofinsCst} onChange={(e) => setCofinsCst(e.target.value)} disabled={isReadOnly} className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 disabled:bg-gray-100" />
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
