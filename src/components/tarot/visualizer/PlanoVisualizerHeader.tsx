
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Sparkles } from "lucide-react";

interface PlanoVisualizerHeaderProps {
  planoData: {
    meses: string;
    valorMensal: string;
  };
}

const PlanoVisualizerHeader: React.FC<PlanoVisualizerHeaderProps> = ({
  planoData,
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 relative overflow-hidden border-b border-purple-200/30">
      {/* Decorative background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardTitle className="flex items-center gap-3 text-purple-600 relative z-10">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-lg">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
          Controle de Pagamentos do Plano
        </span>
        <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
      </CardTitle>
      
      <div className="flex items-center gap-6 text-sm text-slate-600 relative z-10 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Total: {planoData.meses} semanas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          <span className="font-medium">Valor semanal: R$ {parseFloat(planoData.valorMensal).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          <span className="text-orange-700 font-semibold text-xs uppercase tracking-wide">Vencimento: Toda segunda-feira</span>
        </div>
      </div>
    </CardHeader>
  );
};

export default PlanoVisualizerHeader;
