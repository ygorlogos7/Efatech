"use client";

import React, { useTransition, useState, useEffect } from "react";
import { createVenda, updateVenda } from "@/actions/vendas";
import { getClientes } from "@/actions/clientes";
import { getProdutos } from "@/actions/produtos";
import { getFuncionarios } from "@/actions/funcionarios";
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
  UserCheck
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
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [selectedVendedor, setSelectedVendedor] = useState<string>(initialData?.Vendedor || "");
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
    };
    loadData();
  }, []);

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
    if (!selectedClienteId && tipo === "balcao") {
      error("Por favor, selecione um cliente.");
      return;
    }
    if (items.length === 0) {
      error("Adicione ao menos um produto.");
      return;
    }

    // Append items and signature to formData
    formData.append("Itens", JSON.stringify(items));
    formData.append("AssinaturaCliente", signature);
    formData.append("ClienteId", selectedClienteId ? String(selectedClienteId) : "");
    formData.append("TotalProdutos", totalProdutos.toString());
    formData.append("TotalServicos", "0");
    formData.append("Total", totalGeral.toString());
    formData.append("Desconto", desconto.toString());
    formData.append("Vendedor", selectedVendedor);

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
    <form action={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Client and Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Client Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-800">Identificação do Cliente</h3>
            </div>
            <div className="p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar cliente por nome ou CPF..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={searchCli}
                  onChange={(e) => setSearchCli(e.target.value)}
                />
              </div>
              <div className="mt-3 max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
                {clientes
                  .filter(c => c.Nome.toLowerCase().includes(searchCli.toLowerCase()) || c.CPFCNPJ?.includes(searchCli))
                  .map(cliente => (
                    <div 
                      key={cliente.Id}
                      onClick={() => { setSelectedClienteId(cliente.Id); setSearchCli(cliente.Nome); }}
                      className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 flex justify-between items-center border-b last:border-0 ${selectedClienteId === cliente.Id ? 'bg-indigo-50' : ''}`}
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-800">{cliente.Nome}</p>
                        <p className="text-xs text-gray-500">{cliente.CPFCNPJ || "Sem documento"}</p>
                      </div>
                      {selectedClienteId === cliente.Id && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  ))}
              </div>

              {/* Client Details (Visible when selected) */}
              {selectedCliente && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Documento (CPF/CNPJ)</p>
                      <p className="text-sm font-medium text-gray-700">{selectedCliente.CPFCNPJ || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contato</p>
                      <p className="text-sm font-medium text-gray-700">{selectedCliente.TelefoneCelular || selectedCliente.Telefone || "Sem telefone"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">E-mail</p>
                      <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{selectedCliente.Email || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Endereço</p>
                      <p className="text-sm font-medium text-gray-700 leading-tight">
                        {endereco ? `${endereco.Logradouro}, ${endereco.Numero} - ${endereco.Bairro}, ${endereco.Cidade}/${endereco.UF}` : "Endereço não cadastrado"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-800">Itens do Carrinho</h3>
              </div>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {items.length} Itens
              </span>
            </div>
            <div className="p-5">
              {/* Product Search Input */}
              <div className="relative mb-6">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar produto por nome ou código..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={searchProd}
                  onChange={(e) => setSearchProd(e.target.value)}
                />
                {searchProd && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {produtos
                      .filter(p => p.Cod_Nome.toLowerCase().includes(searchProd.toLowerCase()) || p.Cod_CodigoBarras?.includes(searchProd))
                      .map(prod => (
                        <div 
                          key={prod.Id}
                          onClick={() => addItem(prod)}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                        >
                          <div>
                            <p className="font-bold text-sm text-gray-800">{prod.Cod_Nome}</p>
                            <p className="text-xs text-gray-500">Cod: {prod.Cod_CodigoBarras || "N/A"}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">R$ {Number(prod.Cod_Preco).toFixed(2)}</p>
                            <Plus className="w-4 h-4 text-emerald-400 ml-auto mt-1" />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-semibold">Descrição</th>
                      <th className="pb-3 font-semibold text-center w-24">Qtd</th>
                      <th className="pb-3 font-semibold text-right">Unitário</th>
                      <th className="pb-3 font-semibold text-right">Subtotal</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <tr key={item.ProdutoId} className="group">
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{item.Nome}</p>
                          <p className="text-xs text-gray-400">ID: {item.ProdutoId}</p>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => updateQty(item.ProdutoId, item.Quantidade - 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="font-bold w-6 text-center">{item.Quantidade}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQty(item.ProdutoId, item.Quantidade + 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right text-gray-600">R$ {item.Preco.toFixed(2)}</td>
                        <td className="py-4 text-right font-bold text-gray-900">R$ {item.ValorTotal.toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <button 
                            type="button" 
                            onClick={() => removeItem(item.ProdutoId)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                          Nenhum item adicionado ao carrinho
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Totals, Seller and Signature */}
        <div className="space-y-6">
          
          {/* Seller Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-indigo-500" />
              Vendedor Responsável
            </label>
            <select 
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 transition-all font-medium"
              value={selectedVendedor}
              onChange={(e) => setSelectedVendedor(e.target.value)}
            >
              {funcionarios.length === 0 && <option value="">Carregando vendedores...</option>}
              {funcionarios.map(f => (
                <option key={f.Id} value={f.Nome}>{f.Nome}</option>
              ))}
            </select>
          </div>
          
          {/* Summary Card */}
          <div className="bg-indigo-900 text-white rounded-xl shadow-lg border border-indigo-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Resumo Financeiro</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm opacity-80">
                <span>Subtotal</span>
                <span>R$ {totalProdutos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Desconto</span>
                <input 
                  type="number" 
                  step="0.01" 
                  className="bg-indigo-800 border border-indigo-700 rounded px-2 py-1 text-right w-24 outline-none focus:ring-1 focus:ring-indigo-400" 
                  value={desconto}
                  onChange={(e) => setDesconto(Number(e.target.value))}
                />
              </div>
              <div className="border-t border-indigo-800 pt-4 mt-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs uppercase font-bold opacity-60">Total a Pagar</span>
                  <span className="text-3xl font-extrabold leading-none">R$ {totalGeral.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="bg-indigo-950 px-5 py-4">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Check className="w-5 h-5" />}
                {isPending ? "PROCESSANDO..." : "FINALIZAR VENDA"}
              </button>
            </div>
          </div>

          {/* Signature Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <SignaturePad 
              onSave={(base64: string) => setSignature(base64)} 
              label="Assinatura Digital" 
              initialImage={initialData?.AssinaturaCliente}
              width={280} 
              height={150} 
            />
          </div>

          {/* Observations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-gray-400" />
              Observações Internas
            </label>
            <textarea 
              name="Observacoes" 
              rows={3} 
              defaultValue={initialData?.Observacoes || ""}
              placeholder="Digite aqui observações relevantes sobre esta venda..."
              className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 bg-gray-50"
            />
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col gap-2">
            <Link 
              href={`/vendas/${tipo}`} 
              className="w-full py-2.5 text-center text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
            >
              DESCARTAR E VOLTAR
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
