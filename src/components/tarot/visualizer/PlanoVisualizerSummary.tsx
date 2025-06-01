
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  planoId?: string;
}

interface PlanoVisualizerSummaryProps {
  planoMonths: PlanoMonth[];
  planoData: {
    meses: string;
    valorMensal: string;
  };
}

const PlanoVisualizerSummary: React.FC<PlanoVisualizerSummaryProps> = ({
  planoMonths,
  planoData,
}) => {
  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-slate-700">Pago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-slate-700">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-600">Vencimento: Dia 30</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge 
          variant="secondary" 
          className="bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 font-medium px-3 py-1"
        >
          {paidCount}/{planoMonths.length} pagos
        </Badge>
        <div className="text-sm text-slate-600">
          <span className="font-medium">
            R$ {paidValue.toFixed(2)}
          </span>
          <span className="text-slate-500"> / R$ {totalValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PlanoVisualizerSummary;
