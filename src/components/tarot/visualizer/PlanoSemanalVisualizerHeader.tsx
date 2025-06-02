
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles } from "lucide-react";

interface PlanoSemanalVisualizerHeaderProps {
  planoSemanalData: {
    semanas: string;
    valorSemanal: string;
  };
}

const PlanoSemanalVisualizerHeader: React.FC<PlanoSemanalVisualizerHeaderProps> = ({
  planoSemanalData,
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 relative overflow-hidden border-b border-blue-200/30">
      {/* Decorative background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardTitle className="flex items-center gap-3 text-blue-600 relative z-10">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
          Controle de Pagamentos Semanais
        </span>
        <Sparkles className="h-4 w-4 text-cyan-500 animate-pulse" />
      </CardTitle>
      
      <div className="flex items-center gap-6 text-sm text-slate-600 relative z-10 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Total: {planoSemanalData.semanas} semanas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          <span className="font-medium">Valor semanal: R$ {parseFloat(planoSemanalData.valorSemanal).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          <span className="text-orange-700 font-semibold text-xs uppercase tracking-wide">Vencimento: Toda segunda-feira</span>
        </div>
      </div>
    </CardHeader>
  );
};

export default PlanoSemanalVisualizerHeader;
