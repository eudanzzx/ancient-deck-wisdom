
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

interface PlanoMonthCardProps {
  month: PlanoMonth;
  index: number;
  onToggle: (index: number) => void;
}

const PlanoMonthCard: React.FC<PlanoMonthCardProps> = ({
  month,
  index,
  onToggle,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Button
      onClick={() => onToggle(index)}
      variant="outline"
      className={`
        relative h-auto min-h-[120px] p-4 flex flex-col items-center justify-center gap-3 
        transition-all duration-300 hover:scale-105 hover:shadow-xl group
        border-2 rounded-xl overflow-hidden
        ${month.isPaid 
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400 shadow-emerald-200/50' 
          : 'bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 border-slate-300 text-slate-700 shadow-slate-200/50 hover:border-[#6B21A8]/50'
        }
      `}
    >
      {/* Background decoration */}
      <div className={`
        absolute inset-0 opacity-10 transition-opacity duration-300
        ${month.isPaid 
          ? 'bg-gradient-to-br from-white/20 to-transparent' 
          : 'bg-gradient-to-br from-[#6B21A8]/10 to-transparent group-hover:opacity-20'
        }
      `} />
      
      {/* Status icon */}
      <div className={`
        absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300
        ${month.isPaid 
          ? 'bg-white/20 text-white' 
          : 'bg-slate-200 text-slate-500 group-hover:bg-[#6B21A8]/20 group-hover:text-[#6B21A8]'
        }
      `}>
        {month.isPaid ? (
          <Check className="h-4 w-4" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </div>
      
      {/* Month number */}
      <div className="relative z-10 text-center">
        <div className={`
          text-2xl font-bold mb-1 transition-colors duration-300
          ${month.isPaid ? 'text-white' : 'text-slate-700 group-hover:text-[#6B21A8]'}
        `}>
          {month.month}º
        </div>
        <div className={`
          text-xs font-medium uppercase tracking-wider
          ${month.isPaid ? 'text-white/90' : 'text-slate-500 group-hover:text-[#6B21A8]/80'}
        `}>
          Mês
        </div>
      </div>
      
      {/* Due date */}
      <div className="relative z-10 text-center">
        <div className={`
          text-xs opacity-75 mb-1 transition-colors duration-300
          ${month.isPaid ? 'text-white/80' : 'text-slate-500'}
        `}>
          Vencimento
        </div>
        <div className={`
          text-sm font-medium transition-colors duration-300
          ${month.isPaid ? 'text-white' : 'text-slate-600 group-hover:text-[#6B21A8]'}
        `}>
          {formatDate(month.dueDate)}
        </div>
      </div>
      
      {/* Status badge */}
      <Badge 
        variant="outline"
        className={`
          relative z-10 text-xs font-medium border transition-all duration-300
          ${month.isPaid 
            ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
            : 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:border-red-300'
          }
        `}
      >
        {month.isPaid ? 'Pago' : 'Pendente'}
      </Badge>
    </Button>
  );
};

export default PlanoMonthCard;
