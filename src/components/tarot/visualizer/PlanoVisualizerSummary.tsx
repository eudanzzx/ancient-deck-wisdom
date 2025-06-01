
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock } from "lucide-react";

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
  const progressPercentage = (paidCount / planoMonths.length) * 100;

  return (
    <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-slate-200 to-transparent relative">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Progresso do Plano</span>
          <span className="text-sm font-bold text-slate-800">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg animate-pulse"></div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors duration-200">
              Pago
            </span>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full shadow-lg"></div>
              <Clock className="h-4 w-4 text-slate-500" />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-600 transition-colors duration-200">
              Pendente
            </span>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200/50">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700 tracking-wide">Vencimento: Dia 30</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border border-blue-500/20 font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {paidCount}/{planoMonths.length} pagos
          </Badge>
          
          <div className="text-right space-y-1">
            <div className="text-sm text-slate-500 font-medium">Progresso Financeiro</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                R$ {paidValue.toFixed(2)}
              </span>
              <span className="text-slate-400 font-medium">/ R$ {totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanoVisualizerSummary;
