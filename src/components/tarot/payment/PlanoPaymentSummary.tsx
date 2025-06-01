
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PlanoPaymentSummaryProps {
  paidCount: number;
  totalMonths: number;
  paidValue: number;
  totalValue: number;
}

const PlanoPaymentSummary: React.FC<PlanoPaymentSummaryProps> = ({
  paidCount,
  totalMonths,
  paidValue,
  totalValue,
}) => {
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
      </div>
      
      <div className="flex items-center gap-3">
        <Badge 
          variant="secondary" 
          className="bg-[#6B21A8]/10 text-[#6B21A8] border border-[#6B21A8]/20 font-medium px-3 py-1"
        >
          {paidCount}/{totalMonths} pagos
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

export default PlanoPaymentSummary;
