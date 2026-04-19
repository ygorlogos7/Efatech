"use client";

import React from "react";
import { BarChart2, TrendingUp, TrendingDown, Filter } from "lucide-react";

export default function DREPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">DRE Gerencial</h2>
        <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md border border-gray-200 transition-colors">
          <Filter className="w-4 h-4" /> Filtrar Período
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Receita Bruta</p>
              <h3 className="text-2xl font-bold text-green-600">R$ 0,00</h3>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Despesas Operacionais</p>
              <h3 className="text-2xl font-bold text-red-500">R$ 0,00</h3>
            </div>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lucro Líquido</p>
              <h3 className="text-2xl font-bold text-blue-600">R$ 0,00</h3>
            </div>
            <BarChart2 className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Margem de Lucro</p>
              <h3 className="text-2xl font-bold text-gray-900">0%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold">%</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="font-bold text-gray-700">Demonstrativo de Resultados</h4>
        </div>
        <div className="p-0">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-blue-50/30"><td className="py-3 px-6 font-bold uppercase">1. RECEITA OPERACIONAL BRUTA</td><td className="py-3 px-6 text-right font-bold">R$ 0,00</td></tr>
              <tr><td className="py-3 px-10 text-gray-600">1.1 Vendas de Produtos</td><td className="py-3 px-6 text-right">R$ 0,00</td></tr>
              <tr><td className="py-3 px-10 text-gray-600">1.2 Prestação de Serviços</td><td className="py-3 px-6 text-right">R$ 0,00</td></tr>
              <tr className="bg-red-50/30"><td className="py-3 px-6 font-bold uppercase">2. DEDUÇÕES DA RECEITA BRUTA</td><td className="py-3 px-6 text-right font-bold text-red-600">(R$ 0,00)</td></tr>
              <tr className="bg-gray-100/50"><td className="py-3 px-6 font-bold uppercase">3. RECEITA OPERACIONAL LÍQUIDA</td><td className="py-3 px-6 text-right font-bold">R$ 0,00</td></tr>
              <tr className="bg-red-50/30"><td className="py-3 px-6 font-bold uppercase">4. CUSTOS DAS VENDAS (CPV/CSP)</td><td className="py-3 px-6 text-right font-bold text-red-600">(R$ 0,00)</td></tr>
              <tr className="bg-blue-50/50"><td className="py-3 px-6 font-bold uppercase">5. RESULTADO OPERACIONAL BRUTO (LUCRO BRUTO)</td><td className="py-3 px-6 text-right font-bold text-green-700">R$ 0,00</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
