import React from "react";
import { FileText } from "lucide-react";

export default function OSCamposExtrasPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Campos Extras — O.S.</h2>
      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-16 text-center text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <h5 className="text-lg font-medium text-gray-700">Nenhum campo extra configurado.</h5>
        <p className="text-sm text-gray-400 mt-1">Use esta seção para adicionar campos personalizados às ordens de serviço.</p>
      </div>
    </div>
  );
}
