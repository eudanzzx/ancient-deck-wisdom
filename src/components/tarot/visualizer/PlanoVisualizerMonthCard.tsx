
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, CalendarDays } from "lucide-react";

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  planoId?: string;
}

interface PlanoVisualizerMonthCardProps {
  month: PlanoMonth;
  index: number;
  onToggle: (index: number) => void;
}

const PlanoVisualizerMonthCard: React.FC<PlanoVisualizerMonthCardProps> = ({
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
        relative h-auto min-h-[140px] p-6 flex flex-col items-center justify-center gap-4 
        transition-all duration-500 hover:scale-110 hover:shadow-2xl group
        border-2 rounded-2xl overflow-hidden backdrop-blur-sm
        ${month.isPaid 
          ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white border-emerald-300 shadow-emerald-300/50 hover:shadow-emerald-400/60' 
          : 'bg-gradient-to-br from-white via-slate-50 to-white hover:from-slate-50 hover:via-white hover:to-slate-50 border-slate-300 text-slate-700 shadow-slate-300/50 hover:border-blue-400/60 hover:shadow-blue-300/40'
        }
      `}
    >
      {/* Animated background decoration */}
      <div className={`
        absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30
        ${month.isPaid 
          ? 'bg-gradient-to-br from-white/30 via-transparent to-white/10' 
          : 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10'
        }
      `} />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
      </div>
      
      {/* Status icon with enhanced styling */}
      <div className={`
        absolute top-4 right-4 p-2 rounded-full transition-all duration-500 shadow-lg group-hover:scale-110
        ${month.isPaid 
          ? 'bg-white/25 text-white backdrop-blur-sm' 
          : 'bg-slate-200 text-slate-500 group-hover:bg-blue-500/20 group-hover:text-blue-600'
        }
      `}>
        {month.isPaid ? (
          <Check className="h-5 w-5" />
        ) : (
          <X className="h-5 w-5" />
        )}
      </div>
      
      {/* Month number with enhanced typography */}
      <div className="relative z-10 text-center space-y-2">
        <div className={`
          text-3xl font-bold mb-1 transition-all duration-500 group-hover:scale-110
          ${month.isPaid 
            ? 'text-white drop-shadow-lg' 
            : 'bg-gradient-to-r from-slate-700 via-blue-700 to-slate-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-600'
          }
        `}>
          {month.month}º
        </div>
        <div className={`
          text-xs font-bold uppercase tracking-widest
          ${month.isPaid 
            ? 'text-white/90' 
            : 'text-slate-500 group-hover:text-blue-600/80'
          }
        `}>
          Mês
        </div>
      </div>
      
      {/* Due date with icon */}
      <div className="relative z-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className={`h-4 w-4 ${month.isPaid ? 'text-white/80' : 'text-slate-500'}`} />
          <div className={`
            text-xs font-medium tracking-wide
            ${month.isPaid ? 'text-white/80' : 'text-slate-500'}
          `}>
            Vencimento
          </div>
        </div>
        <div className={`
          text-sm font-bold transition-colors duration-300
          ${month.isPaid 
            ? 'text-white' 
            : 'text-slate-600 group-hover:text-blue-600'
          }
        `}>
          {formatDate(month.dueDate)}
        </div>
      </div>
      
      {/* Enhanced status badge */}
      <Badge 
        variant="outline"
        className={`
          relative z-10 text-xs font-bold border-2 transition-all duration-500 px-4 py-1 shadow-lg group-hover:scale-105
          ${month.isPaid 
            ? 'bg-white/20 text-white border-white/40 hover:bg-white/30 backdrop-blur-sm' 
            : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-red-300 group-hover:from-red-100 group-hover:to-orange-100 group-hover:border-red-400'
          }
        `}
      >
        {month.isPaid ? (
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Pago
          </div>
        ) : (
          'Pendente'
        )}
      </Badge>
      
      {/* Decorative corner elements */}
      {month.isPaid && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent rounded-br-2xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-white/20 to-transparent rounded-tl-2xl"></div>
        </>
      )}
    </Button>
  );
};

export default PlanoVisualizerMonthCard;
