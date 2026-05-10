"use client";

import React, { useTransition, useState, useEffect, useRef } from "react";
import { createVenda, updateVenda, getProximoNumeroVenda } from "@/actions/vendas";
import { getClientes, quickCreateCliente } from "@/actions/clientes";
import { getProdutos, quickCreateProduto } from "@/actions/produtos";
import { getFuncionarios } from "@/actions/funcionarios";
import { getVendaCanais } from "@/actions/vendas";
import { getFormasPagamento } from "@/actions/financeiro";
import { getEmpresas } from "@/actions/empresas";
import { 
  ShoppingBasket, 
  DollarSign, 
  FileText, 
  Check, 
  X, 
  Trash2, 
  User,
  Package,
  UserCheck,
  Calendar,
  AlertCircle,
  FileSearch,
  Pencil,
  Building2,
  PlusCircle,
  Plus,
  Search
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
  Desconto: number;
  ValorTotal: number;
  Estoque: number;
}

export function VendaForm({ tipo, initialData, isReadOnly = false }: VendaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useNotification();
  
  // States for dynamic form
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [proximoNumero, setProximoNumero] = useState<number | null>(null);

  const [empresaRazaoSocial, setEmpresaRazaoSocial] = useState("");
  const [empresaNomeFantasia, setEmpresaNomeFantasia] = useState("");
  const [empresaCnpj, setEmpresaCnpj] = useState("");
  const [empresaIE, setEmpresaIE] = useState("");
  const [empresaEmailComercial, setEmpresaEmailComercial] = useState("");
  const [empresaTelefoneComercial, setEmpresaTelefoneComercial] = useState("");

  const lastHydratedEmpresaIdRef = useRef<number | null>(null);

  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(initialData?.ClienteId || null);
  const [searchCli, setSearchCli] = useState(initialData?.Cliente?.Nome || "");
  const [clienteTelefone, setClienteTelefone] = useState(initialData?.Cliente?.Telefone || "");
  const [clienteCPF, setClienteCPF] = useState(initialData?.Cliente?.CPFCNPJ || "");
  const [clienteEmail, setClienteEmail] = useState(initialData?.Cliente?.Email || "");

  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(initialData?.EmpresaId || null);
  const [selectedVendedor, setSelectedVendedor] = useState<string>(initialData?.Vendedor || "");
  const [selectedFormaPagamentoId, setSelectedFormaPagamentoId] = useState<number | null>(initialData?.FormaPagamentoId || null);
  const [garantia, setGarantia] = useState<string>(initialData?.Garantia || "");
  const [situacao, setSituacao] = useState<string>(
    initialData 
      ? (initialData.Ativo === true ? "Concluída" : "Aberta") 
      : "Concluída"
  );
  const [dataVenda, setDataVenda] = useState<string>(
    initialData?.DataVenda
      ? new Date(initialData.DataVenda).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<VendaItem[]>(initialData?.Itens?.map((i: any) => ({
    ProdutoId: i.ProdutoId,
    Nome: i.Produtos?.Cod_Nome || "Produto",
    Quantidade: Number(i.Quantidade),
    Preco: Number(i.Produtos?.Cod_Preco || 0),
    Desconto: Number(i.Desconto || 0),
    ValorTotal: Number(i.ValorTotal),
    Estoque: Number(i.Produtos?.Cod_Estoque || 0)
  })) || []);
  const [signature, setSignature] = useState<string>(initialData?.AssinaturaCliente || "");
  const [searchProd, setSearchProd] = useState("");

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

      const formaRes = await getFormasPagamento();
      if (formaRes.success) setFormasPagamento(formaRes.data || []);

      const empRes = await getEmpresas();
      if (empRes.success) {
        const emps = empRes.data || [];
        setEmpresas(emps);
        if (!initialData?.EmpresaId && emps.length > 0) {
          setSelectedEmpresaId(emps[0].Id);
        }
      }

      if (!initialData) {
        const numRes = await getProximoNumeroVenda();
        if (numRes.success) setProximoNumero(numRes.proximo);
      }
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

      if (clienteAvulso && !selectedClienteId) {
        setSelectedClienteId(clienteAvulso.Id);
        setSearchCli(clienteAvulso.Nome);
      }
    }
  }, [items, clientes, selectedClienteId]);

  useEffect(() => {
    if (!selectedEmpresaId) {
      lastHydratedEmpresaIdRef.current = null;
      return;
    }
    const emp = empresas.find((e) => e.Id === selectedEmpresaId);
    if (!emp) return;

    const selectionChanged =
      lastHydratedEmpresaIdRef.current === null ||
      lastHydratedEmpresaIdRef.current !== selectedEmpresaId;
    if (!selectionChanged) return;

    lastHydratedEmpresaIdRef.current = selectedEmpresaId;
    setEmpresaRazaoSocial(emp.RazaoSocial || "");
    setEmpresaNomeFantasia(emp.NomeFantasia || "");
    setEmpresaCnpj(emp.Cnpj || "");
    setEmpresaIE(emp.InscricaoEstadual || "");
    setEmpresaEmailComercial(emp.Email || "");
    setEmpresaTelefoneComercial(emp.Telefone || "");
  }, [selectedEmpresaId, empresas]);

  const addItem = (produto: any) => {
    const existing = items.find(i => i.ProdutoId === produto.Id);
    if (existing) {
      const newQty = existing.Quantidade + 1;
      const total = (newQty * existing.Preco) - existing.Desconto;
      setItems(items.map(i => i.ProdutoId === produto.Id 
        ? { ...i, Quantidade: newQty, ValorTotal: total } 
        : i));
    } else {
      setItems([...items, {
        ProdutoId: produto.Id,
        Nome: produto.Cod_Nome,
        Quantidade: 1,
        Preco: Number(produto.Cod_Preco),
        Desconto: 0,
        ValorTotal: Number(produto.Cod_Preco),
        Estoque: Number(produto.Cod_Estoque || 0)
      }]);
    }
    setSearchProd("");
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.ProdutoId !== id));
  };

  const updateQty = (id: number, qty: number) => {
    if (qty < 0) return;
    setItems(items.map(i => {
      if (i.ProdutoId === id) {
        const total = (qty * i.Preco) - i.Desconto;
        return { ...i, Quantidade: qty, ValorTotal: total };
      }
      return i;
    }));
  };

  const updatePrice = (id: number, price: number) => {
    if (price < 0) return;
    setItems(items.map(i => {
      if (i.ProdutoId === id) {
        const total = (i.Quantidade * price) - i.Desconto;
        return { ...i, Preco: price, ValorTotal: total };
      }
      return i;
    }));
  };

  const updateDiscount = (id: number, discount: number) => {
    if (discount < 0) return;
    setItems(items.map(i => {
      if (i.ProdutoId === id) {
        const total = (i.Quantidade * i.Preco) - discount;
        return { ...i, Desconto: discount, ValorTotal: total };
      }
      return i;
    }));
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
    formData.append("ClienteNome", searchCli);
    formData.append("ClienteTelefone", clienteTelefone);
    formData.append("ClienteCPF", clienteCPF);
    formData.append("ClienteEmail", clienteEmail);

    if (selectedFormaPagamentoId) formData.append("FormaPagamentoId", String(selectedFormaPagamentoId));
    formData.append("TotalProdutos", totalProdutos.toString());
    formData.append("TotalServicos", "0");
    formData.append("Total", totalGeral.toString());
    formData.append("Desconto", desconto.toString());
    formData.append("Vendedor", selectedVendedor);
    formData.append("EmpresaId", selectedEmpresaId ? String(selectedEmpresaId) : "");
    formData.append("Garantia", garantia);
    formData.append("Situacao", situacao);
    formData.append("DataVenda", dataVenda);

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
          window.location.href = `/vendas/${tipo}`;
        }
      } else {
        error((r as any)?.error || "Erro ao salvar venda.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-[95%] mx-auto pb-20 font-sans text-gray-700">
      
      {/* 1. Status Alert (Top) - Aparece se a venda estiver Concluída (Ativo: true) */}
      {initialData && initialData.Ativo === true && (
        <div className="bg-[#fcf8e3] border border-[#faebcc] p-3 rounded text-[#8a6d3b] text-sm flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Esta venda encontra-se com a situação <strong>Concluída</strong>. Algumas informações financeiras podem estar protegidas.</span>
        </div>
      )}

      {/* 2. Card: Dados gerais */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2 rounded-t-md">
          <Pencil className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Dados gerais</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">Número</label>
              <div className="flex bg-gray-50 border border-gray-200 rounded overflow-hidden">
                <input
                  readOnly
                  value={initialData?.Numero ? `#${initialData.Numero}` : (proximoNumero ? `#${proximoNumero}` : "Gerando...")}
                  className="w-full bg-transparent p-2 outline-none font-bold text-emerald-600"
                />
                <div className="bg-white border-l border-gray-200 p-2"><FileSearch className="w-3 h-3 text-gray-400" /></div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs lg:col-span-2">
              <label className="font-semibold text-gray-600">Vendedor / Responsável</label>
              <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                <select
                  className="w-full p-2 outline-none bg-white cursor-pointer font-bold"
                  value={selectedVendedor}
                  onChange={(e) => setSelectedVendedor(e.target.value)}
                >
                  {funcionarios.map(f => (
                    <option key={f.Id} value={f.Nome}>{f.Nome}</option>
                  ))}
                </select>
                <div className="bg-white border-l border-gray-200 p-2"><User className="w-3 h-3 text-gray-400" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2b. Card: Dados do cliente */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 rounded-t-md">
          <User className="w-4 h-4 text-gray-600" />
          <h3 className="font-bold text-gray-800 text-sm">Dados do cliente</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            <div className="space-y-1.5 text-xs lg:col-span-2 relative">
              <label className="font-semibold text-gray-600">Nome *</label>
              <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
                <input
                  type="text"
                  placeholder="Digite o nome do cliente"
                  className="w-full p-2.5 outline-none bg-white font-bold text-sm"
                  value={searchCli}
                  onChange={(e) => {
                    setSearchCli(e.target.value);
                    if (e.target.value === "") {
                      setSelectedClienteId(null);
                      setClienteTelefone("");
                      setClienteCPF("");
                      setClienteEmail("");
                    }
                  }}
                />
                <button type="button" onClick={() => { setSelectedClienteId(null); setSearchCli(""); setClienteTelefone(""); setClienteCPF(""); setClienteEmail(""); }} className="bg-white border-l border-gray-200 p-2 hover:bg-gray-50"><Trash2 className="w-3 h-3 text-gray-400" /></button>
              </div>
              {searchCli && !selectedClienteId && (
                <div className="absolute z-[100] top-full left-0 right-0 bg-white border border-gray-300 shadow-2xl rounded-md mt-1 max-h-60 overflow-y-auto ring-1 ring-black/5">
                  {clientes.filter(c => c.Nome.toLowerCase().includes(searchCli.toLowerCase())).map(c => (
                    <div key={c.Id} onClick={() => {
                      setSelectedClienteId(c.Id);
                      setSearchCli(c.Nome);
                      setClienteTelefone(c.Telefone || "");
                      setClienteCPF(c.CPFCNPJ || "");
                      setClienteEmail(c.Email || "");
                    }} className="p-3 hover:bg-emerald-50 cursor-pointer border-b last:border-0 text-sm font-bold flex flex-col">
                      <span>{c.Nome}</span>
                      {c.CPFCNPJ && <span className="text-[10px] text-gray-400 font-normal">{c.CPFCNPJ}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">Telefone principal</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">CPF / CNPJ</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={clienteCPF}
                onChange={(e) => setClienteCPF(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 text-xs lg:col-span-2">
              <label className="font-semibold text-gray-600">E-mail</label>
              <input
                type="email"
                placeholder="cliente@email.com"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">Data da venda *</label>
              <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-emerald-400">
                <input
                  type="date"
                  value={dataVenda}
                  onChange={(e) => setDataVenda(e.target.value)}
                  className="w-full p-2.5 outline-none bg-white font-bold text-sm"
                  required
                />
                <div className="bg-white border-l border-gray-200 p-2 flex items-center"><Calendar className="w-3.5 h-3.5 text-gray-400" /></div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">Situação</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm transition-all focus:ring-1 focus:ring-emerald-400 font-bold text-sm"
                value={situacao}
                onChange={(e) => setSituacao(e.target.value)}
              >
                <option value="Concluída">Concluída</option>
                <option value="Aberta">Aberta</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 rounded-t-md">
          <Building2 className="w-4 h-4 text-gray-600" />
          <h3 className="font-bold text-gray-800 text-sm">Dados da empresa</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-gray-600">Empresa cadastrada</label>
            <select
              className="w-full p-2.5 outline-none bg-white font-bold text-sm border border-gray-300 rounded-md shadow-sm"
              value={selectedEmpresaId ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setSelectedEmpresaId(null);
                  setEmpresaRazaoSocial("");
                  setEmpresaNomeFantasia("");
                  setEmpresaCnpj("");
                  setEmpresaIE("");
                  setEmpresaEmailComercial("");
                  setEmpresaTelefoneComercial("");
                  return;
                }
                setSelectedEmpresaId(Number(raw));
              }}
            >
              <option value="">Selecione...</option>
              {empresas.map(emp => (
                <option key={emp.Id} value={emp.Id}>{emp.RazaoSocial}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            <div className="space-y-1.5 text-xs lg:col-span-2">
              <label className="font-semibold text-gray-600">Razão social *</label>
              <input
                type="text"
                placeholder="Razão social da empresa"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={empresaRazaoSocial}
                onChange={(e) => setEmpresaRazaoSocial(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">Nome fantasia</label>
              <input
                type="text"
                placeholder="Nome comercial"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={empresaNomeFantasia}
                onChange={(e) => setEmpresaNomeFantasia(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">CNPJ</label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={empresaCnpj}
                onChange={(e) => setEmpresaCnpj(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">Inscrição estadual</label>
              <input
                type="text"
                placeholder="I.E."
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={empresaIE}
                onChange={(e) => setEmpresaIE(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 text-xs lg:col-span-2">
              <label className="font-semibold text-gray-600">E-mail comercial</label>
              <input
                type="email"
                placeholder="contato@empresa.com.br"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={empresaEmailComercial}
                onChange={(e) => setEmpresaEmailComercial(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-600">Telefone</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none shadow-sm font-bold text-sm focus:ring-1 focus:ring-emerald-400"
                value={empresaTelefoneComercial}
                onChange={(e) => setEmpresaTelefoneComercial(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card: Produtos */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 relative z-20">
        <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2 rounded-t-md">
          <Package className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Produtos</h3>
        </div>
        <div className="p-4">
           <table className="w-full border-collapse text-[11px] text-gray-600 mb-4">
              <thead>
                <tr className="border bg-gray-50 text-gray-500 uppercase font-black tracking-widest leading-loose">
                  <th className="px-3 border text-left font-bold py-1">Produto *</th>
                  <th className="px-3 border text-center font-bold py-1 w-20">Estoque</th>
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
                       <span className="uppercase text-[11px] font-black text-gray-700">{item.Nome}</span>
                    </td>
                    <td className="p-2 border text-center font-bold text-emerald-600 bg-emerald-50/30">{item.Estoque}</td>
                    <td className="p-2 border">
                      <input 
                        type="number" 
                        value={item.Quantidade === 0 ? "" : item.Quantidade} 
                        onChange={(e) => updateQty(item.ProdutoId, e.target.value === "" ? 0 : Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className="w-full border-2 border-gray-100 rounded p-1 text-center font-bold h-8 focus:border-emerald-500 outline-none transition-all" 
                      />
                    </td>
                    <td className="p-2 border">
                      <input 
                        type="number" 
                        step="0.01"
                        value={item.Preco === 0 ? "" : item.Preco} 
                        onChange={(e) => updatePrice(item.ProdutoId, e.target.value === "" ? 0 : Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className="w-full border-2 border-gray-100 rounded p-1 text-right font-bold h-8 focus:border-emerald-500 outline-none transition-all" 
                      />
                    </td>
                    <td className="p-2 border">
                      <div className="flex border-2 border-gray-100 rounded p-1 items-center h-8 focus-within:border-emerald-500 transition-all bg-white">
                        <input 
                          type="number"
                          step="0.01"
                          className="w-full bg-transparent outline-none text-right px-1 font-bold" 
                          value={item.Desconto === 0 ? "" : item.Desconto} 
                          onChange={(e) => updateDiscount(item.ProdutoId, e.target.value === "" ? 0 : Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                        />
                        <span className="text-[9px] text-gray-400 ml-1">R$</span>
                      </div>
                    </td>
                    <td className="p-2 border text-right font-black bg-gray-50 text-gray-800 pr-3 text-[13px]">R$ {item.ValorTotal.toFixed(2).replace(".", ",")}</td>
                    <td className="p-2 border text-center">
                      <button type="button" onClick={() => removeItem(item.ProdutoId)} className="bg-red-400 text-white p-1.5 rounded-md hover:bg-red-500 transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>

           <div className="bg-emerald-50/50 border-2 border-emerald-100/50 rounded-lg p-4 mb-4">
              <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-emerald-700 uppercase flex items-center gap-1">
                      <Search className="w-3 h-3" /> Pesquisar Produto
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Nome ou código do produto..." 
                        className="w-full bg-white border border-emerald-200 rounded-lg px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={searchProd}
                        onChange={(e) => setSearchProd(e.target.value)}
                      />
                      {searchProd && (
                        <div className="absolute z-50 bg-white border border-gray-200 shadow-2xl rounded-lg mt-1 w-full min-w-[450px] max-h-72 overflow-y-auto ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-200">
                            {produtos.filter(p => 
                              p.Cod_Nome.toLowerCase().includes(searchProd.toLowerCase()) || 
                              (p.Cod_CodigoBarras && p.Cod_CodigoBarras.toLowerCase().includes(searchProd.toLowerCase())) ||
                              p.Id.toString().includes(searchProd)
                            ).map(p => (
                              <div key={p.Id} onClick={() => addItem(p)} className="p-3 hover:bg-emerald-50 cursor-pointer border-b last:border-0 text-sm font-bold flex justify-between items-center group transition-colors">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                     <Package className="w-4 h-4" />
                                   </div>
                                   <div className="flex flex-col">
                                     <span className="group-hover:text-emerald-700 transition-colors uppercase text-[12px]">{p.Cod_Nome}</span>
                                     <span className="text-[10px] text-gray-400 font-normal">SKU: {p.Cod_CodigoBarras || p.Id}</span>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                   <div className="text-right border-r pr-4 border-gray-100">
                                     <div className="text-[10px] text-gray-400 uppercase font-black">Preço</div>
                                     <div className="text-emerald-600 font-black text-sm">R$ {p.Cod_Preco.toFixed(2)}</div>
                                   </div>
                                   <div className="text-right min-w-[70px]">
                                     <div className="text-[10px] text-gray-400 uppercase font-black">Estoque</div>
                                     <div className={`text-sm font-black ${p.Cod_Estoque > 0 ? "text-blue-600" : "text-red-500"}`}>{p.Cod_Estoque} <span className="text-[9px] font-normal text-gray-400">un</span></div>
                                   </div>
                                 </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-12 border-l border-emerald-200 mx-4 hidden lg:block self-end"></div>

                  <div className="flex items-end gap-2 flex-wrap md:flex-nowrap pb-0.5">
                     <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                         <PlusCircle className="w-3 h-3" /> Novo Produto
                       </label>
                       <input id="newProdNome" className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold w-48 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" placeholder="Nome do item..." />
                     </div>
                     <div className="space-y-1 w-24">
                       <label className="text-[10px] font-black text-gray-500 uppercase">Preço (R$)</label>
                       <input id="newProdPreco" type="number" step="0.01" onFocus={(e) => e.target.select()} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold w-full outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-right" placeholder="0.00" />
                     </div>
                     <div className="space-y-1 w-20">
                       <label className="text-[10px] font-black text-gray-500 uppercase">Estoque</label>
                       <input id="newProdEstoque" type="number" onFocus={(e) => e.target.select()} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold w-full outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-center" placeholder="0" />
                     </div>
                     <button 
                        type="button" 
                        onClick={async () => {
                          const nomeInput = document.getElementById("newProdNome") as HTMLInputElement;
                          const precoInput = document.getElementById("newProdPreco") as HTMLInputElement;
                          const estoqueInput = document.getElementById("newProdEstoque") as HTMLInputElement;
                          
                          const nome = nomeInput.value;
                          const preco = precoInput.value;
                          const estoque = estoqueInput.value;
                          
                          if (!nome) { error("Nome do produto é obrigatório."); return; }
                          
                          const formData = new FormData();
                          formData.append("Nome", nome);
                          formData.append("Preco", preco);
                          formData.append("EstoqueInitial", estoque);
                          
                          const res = await quickCreateProduto(formData);
                          if (res.success && res.data) {
                            setProdutos([...produtos, res.data]);
                            addItem(res.data);
                            nomeInput.value = "";
                            precoInput.value = "";
                            estoqueInput.value = "";
                            success("Produto cadastrado e adicionado!");
                          } else {
                            error(res.error || "Erro ao cadastrar produto.");
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center" 
                        title="Cadastrar e Adicionar"
                     >
                       <Plus className="w-5 h-5" />
                     </button>
                  </div>
              </div>
           </div>
        </div>
      </div>



      {/* 5. Card: Garantia */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2 rounded-t-md">
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

            <div className="grid grid-cols-2 gap-2 text-[11px] text-center border bg-gray-100 border-gray-200 uppercase font-black tracking-tighter text-gray-500">
              <div className="py-1 border-r border-gray-200 text-red-500">Desconto Geral (R$)</div>
              <div className="py-1">Valor Total Final *</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="relative">
                <input 
                  type="number" 
                  value={desconto === 0 ? "" : desconto} 
                  onChange={(e) => setDesconto(e.target.value === "" ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-white border-2 border-orange-200 rounded p-2 text-right text-sm font-bold focus:border-orange-400 outline-none transition-all shadow-inner" 
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-black">R$</span>
              </div>
              <div className="relative">
                <input 
                  readOnly 
                  value={totalGeral.toFixed(2).replace(".", ",")} 
                  className="w-full bg-gray-100 border-2 border-gray-300 rounded p-2 text-right text-base font-black text-gray-900 shadow-sm" 
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-black">R$</span>
              </div>
            </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-700 text-xs uppercase mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> Observações</h3>
          <textarea 
            name="Observacoes"
            defaultValue={initialData?.Observacoes || ""}
            className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-blue-400 h-24" 
          />
        </div>
      </div>

      {/* 6. Footer Buttons */}
      <div className="flex gap-3 bg-white p-4 rounded-md shadow-inner border border-gray-200">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center gap-1.5 bg-[#00b050] hover:bg-green-700 text-white px-6 py-2.5 rounded font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "PROCESSANDO..." : <><Check className="w-4 h-4" /> {isEdit ? "ATUALIZAR" : "FINALIZAR VENDA"}</>}
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
