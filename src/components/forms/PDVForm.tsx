"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Package,
  Trash2,
  X,
  User,
  ShoppingBag,
  Plus,
  Minus,
  HandIcon,
  Ban,
  CheckCircle,
  Monitor,
  UserCheck,
  Tag,
  ArrowLeft
} from "lucide-react";
import { createVenda } from "@/actions/vendas";
import { getClientes } from "@/actions/clientes";
import { getProdutos } from "@/actions/produtos";
import { useNotification } from "@/hooks/use-notification";

interface PDVFormProps {
  tipo: "balcao";
  onClose: () => void;
}

interface CartItem {
  ProdutoId: number;
  Nome: string;
  Codigo: string;
  Quantidade: number;
  Preco: number;
  Desconto: number;
  ValorTotal: number;
}

export function PDVForm({ tipo, onClose }: PDVFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();

  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchProd, setSearchProd] = useState("");

  // Current Item focused in the edit area
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editQty, setEditQty] = useState(1);
  const [editPrice, setEditPrice] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const prodRes = await getProdutos();
      if (prodRes.success) setProdutos(prodRes.data || []);

      const cliRes = await getClientes();
      if (cliRes.success) setClientes(cliRes.data || []);
    };
    loadData();
  }, []);

  const selectProductToEdit = (prod: any) => {
    setCurrentItem(prod);
    setEditPrice(Number(prod.Cod_Preco));
    setEditQty(1);
    setEditDiscount(0);
    setSearchProd("");
  };

  const addItemToCart = () => {
    if (!currentItem) return;

    const numericTotal = (editPrice * editQty) - editDiscount;
    const newItem: CartItem = {
      ProdutoId: currentItem.Id,
      Nome: currentItem.Cod_Nome,
      Codigo: currentItem.Cod_CodigoBarras || currentItem.Id.toString(),
      Quantidade: editQty,
      Preco: editPrice,
      Desconto: editDiscount,
      ValorTotal: numericTotal
    };

    setCart([...cart, newItem]);
    setCurrentItem(null);
    setEditQty(1);
    setEditPrice(0);
    setEditDiscount(0);
  };

  const totalGeral = cart.reduce((acc, item) => acc + item.ValorTotal, 0);

  const handleFinalize = () => {
    if (cart.length === 0) {
      error("Adicione itens ao carrinho para finalizar a venda.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      // Tenta encontrar um cliente padrão "CONSUMIDOR" ou "BALCAO" na lista carregada
      const clientePadrao = clientes.find(c =>
        c.Nome?.toUpperCase().includes("CONSUMIDOR") ||
        c.Nome?.toUpperCase().includes("BALCAO")
      );

      formData.append("Itens", JSON.stringify(cart));
      formData.append("TotalProdutos", totalGeral.toString());
      formData.append("TotalServicos", "0");
      formData.append("Total", totalGeral.toString());
      formData.append("Desconto", "0");
      formData.append("Vendedor", "Balcão");

      if (clientePadrao) {
        formData.append("ClienteId", clientePadrao.Id.toString());
      }

      const r = await createVenda(tipo, formData);
      console.log(">>> [PDV] RESPOSTA DA VENDA:", r);

      if (r?.success) {
        success("Venda finalizada com sucesso!");
        setTimeout(() => {
          onClose();
        }, 500); // Pequeno delay para garantir que o usuário veja o sucesso
      } else {
        console.error(">>> [PDV] ERRO AO FINALIZAR:", r?.error);
        error(r?.error || "Erro ao finalizar venda.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#ebebeb] overflow-y-auto font-sans text-black pt-4">
      <div className="w-full min-h-screen py-4 flex flex-col items-center">
        <div className="bg-white w-full max-w-6xl rounded shadow-2xl overflow-hidden flex flex-col relative border border-gray-300 animate-in zoom-in-95 duration-300">

          {/* Top Header/Search Area */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-black tracking-tight uppercase">LOCALIZE UM PRODUTO/SERVIÇO ABAIXO</h3>
              <div className="bg-[#00b050] text-white p-2 px-4 rounded text-[11px] font-bold flex items-center gap-3 shadow-sm border border-green-600">
                <User className="w-8 h-8 opacity-40 text-black" />
                <div className="leading-tight">
                  <p className="border-b border-white/20 pb-1 mb-1">CLIENTE: <span className="underline cursor-pointer">AO CONSUMIDOR</span></p>
                  <p>VENDEDOR: <span className="underline cursor-pointer uppercase">USUÁRIO ADMINISTRADOR</span></p>
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Digite o código ou o nome do produto..."
                className="w-[60%] border-2 border-gray-400 p-3 rounded text-lg outline-none focus:border-blue-500 transition-colors text-black placeholder:text-gray-500 font-bold"
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
              />
              {searchProd && (
                <div className="absolute top-full left-0 w-[60%] bg-white border-2 border-gray-300 shadow-2xl z-50 max-h-60 overflow-y-auto rounded-b">
                  {produtos.filter(p => 
                    p.Cod_Nome?.toLowerCase().includes(searchProd.toLowerCase()) || 
                    p.Cod_CodigoBarras?.includes(searchProd) || 
                    p.Id.toString().includes(searchProd)
                  ).map(p => (
                    <div
                      key={p.Id}
                      onClick={() => selectProductToEdit(p)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex justify-between items-center"
                    >
                      <span className="font-black text-black">{p.Cod_Nome}</span>
                      <span className="text-green-700 font-black">R$ {Number(p.Cod_Preco).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Interface Content */}
          <div className="flex-1 p-8 flex gap-12 bg-white">

            {/* Left/Middle: Product Entry */}
            <div className="flex-1 flex gap-8">
              {/* Product Image Placeholder */}
              <div className="w-56 h-56 bg-[#f8f9fa] border-2 border-gray-200 rounded flex items-center justify-center relative shadow-inner">
                <Package className="w-24 h-24 text-gray-300" />
                <div className="absolute top-2 right-2 p-1 text-gray-400">
                  <Tag className="w-5 h-5" />
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center">
                  <label className="w-40 text-lg font-black text-black">CÓDIGO</label>
                  <input readOnly value={currentItem?.Cod_CodigoBarras || ""} className="flex-1 bg-[#efefef] p-2.5 border-2 border-gray-200 rounded outline-none h-12 text-black font-bold" />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-lg font-black text-black">QUANTIDADE</label>
                  <input
                    type="number"
                    value={editQty === 0 ? "" : editQty}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditQty(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="flex-1 bg-white p-2.5 border-2 border-gray-400 rounded outline-none h-12 focus:border-blue-500 text-black font-black text-xl"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-lg font-black text-black">VALOR UNITÁRIO</label>
                  <input
                    type="number"
                    value={editPrice === 0 ? "" : editPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditPrice(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="flex-1 bg-white p-2.5 border-2 border-gray-400 rounded outline-none h-12 focus:border-blue-500 text-black font-black text-xl"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-lg font-black text-black">DESCONTO</label>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={editDiscount === 0 ? "" : editDiscount}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditDiscount(e.target.value === "" ? 0 : Number(e.target.value))}
                      className="w-full bg-white p-2.5 border-2 border-gray-400 rounded outline-none h-12 focus:border-blue-500 pr-10 text-black font-black text-xl"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-black">R$</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-lg font-black text-black">VALOR TOTAL</label>
                  <input readOnly value={`R$ ${((editPrice * editQty) - editDiscount).toFixed(2)}`} className="flex-1 bg-[#efefef] p-2.5 border-2 border-gray-200 rounded outline-none h-12 font-black text-xl text-black" />
                </div>

                <button
                  disabled={!currentItem}
                  onClick={addItemToCart}
                  className="w-full bg-[#1a252f] hover:bg-black text-white py-4 rounded font-black uppercase tracking-widest transition-all disabled:opacity-50 mt-4 h-14 text-lg shadow-lg active:scale-95"
                >
                  ADICIONAR PRODUTO
                </button>
              </div>
            </div>

            {/* Right Side: Total and Primary Actions */}
            <div className="w-80 flex flex-col gap-4">
              <h3 className="text-black font-black uppercase tracking-wide text-sm">TOTAL DO PEDIDO</h3>
              <div className="bg-[#1a252f] text-white p-6 rounded flex items-center justify-center h-28 mb-2 shadow-xl border-b-4 border-green-500">
                <span className="text-5xl font-black tracking-tighter">R$ {totalGeral.toFixed(2).replace(".", ",")}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white p-3 rounded font-black text-sm flex flex-col items-center gap-1 transition-colors uppercase shadow-md active:scale-95">
                  <HandIcon className="w-6 h-5" />
                  AGUARDAR
                </button>
                <button onClick={() => { if (confirm("Cancelar venda?")) onClose(); }} className="bg-[#e74c3c] hover:bg-red-700 text-white p-3 rounded font-black text-sm flex flex-col items-center gap-1 transition-colors uppercase shadow-md active:scale-95">
                  <Ban className="w-6 h-5" />
                  CANCELAR
                </button>
              </div>

              <button
                onClick={handleFinalize}
                disabled={isPending || cart.length === 0}
                className="w-full bg-[#00b050] hover:bg-green-700 text-white py-5 rounded font-black text-xl transition-all active:scale-95 disabled:opacity-50 uppercase tracking-tighter shadow-xl mt-2"
              >
                {isPending ? "PROCESSANDO..." : "Finalizar Venda"}
              </button>

              <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-gray-100">
                <span className="text-[12px] text-black font-black uppercase tracking-tight">ITENS NO CARRINHO: {cart.length}</span>
              </div>
            </div>
          </div>

          {/* Close Button UI override */}
          <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-black transition-colors z-50">
            <X className="w-5 h-5" />
          </button>

        </div>
      </div>
    </div>
  );
}
