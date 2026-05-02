import React from "react";
import { Home, ArrowLeft, Edit2, User, Mail, Phone, MapPin, Globe, CreditCard, ClipboardList } from "lucide-react";
import Link from "next/link";
import { getClienteById } from "@/actions/clientes";
import { notFound } from "next/navigation";

export default async function PreviewClientePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);
  if (isNaN(idNum)) return notFound();

  const { success, data: cliente, error } = await getClienteById(idNum);

  if (!success || !cliente) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">Erro ao carregar</h2>
        <p className="text-gray-500 mt-2">{error || "Não encontrado."}</p>
        <Link href="/cadastros/clientes" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para a lista</Link>
      </div>
    );
  }

  const LabelValue = ({ label, value }: { label: string, value: any }) => (
    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
      <span className="text-sm font-bold text-gray-700">{label}:</span>
      <span className="text-sm text-gray-500 font-medium">{value || "-"}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-md shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{cliente.Nome}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cliente.Ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cliente.Ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Cliente #{cliente.Id} • {cliente.TipoCliente}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cadastros/clientes" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-md border border-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <Link href={`/cadastros/clientes/edit/${cliente.Id}`} className="flex items-center gap-2 px-4 py-2 bg-[#f39c12] hover:bg-[#db8b0b] text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" /> Editar cliente
          </Link>
        </div>
      </div>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA - DADOS GERAIS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Dados do cliente</h3>
            </div>
            <div className="p-6 space-y-4">
              <LabelValue label="CPF/CNPJ" value={cliente.CPFCNPJ} />
              <LabelValue label="E-mail" value={cliente.Email} />
              <LabelValue label="Telefone" value={cliente.Telefone} />
              <LabelValue label="Celular" value={cliente.TelefoneCelular} />
              <LabelValue label="Vendedor" value={cliente.VendedorResponsavel} />
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Financeiro</h3>
            </div>
            <div className="p-6 space-y-4">
              <LabelValue label="Limite de Crédito" value={cliente.LimiteCredito ? `R$ ${Number(cliente.LimiteCredito).toFixed(2)}` : "R$ 0,00"} />
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Exceder limite:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cliente.PermitirExcederLimite ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {cliente.PermitirExcederLimite ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - ENDEREÇO E OBS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Endereço principal</h3>
            </div>
            <div className="p-6">
              {cliente.Endereco && cliente.Endereco.length > 0 ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-10">
                  <LabelValue label="CEP" value={cliente.Endereco[0].Cep} />
                  <LabelValue label="Logradouro" value={cliente.Endereco[0].Logradouro} />
                  <LabelValue label="Número" value={cliente.Endereco[0].Numero} />
                  <LabelValue label="Bairro" value={cliente.Endereco[0].Bairro} />
                  <LabelValue label="Cidade" value={cliente.Endereco[0].Cidade} />
                  <LabelValue label="UF" value={cliente.Endereco[0].UF} />
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhum endereço cadastrado.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">Observações</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {cliente.Observacoes || "Nenhuma observação cadastrada."}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
