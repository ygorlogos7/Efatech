"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Home, 
  Trash2, 
  Calendar, 
  Check, 
  X,
  FileEdit,
  Banknote,
  Minus,
  ChevronDown
} from "lucide-react";
import { getFuncionarios } from "@/actions/funcionarios";
import { getFormasPagamento, getPlanoContas } from "@/actions/financeiro";
import { abrirCaixa } from "@/actions/caixa";
import { useNotification } from "@/hooks/use-notification";

export default function AbrirCaixaPage() {
  const router = useRouter();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [isPending, startTransition] = useTransition();

  // Data
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [formasPgto, setFormasPgto] = useState<any[]>([]);

  // Form State
  const [gerarRecebimento, setGerarRecebimento] = useState(true);
  const [formData, setFormData] = useState({
    funcionarioId: "",
    valorAbertura: "0,00",
    descricao: "Abertura de caixa",
    formaPgtoId: "",
    vencimento: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    const loadData = async () => {
      const respFunc = await getFuncionarios();
      if (respFunc.success) setFuncionarios(respFunc.data || []);

      const respPgto = await getFormasPagamento();
      if (respPgto.success) setFormasPgto(respPgto.data || []);


    };
    loadData();
  }, []);

  const handleOpen = () => {
    if (!formData.funcionarioId) {
        notifyError("Selecione um funcionário.");
        return;
    }

    startTransition(async () => {
        const cleanValue = formData.valorAbertura.replace(/\./g, "").replace(",", ".");
        const numericValue = parseFloat(cleanValue);

        const data = new FormData();
        data.append("funcionarioId", formData.funcionarioId);
        data.append("valorAbertura", numericValue.toString());
        data.append("gerarRecebimento", gerarRecebimento.toString());
        
        if (gerarRecebimento) {
            data.append("descricao", formData.descricao);
            data.append("formaPgtoId", formData.formaPgtoId);

            data.append("vencimento", formData.vencimento);
        }

        const res = await abrirCaixa(data);
        if (res.success) {
            notifySuccess("Caixa aberto com sucesso!");
            router.push("/vendas/balcao");
        } else {
            notifyError(res.error || "Ocorreu um erro ao abrir o caixa.");
        }
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-10">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-4 mb-2">
        <h1 className="text-[20px] font-normal text-gray-800">Abrir caixa</h1>
        
        {/* Top Right Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[12px] font-normal text-gray-500 mt-2 sm:mt-0">
          <Home className="w-3.5 h-3.5" />
          <span className="hover:text-blue-500 cursor-pointer">Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-blue-500 cursor-pointer">Caixas</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">Abrir caixa</span>
        </div>
      </div>

      <div className="px-4 space-y-5">
        
        {/* Card 1: Dados gerais */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-4 py-2.5 border-b border-gray-200 bg-white flex items-center gap-2">
            <div className="p-1 border border-gray-300 rounded text-gray-700 bg-gray-50">
              <FileEdit className="w-4 h-4" />
            </div>
            <h2 className="text-[14px] font-bold text-gray-700">Dados gerais</h2>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
              {/* Funcionário */}
              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Funcionário<span className="text-red-500 ml-0.5">*</span></label>
                <div className="relative">
                  <select 
                    value={formData.funcionarioId}
                    onChange={(e) => setFormData({...formData, funcionarioId: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded px-3 text-[13px] bg-white outline-none focus:border-blue-400 transition-colors appearance-none text-gray-600"
                  >
                    <option value="">Selecione</option>
                    {funcionarios.map(f => (
                      <option key={f.Id} value={f.Id}>{f.Nome}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Valor da Abertura */}
              <div className="flex flex-col items-end">
                <label className="w-full text-[13px] font-bold text-gray-800 mb-1.5 text-right">Valor da abertura</label>
                <div className="w-full sm:w-[220px]">
                    <input 
                      type="text" 
                      value={formData.valorAbertura}
                      onChange={(e) => setFormData({...formData, valorAbertura: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded px-3 text-[13px] text-right bg-[#f9f9f9] outline-none focus:border-blue-400 transition-colors text-gray-500 font-medium"
                      placeholder="0,00"
                    />
                </div>
              </div>

              {/* Gerar Recebimento */}
              <div className="md:col-span-2 mt-2">
                <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Gerar um recebimento no financeiro</label>
                <div className="relative w-full max-w-[500px]">
                  <select 
                    value={gerarRecebimento ? "Sim" : "Não"}
                    onChange={(e) => setGerarRecebimento(e.target.value === "Sim")}
                    className="w-full h-10 border border-gray-300 rounded px-3 text-[13px] bg-white outline-none focus:border-blue-400 transition-colors appearance-none text-gray-600"
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Dados Financeiros (Conditional) */}
        {gerarRecebimento && (
          <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Card Header */}
            <div className="px-4 py-2.5 border-b border-gray-200 bg-white flex items-center gap-2">
              <div className="p-1 border border-gray-300 rounded text-gray-700 bg-gray-50">
                <Banknote className="w-4 h-4" />
              </div>
              <h2 className="text-[14px] font-bold text-gray-700">Dados Financeiros</h2>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Descrição */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Descrição do recebimento<span className="text-red-500 ml-0.5">*</span></label>
                  <input 
                    type="text" 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded px-3 text-[13px] bg-white outline-none focus:border-blue-400 transition-colors text-gray-600"
                  />
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Forma de pagamento<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select 
                        value={formData.formaPgtoId}
                        onChange={(e) => setFormData({...formData, formaPgtoId: e.target.value})}
                        className="w-full h-10 border border-gray-300 rounded px-3 text-[13px] bg-white outline-none focus:border-blue-400 transition-colors appearance-none text-gray-600"
                      >
                        <option value="">Selecione</option>
                        {formasPgto.map(f => (
                          <option key={f.Id} value={f.Id}>{f.Nome}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>



                {/* Vencimento */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Vencimento<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={formData.vencimento}
                      onChange={(e) => setFormData({...formData, vencimento: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded px-3 text-[13px] bg-white outline-none focus:border-blue-400 transition-colors text-gray-600 pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none border border-gray-200 bg-white p-0.5 rounded shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 pb-10">
          <button 
            onClick={handleOpen}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-[#28a745] hover:bg-green-700 text-white font-normal px-4 h-9 rounded text-[13px] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : <Check className="w-4 h-4" />}
            Abrir caixa
          </button>
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 bg-[#dc3545] hover:bg-red-700 text-white font-normal px-4 h-9 rounded text-[13px] shadow-sm transition-all active:scale-[0.98]"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
