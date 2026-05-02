import React from "react";
import { Home, ArrowLeft, Edit2, Package, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { getProdutoById } from "@/actions/produtos";
import { notFound } from "next/navigation";

export default async function PreviewProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);
  if (isNaN(idNum)) return notFound();

  const { success, data: produto, error } = await getProdutoById(idNum);

  if (!success || !produto) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">Erro ao carregar</h2>
        <p className="text-gray-500 mt-2">{error || "Não encontrado."}</p>
        <Link href="/produtos" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para a lista</Link>
      </div>
    );
  }

  const Badge = ({ active }: { active: boolean }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {active ? 'Sim' : 'Não'}
    </span>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-md shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">Produto #{produto.Id}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${produto.Ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {produto.Ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Criado em {produto.dat_cadastro ? new Date(produto.dat_cadastro).toLocaleDateString("pt-BR") : "N/A"} por Sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/produtos" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-md border border-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <Link href={`/produtos/edit/${produto.Id}`} className="flex items-center gap-2 px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" /> Editar produto
          </Link>
        </div>
      </div>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA - DADOS GERAIS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Dados gerais</h3>
            </div>
            <div className="p-8 flex flex-col items-center border-b border-gray-50">
              <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-100 mb-4">
                <Package className="w-12 h-12 text-gray-200" />
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-6">Sem fotos disponíveis</p>
              <h2 className="text-xl font-black text-gray-800 uppercase text-center mb-8">{produto.Cod_Nome}</h2>
              
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400">Código:</span>
                  <span className="text-gray-600 font-medium">{produto.Id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400">Movimenta Estoque:</span>
                  <Badge active={true} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400">Vendido separadamente:</span>
                  <Badge active={true} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400">Comercializável no PDV:</span>
                  <Badge active={true} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400">Possui NF:</span>
                  <Badge active={true} />
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-50">
                  <span className="font-bold text-gray-400">Cadastrado por:</span>
                  <span className="text-gray-600 font-medium">Sistema</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - VALORES E ESTOQUE */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CARD CUSTOS E VALORES */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Custos e valores</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-10">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-700">Custo médio:</span>
                <span className="text-sm text-gray-500 font-medium">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-700">Despesas acessórias:</span>
                <span className="text-sm text-gray-500 font-medium">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-700">Outras despesas:</span>
                <span className="text-sm text-gray-500 font-medium">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-700">Valor de custo:</span>
                <span className="text-sm text-gray-900 font-bold">R$ 0,00</span>
              </div>
              
              <div className="col-span-2 pt-4">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Valores de venda</p>
                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">Tabela de preço</span>
                  <span className="text-sm font-black text-[#00a859]">R$ {produto.Cod_Preco.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD ESTOQUE */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Estoque</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-10">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Estoque mínimo</p>
                <p className="text-lg font-bold text-gray-700">0,00</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Estoque máximo</p>
                <p className="text-lg font-bold text-gray-700">0,00</p>
              </div>
              <div className="col-span-2 text-center pt-4 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Estoque Atual</p>
                <p className="text-3xl font-black text-[#38b473]">{produto.Cod_Estoque.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const DollarSign = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
)
