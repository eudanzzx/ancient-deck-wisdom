
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
    <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 relative overflow-hidden">
      {/* Decorative background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardTitle className="flex items-center gap-3 text-blue-600 relative z-10">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
          Controle de Pagamentos do Plano
        </span>
        <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
      </CardTitle>
      
      <div className="flex items-center gap-6 text-sm text-slate-600 relative z-10 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <span className="font-medium">Total: {planoData.meses} meses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          <span className="font-medium">Valor mensal: R$ {parseFloat(planoData.valorMensal).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          <span className="text-orange-700 font-semibold text-xs uppercase tracking-wide">Vencimento: Todo dia 30</span>
        </div>
      </div>
    </CardHeader>
  );
};

export default PlanoVisualizerHeader;
