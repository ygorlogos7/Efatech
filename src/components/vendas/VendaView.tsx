"use client";

import React, { useState } from "react";
import { 
  Pencil, 
  Printer, 
  Clock, 
  History, 
  MessageSquare, 
  Package, 
  DollarSign, 
  User, 
  Calendar, 
  FileSearch,
  ExternalLink,
  ChevronRight,
  Monitor,
  CheckCircle2,
  QrCode
} from "lucide-react";
import Link from "next/link";

interface VendaViewProps {
  venda: any;
  tipo: string;
}

export function VendaView({ venda, tipo }: VendaViewProps) {
  const [activeTab, setActiveTab] = useState("produtos");

  const totalQuantidade = venda.Itens?.reduce((acc: number, i: any) => acc + Number(i.Quantidade), 0) || 0;

  return (
    <div className="space-y-6 font-sans text-gray-700">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
             <Monitor className="w-5 h-5 text-gray-400" />
             <h2 className="text-xl font-bold text-gray-800">Vendas de Balcão #{venda.Numero}</h2>
             <span className="bg-[#5cb85c] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Concretizada</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Criado em {new Date(venda.CreatedAt).toLocaleString("pt-BR")} por <span className="text-blue-500 hover:underline cursor-pointer font-medium">{venda.Vendedor || "Sistema"}</span>
          </p>
        </div>
        <Link 
          href={`/vendas/${tipo}/edit/${venda.Id}`}
          className="bg-[#f0ad4e] hover:bg-orange-600 text-white px-4 py-2 rounded shadow-sm text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
        >
          <Pencil className="w-4 h-4" /> EDITAR VENDA
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* 2. Left Sidebar (3/12 width approx) */}
        <div className="lg:w-1/4 space-y-6">
           
           {/* Card: Dados Gerais */}
           <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                 <Pencil className="w-4 h-4 text-gray-500" />
                 <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Dados gerais</h3>
              </div>
              <div className="p-4 space-y-4">
                 <div className="text-center pb-4 border-b border-dashed">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Pessoa Física</p>
                    <p className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">{venda.Cliente?.Nome || "Consumidor Final"}</p>
                 </div>
                 
                 <div className="space-y-3 text-[11px]">
                    <div className="flex justify-between">
                       <span className="text-gray-400 font-bold uppercase">Nº Venda:</span>
                       <span className="font-bold">{venda.Numero}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 font-bold uppercase">Vendedor:</span>
                       <span className="text-blue-600 font-bold hover:underline cursor-pointer">{venda.Vendedor || "Não informado"}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 font-bold uppercase">Previsão de entrega:</span>
                       <span className="font-bold">{new Date(venda.DataVenda).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 font-bold uppercase">Canal de venda:</span>
                       <span className="font-bold text-gray-500">Presencial</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 font-bold uppercase">Cadastrado por:</span>
                       <span className="text-blue-600 font-bold hover:underline cursor-pointer">{venda.Vendedor || "Sistema"}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 font-bold uppercase">Cadastrado em:</span>
                       <span className="font-bold">{new Date(venda.CreatedAt).toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 font-bold uppercase">Modificado em:</span>
                       <span className="font-bold">{new Date(venda.UpdatedAt).toLocaleString("pt-BR")}</span>
                    </div>
                 </div>

                 <button className="w-full bg-[#1a2d36] hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded transition-all">
                    EDITAR DETALHES
                 </button>
              </div>
           </div>

           {/* Card: Impressão */}
           <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#fcfcfc] px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                 <Printer className="w-4 h-4 text-gray-500" />
                 <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Impressão</h3>
              </div>
              <div className="p-6 flex flex-col items-center">
                 <div className="bg-gray-100 w-32 h-32 rounded flex items-center justify-center border border-dashed border-gray-300 mb-4">
                    <QrCode className="w-20 h-20 text-gray-300" />
                 </div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Nº venda: {venda.Numero}</p>
                 <div className="grid grid-cols-2 gap-2 w-full">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold py-2 rounded border border-gray-200">IMPRIMIR A4</button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold py-2 rounded border border-gray-200">TERMICA 80MM</button>
                 </div>
              </div>
           </div>

        </div>

        {/* 3. Right Content (9/12 width approx) */}
        <div className="lg:w-3/4 space-y-4">
           
           {/* Tabs Navigation */}
           <div className="flex border-b border-gray-200 bg-white rounded-t-md px-1 overflow-hidden shadow-sm">
              {[
                { id: "produtos", label: "Produtos/Serviços", icon: Package },
                { id: "pagamentos", label: "Pagamentos", icon: DollarSign },
                { id: "historico", label: "Histórico", icon: History },
                { id: "interacoes", label: "Interações", icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 ${
                    activeTab === tab.id 
                    ? "border-blue-500 text-blue-600 bg-white" 
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
           </div>

           {/* Tab Content: Produtos */}
           {activeTab === "produtos" && (
             <div className="bg-white rounded-b-md shadow-sm border border-gray-200 p-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-6 border-b pb-3">
                   <Package className="w-5 h-5 text-gray-500" />
                   <h3 className="font-bold text-gray-700 text-sm uppercase">Produtos</h3>
                </div>

                <table className="w-full border-collapse text-[11px]">
                   <thead>
                      <tr className="bg-[#f5f8fa] text-gray-500 uppercase font-black tracking-widest border font-bold">
                         <th className="px-3 py-2 border text-left">Produto</th>
                         <th className="px-3 py-2 border text-center w-20">Quantidade</th>
                         <th className="px-3 py-2 border text-center w-20">Tipo</th>
                         <th className="px-3 py-2 border text-right w-24">Custo unit.</th>
                         <th className="px-3 py-2 border text-right w-24">Custo total</th>
                         <th className="px-3 py-2 border text-right w-24">Valor unit.</th>
                         <th className="px-3 py-2 border text-right w-20">Desconto</th>
                         <th className="px-3 py-2 border text-right w-32">Valor total</th>
                      </tr>
                   </thead>
                   <tbody>
                      {venda.Itens?.map((item: any) => (
                        <tr key={item.Id} className="border hover:bg-gray-50 transition-colors">
                           <td className="px-3 py-3 border">
                              <p className="font-bold text-blue-600 hover:underline cursor-pointer uppercase">{item.Produtos?.Cod_Nome || "Produto"}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">ID: {item.ProdutoId}</p>
                           </td>
                           <td className="px-3 py-3 border text-center font-medium capitalize">{Number(item.Quantidade).toFixed(2).replace(".", ",")}</td>
                           <td className="px-3 py-3 border text-center text-gray-400 italic">Varejo</td>
                           <td className="px-3 py-3 border text-right text-gray-500">0,00</td>
                           <td className="px-3 py-3 border text-right text-gray-500">0,00</td>
                           <td className="px-3 py-3 border text-right font-medium">{(Number(item.ValorTotal) / Number(item.Quantidade)).toFixed(2).replace(".", ",")}</td>
                           <td className="px-3 py-3 border text-right text-gray-400">---</td>
                           <td className="px-3 py-3 border text-right font-bold text-gray-900">R$ {Number(item.ValorTotal).toFixed(2).replace(".", ",")}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50/50">
                        <td colSpan={5} className="px-3 py-3 border"></td>
                        <td colSpan={2} className="px-3 py-3 border text-right font-bold text-gray-400 uppercase tracking-tighter">Quantidade: {totalQuantidade}</td>
                        <td className="px-3 py-3 border text-right text-sm">
                           <span className="text-gray-400 font-bold mr-2 uppercase text-[10px]">Valor total:</span>
                           <span className="font-black text-gray-900">R$ {Number(venda.Total).toFixed(2).replace(".", ",")}</span>
                        </td>
                      </tr>
                   </tbody>
                </table>

                <div className="flex items-center gap-2 mt-8 mb-6 border-b pb-3">
                   <Clock className="w-5 h-5 text-gray-500" />
                   <h3 className="font-bold text-gray-700 text-sm uppercase">Serviços</h3>
                </div>
                <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded bg-gray-50/20">
                   <p className="text-gray-400 italic text-sm">Nenhum serviço foi encontrado!</p>
                </div>
             </div>
           )}

           {/* Tab Content: Placeholder others */}
           {activeTab !== "produtos" && (
             <div className="bg-white rounded-b-md shadow-sm border border-gray-200 p-12 text-center animate-in slide-in-from-top-1 duration-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                   {activeTab === "pagamentos" && <DollarSign className="w-8 h-8 text-gray-200" />}
                   {activeTab === "historico" && <History className="w-8 h-8 text-gray-200" />}
                   {activeTab === "interacoes" && <MessageSquare className="w-8 h-8 text-gray-200" />}
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2 capitalize">{activeTab} em breve</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Em breve você poderá visualizar {activeTab} detalhados nesta seção para um controle ainda maior.</p>
             </div>
           )}

        </div>

      </div>
    </div>
  );
}
