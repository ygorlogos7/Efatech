"use client";

import React, { useTransition, useState, useEffect } from "react";
import { createVenda, updateVenda } from "@/actions/vendas";
import { getClientes } from "@/actions/clientes";
import { getProdutos } from "@/actions/produtos";
import { getFuncionarios } from "@/actions/funcionarios";
import { getVendaCanais } from "@/actions/vendas";
import { getFormasPagamento } from "@/actions/financeiro";
import { 
  ShoppingBasket, 
  DollarSign, 
  FileText, 
  Check, 
  X, 
  Search, 
  Plus, 
  Trash2, 
  User,
  Package,
  MapPin,
  Mail,
  Smartphone,
  CreditCard,
  UserCheck,
  Calendar,
  AlertCircle,
  Truck,
  FileSearch,
  ExternalLink,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/hooks/use-notification";
import SignaturePad from "@/components/common/SignaturePad";

interface VendaFormProps {
  tipo: "produtos" | "balcao" | "servicos";
  initialData?: any;
  isReadOnly?: boolean;
}

interface VendaItem {
  ProdutoId: number;
  Nome: string;
  Quantidade: number;
  Preco: number;
  ValorTotal: number;
}

export function VendaForm({ tipo, initialData, isReadOnly = false }: VendaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();
  
  // States for dynamic form
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [canais, setCanais] = useState<any[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
  
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [selectedVendedor, setSelectedVendedor] = useState<string>(initialData?.Vendedor || "");
  const [selectedCanalId, setSelectedCanalId] = useState<number | null>(initialData?.CanalId || null);
  const [selectedFormaPagamentoId, setSelectedFormaPagamentoId] = useState<number | null>(initialData?.FormaPagamentoId || null);
  const [garantia, setGarantia] = useState<string>(initialData?.Garantia || "");
  const [items, setItems] = useState<VendaItem[]>(initialData?.Itens?.map((i: any) => ({
    ProdutoId: i.ProdutoId,
    Nome: i.Produtos?.Cod_Nome || "Produto",
    Quantidade: Number(i.Quantidade),
    Preco: Number(i.Produtos?.Cod_Preco || 0),
    ValorTotal: Number(i.ValorTotal)
  })) || []);
  const [signature, setSignature] = useState<string>(initialData?.AssinaturaCliente || "");
  const [searchProd, setSearchProd] = useState("");
  const [searchCli, setSearchCli] = useState("");

  const isEdit = !!initialData && !isReadOnly;

  // Load clients and products
  useEffect(() => {
    const loadData = async () => {
      const cliRes = await getClientes();
      if (cliRes.success) setClientes(cliRes.data || []);
      
      const prodRes = await getProdutos();
      if (prodRes.success) setProdutos(prodRes.data || []);

      const funcRes = await getFuncionarios();
      if (funcRes.success) {
        const funcs = funcRes.data || [];
        setFuncionarios(funcs);
        if (!initialData?.Vendedor && funcs.length > 0) {
          setSelectedVendedor(funcs[0].Nome);
        }
      }

      const canalRes = await getVendaCanais();
      if (canalRes.success) setCanais(canalRes.data || []);

      const formaRes = await getFormasPagamento();
      if (formaRes.success) setFormasPagamento(formaRes.data || []);
    };
    loadData();
  }, []);

  // Validação automática: Se houver produto "DIVERSOS", define cliente como "AVULSO"
  useEffect(() => {
    const hasDiversos = items.some(item => 
      item.Nome.toUpperCase().includes("DIVERSOS")
    );

    if (hasDiversos && clientes.length > 0) {
      const clienteAvulso = clientes.find(c => 
        c.Nome.toUpperCase().includes("AVULSO") || 
        c.Nome.toUpperCase().includes("PADRÃO") ||
        c.Nome.toUpperCase().includes("PADRAO")
      );

      if (clienteAvulso && selectedClienteId !== clienteAvulso.Id) {
        setSelectedClienteId(clienteAvulso.Id);
        setSearchCli(clienteAvulso.Nome);
      }
    }
  }, [items, clientes, selectedClienteId]);

  const addItem = (produto: any) => {
    const existing = items.find(i => i.ProdutoId === produto.Id);
    if (existing) {
      setItems(items.map(i => i.ProdutoId === produto.Id 
        ? { ...i, Quantidade: i.Quantidade + 1, ValorTotal: (i.Quantidade + 1) * i.Preco } 
        : i));
    } else {
      setItems([...items, {
        ProdutoId: produto.Id,
        Nome: produto.Cod_Nome,
        Quantidade: 1,
        Preco: Number(produto.Cod_Preco),
        ValorTotal: Number(produto.Cod_Preco)
      }]);
    }
    setSearchProd("");
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.ProdutoId !== id));
  };

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return;
    setItems(items.map(i => i.ProdutoId === id 
      ? { ...i, Quantidade: qty, ValorTotal: qty * i.Preco } 
      : i));
  };

  const totalProdutos = items.reduce((acc, i) => acc + i.ValorTotal, 0);
  const [desconto, setDesconto] = useState(Number(initialData?.Desconto || 0));
  const totalGeral = totalProdutos - desconto;

  const selectedCliente = clientes.find(c => c.Id === selectedClienteId);
  const endereco = selectedCliente?.Endereco?.[0];

  const handleSubmit = (formData: FormData) => {
    if (items.length === 0) {
      error("Adicione ao menos um produto.");
      return;
    }
    if (!selectedFormaPagamentoId) {
      error("Por favor, selecione uma Forma de Pagamento.");
      return;
    }

    // Append items and signature to formData
    formData.append("Itens", JSON.stringify(items));
    formData.append("AssinaturaCliente", signature);
    formData.append("ClienteId", selectedClienteId ? String(selectedClienteId) : "");
    if (selectedFormaPagamentoId) formData.append("FormaPagamentoId", String(selectedFormaPagamentoId));
    formData.append("TotalProdutos", totalProdutos.toString());
    formData.append("TotalServicos", "0");
    formData.append("Total", totalGeral.toString());
    formData.append("Desconto", desconto.toString());
    formData.append("Vendedor", selectedVendedor);
    formData.append("CanalId", selectedCanalId ? String(selectedCanalId) : "");
    formData.append("Garantia", garantia);

    startTransition(async () => {
      let r;
      if (isEdit) {
        r = await updateVenda(initialData.Id, tipo, formData);
      } else {
        r = await createVenda(tipo, formData);
      }

      if (r?.success && (r as any).data) {
        success(isEdit ? "Venda atualizada com sucesso!" : "Venda registrada com sucesso!");
        if (!isEdit) {
          window.location.href = `/vendas/${tipo}/print/${(r as any).data.Id}`;
        }
      } else {
        error((r as any)?.error || "Erro ao salvar venda.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-[95%] mx-auto pb-20 font-sans text-gray-700">
      
      {/* 1. Status Alert (Top) */}
      {initialData?.Ativo && (
        <div className="bg-[#fcf8e3] border border-[#faebcc] p-3 rounded text-[#8a6d3b] text-sm flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Algumas informações não poderão ser alteradas, pois esta venda encontra-se com a situação <strong>Concretizada</strong>.</span>
        </div>
      )}

      {/* 2. Card: Dados Gerais */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Pencil className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Dados gerais</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500">Número</label>
              <div className="flex bg-gray-100 border border-gray-200 rounded overflow-hidden">
                <input readOnly value={initialData?.Numero || "NOVA"} className="w-full bg-transparent p-2 outline-none" />
                <div className="bg-white border-l border-gray-200 p-2"><FileSearch className="w-3 h-3 text-gray-400" /></div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500">Cliente</label>
              <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full p-2 outline-none bg-white"
                  value={searchCli || selectedCliente?.Nome || ""}
                  onChange={(e) => setSearchCli(e.target.value)}
                />
                <button type="button" onClick={() => { setSelectedClienteId(null); setSearchCli(""); }} className="bg-white border-l border-gray-200 p-2 hover:bg-gray-50"><Trash2 className="w-3 h-3 text-gray-400" /></button>
                {searchCli && (
                   <div className="absolute z-50 mt-10 bg-white border border-gray-200 shadow-xl rounded w-[300px] max-h-60 overflow-y-auto">
                      {clientes.filter(c => c.Nome.toLowerCase().includes(searchCli.toLowerCase())).map(c => (
                        <div key={c.Id} onClick={() => { setSelectedClienteId(c.Id); setSearchCli(c.Nome); }} className="p-2 hover:bg-blue-50 cursor-pointer border-b text-sm">{c.Nome}</div>
                      ))}
                   </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500">Vendedor / Responsável</label>
              <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                <select 
                  className="w-full p-2 outline-none bg-white cursor-pointer"
                  value={selectedVendedor}
                  onChange={(e) => setSelectedVendedor(e.target.value)}
                >
                  {funcionarios.map(f => (
                    <option key={f.Id} value={f.Nome}>{f.Nome}</option>
                  ))}
                </select>
                <div className="bg-white border-l border-gray-200 p-2"><Trash2 className="w-3 h-3 text-gray-400" /></div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500">Situação *</label>
              <select className="w-full border border-gray-300 rounded p-2 outline-none shadow-sm transition-all focus:ring-1 focus:ring-blue-400">
                <option value="Concretizada">{initialData?.Ativo ? "Concretizada" : "Aberta"}</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500 font-bold text-red-500">Data *</label>
              <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                 <input type="text" readOnly value={new Date(initialData?.DataVenda || Date.now()).toLocaleDateString("pt-BR")} className="w-full p-2 outline-none" />
                 <div className="bg-white border-l border-gray-200 p-2"><Calendar className="w-3 h-3 text-gray-400" /></div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500">Prazo de entrega</label>
              <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                 <input type="text" readOnly value={new Date(initialData?.DataVenda || Date.now()).toLocaleDateString("pt-BR")} className="w-full p-2 outline-none" />
                 <div className="bg-white border-l border-gray-200 p-2"><Calendar className="w-3 h-3 text-gray-400" /></div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500 font-bold text-red-500">Canal de venda *</label>
              <select 
                className="w-full border border-gray-300 rounded p-2 outline-none shadow-sm"
                value={selectedCanalId || ""}
                onChange={(e) => setSelectedCanalId(Number(e.target.value))}
              >
                <option value="">Selecione...</option>
                {canais.map(c => (
                  <option key={c.Id} value={c.Id}>{c.Nome}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-500">Centro de custo</label>
              <input readOnly placeholder="Digite para buscar" className="w-full border border-gray-300 rounded p-2 outline-none shadow-sm placeholder:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card: Produtos */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Produtos</h3>
        </div>
        <div className="p-4">
           <table className="w-full border-collapse text-[11px] text-gray-600 mb-4">
              <thead>
                <tr className="border bg-gray-50 text-gray-500 uppercase font-black tracking-widest leading-loose">
                  <th className="px-3 border text-left font-bold py-1">Produto *</th>
                  <th className="px-3 border text-left font-bold py-1">Detalhes</th>
                  <th className="px-3 border text-center font-bold py-1 w-20 text-red-500">Quant.*</th>
                  <th className="px-3 border text-center font-bold py-1 w-24 text-red-500">Valor*</th>
                  <th className="px-3 border text-center font-bold py-1 w-32">Desconto</th>
                  <th className="px-3 border text-center font-bold py-1 w-32">Subtotal</th>
                  <th className="px-3 border text-center font-bold py-1 w-12">Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.ProdutoId} className="border text-xs">
                    <td className="p-2 border">
                      <div className="flex bg-gray-50 rounded border px-2 py-1 items-center justify-between">
                         <span className="uppercase text-[10px] font-bold text-gray-400">{item.Nome}</span>
                         <Trash2 className="w-3 h-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="p-2 border"><input className="w-full bg-gray-50 border rounded p-1 outline-none h-8" /></td>
                    <td className="p-2 border">
                      <input 
                        type="number" 
                        value={item.Quantidade} 
                        onChange={(e) => updateQty(item.ProdutoId, Number(e.target.value))}
                        className="w-full bg-gray-50 border rounded p-1 text-center font-bold h-8" 
                      />
                    </td>
                    <td className="p-2 border"><input readOnly value={item.Preco.toFixed(2)} className="w-full bg-gray-100 border rounded p-1 text-right h-8" /></td>
                    <td className="p-2 border">
                      <div className="flex bg-gray-50 border rounded p-1 items-center h-8">
                        <input className="w-full bg-transparent outline-none text-right px-1" value="0,00" readOnly />
                        <span className="text-[9px] text-gray-400 ml-1">R$</span>
                      </div>
                    </td>
                    <td className="p-2 border text-right font-bold bg-gray-50 text-gray-500 pr-3">{item.ValorTotal.toFixed(2).replace(".", ",")}</td>
                    <td className="p-2 border text-center">
                      <button type="button" onClick={() => removeItem(item.ProdutoId)} className="bg-red-400 text-white p-1 rounded hover:bg-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
           <div className="relative w-fit">
              <input 
                type="text" 
                placeholder="➕ Adicionar produto" 
                className="bg-[#607d8b] hover:bg-[#455a64] text-white text-[11px] font-bold px-4 py-2 rounded-md transition-all outline-none cursor-pointer placeholder:text-white"
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
              />
              {searchProd && (
                <div className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded mt-1 w-[300px] max-h-60 overflow-y-auto">
                    {produtos.filter(p => p.Cod_Nome.toLowerCase().includes(searchProd.toLowerCase())).map(p => (
                      <div key={p.Id} onClick={() => addItem(p)} className="p-2 hover:bg-emerald-50 cursor-pointer border-b text-sm font-bold">{p.Cod_Nome}</div>
                    ))}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* 4. Card: Serviços (Vazio similar à imagem) */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Truck className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Serviços</h3>
        </div>
        <div className="p-4">
           <table className="w-full border-collapse text-[11px] text-gray-600 mb-4 opacity-50">
              <thead>
                <tr className="border bg-gray-50 text-gray-500 uppercase font-black tracking-widest whitespace-nowrap">
                   <th className="px-3 border text-left font-bold py-1">Serviço *</th>
                   <th className="px-3 border text-left font-bold py-1">Detalhes</th>
                   <th className="px-3 border text-center font-bold py-1 w-20">Quant.*</th>
                   <th className="px-3 border text-center font-bold py-1 w-24">Valor*</th>
                   <th className="px-3 border text-center font-bold py-1 w-32">Desconto</th>
                   <th className="px-3 border text-center font-bold py-1 w-32">Subtotal</th>
                   <th className="px-3 border text-center font-bold py-1 w-12">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={7} className="text-center py-2 italic bg-gray-100/30">Nenhum serviço adicionado</td></tr>
              </tbody>
           </table>
           <button type="button" className="bg-[#607d8b] text-white text-[11px] font-bold px-4 py-2 rounded-md opacity-70">➕ Adicionar serviço</button>
        </div>
      </div>

      {/* 5. Card: Garantia */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Termos de Garantia</h3>
        </div>
        <div className="p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-500 mr-2 uppercase">Selecionar Prazo:</span>
          {[30, 60, 90].map((dias) => (
            <button
              key={dias}
              type="button"
              onClick={() => setGarantia(`${dias} DIAS`)}
              className={`px-6 py-2 rounded-md text-xs font-black transition-all border-2 ${
                garantia === `${dias} DIAS`
                  ? "bg-blue-600 text-white border-blue-700 shadow-md scale-105"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {dias} DIAS
            </button>
          ))}
          <button
            type="button"
            onClick={() => setGarantia("")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all border ${
              garantia === "" ? "bg-gray-200 text-gray-700" : "bg-white text-red-500 border-red-100 hover:bg-red-50"
            }`}
          >
            SEM GARANTIA
          </button>
          {garantia && (
            <div className="ml-auto flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <Check className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 uppercase">Selecionado: {garantia}</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Totais, Observações e Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5 space-y-4">
           <div className="flex items-center justify-between border-b pb-2 mb-3">
             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight flex items-center gap-2">
               <DollarSign className="w-4 h-4 text-gray-400" /> Totais & Pagamento
             </h3>
           </div>
           
           <div className="mb-4">
             <label className="block text-xs font-bold text-gray-600 uppercase tracking-tight mb-2">Forma de Pagamento *</label>
             <select 
                value={selectedFormaPagamentoId || ""} 
                onChange={(e) => setSelectedFormaPagamentoId(Number(e.target.value) || null)}
                className="w-full text-sm border-2 border-gray-200 rounded-md p-2 bg-gray-50 focus:border-blue-400 focus:bg-white transition-all font-bold"
                required
             >
                <option value="" disabled>-- Selecione a forma de pagamento --</option>
                {formasPagamento.map(f => (
                  <option key={f.Id} value={f.Id}>{f.Nome}</option>
                ))}
             </select>
           </div>

           <div className="grid grid-cols-5 gap-1 text-[11px] text-center border bg-gray-100 border-gray-200 uppercase font-black tracking-tighter text-gray-500">
             <div className="py-1 border-r border-gray-200">Produtos</div>
             <div className="py-1 border-r border-gray-200">Serviços</div>
             <div className="py-1 border-r border-gray-200 text-red-500">Desc R$</div>
             <div className="py-1 border-r border-gray-200">Desc %</div>
             <div className="py-1">Valor Total *</div>
           </div>
           <div className="grid grid-cols-5 gap-1 mb-2">
             <input readOnly value={totalProdutos.toFixed(2)} className="bg-gray-50 border rounded p-2 text-right text-xs" />
             <input readOnly value="0,00" className="bg-gray-100 border rounded p-2 text-right text-xs" />
             <input 
              type="number" 
              value={desconto} 
              onChange={(e) => setDesconto(Number(e.target.value))}
              className="bg-white border-2 border-orange-200 rounded p-2 text-right text-xs font-bold" 
             />
             <input readOnly value="0,00" className="bg-gray-100 border rounded p-2 text-right text-xs" />
             <input readOnly value={totalGeral.toFixed(2)} className="bg-gray-200 border border-gray-400 rounded p-2 text-right text-sm font-black text-gray-900" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
             <h3 className="font-bold text-gray-700 text-xs uppercase mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> Observações</h3>
             <textarea 
              name="Observacoes"
              defaultValue={initialData?.Observacoes || ""}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-blue-400 h-24" 
             />
           </div>
           <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
             <h3 className="font-bold text-gray-700 text-xs uppercase mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Observações Internas</h3>
             <textarea className="w-full border border-gray-300 rounded p-2 text-xs outline-none h-24 bg-gray-50" />
           </div>
        </div>
      </div>

      {/* 6. Footer Buttons */}
      <div className="flex gap-3 bg-white p-4 rounded-md shadow-inner border border-gray-200">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-700 text-white px-6 py-2.5 rounded font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "PROCESSANDO..." : <><Check className="w-4 h-4" /> ATUALIZAR</>}
        </button>
        <Link 
          href={`/vendas/${tipo}`}
          className="flex items-center gap-1.5 bg-[#e74c3c] hover:bg-red-700 text-white px-6 py-2.5 rounded font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <X className="w-4 h-4" /> CANCELAR
        </Link>
      </div>

    </form>
  );
}
