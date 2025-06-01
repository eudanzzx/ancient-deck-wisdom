
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Check, X } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

interface PlanoMonthsVisualizerProps {
  atendimento: {
    id: string;
    nome: string;
    planoAtivo?: boolean;
    planoData?: {
      meses: string;
      valorMensal: string;
    } | null;
    dataAtendimento: string;
  };
}

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  planoId?: string;
}

const PlanoMonthsVisualizer: React.FC<PlanoMonthsVisualizerProps> = ({ atendimento }) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoMonths, setPlanoMonths] = useState<PlanoMonth[]>([]);

  useEffect(() => {
    if (atendimento.planoAtivo && atendimento.planoData) {
      initializePlanoMonths();
    }
  }, [atendimento]);

  const initializePlanoMonths = () => {
    if (!atendimento.planoData || !atendimento.dataAtendimento) return;

    // Validate the date before using it
    const startDate = new Date(atendimento.dataAtendimento);
    if (isNaN(startDate.getTime())) {
      console.error('Invalid date provided:', atendimento.dataAtendimento);
      toast.error('Data de atendimento inválida');
      return;
    }

    const totalMonths = parseInt(atendimento.planoData.meses);
    if (isNaN(totalMonths) || totalMonths <= 0) {
      console.error('Invalid number of months:', atendimento.planoData.meses);
      return;
    }

    const planos = getPlanos();
    
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Verificar se este mês já foi pago
      const planoForMonth = planos.find(plano => 
        plano.clientName === atendimento.nome && 
        plano.month === i && 
        plano.totalMonths === totalMonths
      );
      
      months.push({
        month: i,
        isPaid: planoForMonth ? !planoForMonth.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        planoId: planoForMonth?.id
      });
    }
    
    setPlanoMonths(months);
  };

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    
    if (month.planoId) {
      // Atualizar o status do plano existente
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: month.isPaid } // Se estava pago, volta a ser ativo
          : plano
      );
      savePlanos(updatedPlanos);
    }
    
    // Atualizar o estado local
    const updatedMonths = [...planoMonths];
    updatedMonths[monthIndex].isPaid = !month.isPaid;
    setPlanoMonths(updatedMonths);
    
    toast.success(
      !month.isPaid 
        ? `Mês ${month.month} marcado como pago` 
        : `Mês ${month.month} marcado como pendente`
    );
  };

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

  if (!atendimento.planoAtivo || !atendimento.planoData) {
    return null;
  }

  return (
    <Card className="mt-4 border-[#0EA5E9]/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#0EA5E9]/5 to-[#0EA5E9]/10">
        <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
          <CreditCard className="h-5 w-5" />
          Controle de Pagamentos do Plano
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Total: {atendimento.planoData.meses} meses</span>
          <span>Valor mensal: R$ {parseFloat(atendimento.planoData.valorMensal).toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {planoMonths.map((month, index) => (
            <Button
              key={month.month}
              onClick={() => handlePaymentToggle(index)}
              variant="outline"
              className={`
                relative h-auto min-h-[120px] p-4 flex flex-col items-center justify-center gap-3 
                transition-all duration-300 hover:scale-105 hover:shadow-xl group
                border-2 rounded-xl overflow-hidden
                ${month.isPaid 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400 shadow-emerald-200/50' 
                  : 'bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 border-slate-300 text-slate-700 shadow-slate-200/50 hover:border-[#0EA5E9]/50'
                }
              `}
            >
              {/* Background decoration */}
              <div className={`
                absolute inset-0 opacity-10 transition-opacity duration-300
                ${month.isPaid 
                  ? 'bg-gradient-to-br from-white/20 to-transparent' 
                  : 'bg-gradient-to-br from-[#0EA5E9]/10 to-transparent group-hover:opacity-20'
                }
              `} />
              
              {/* Status icon */}
              <div className={`
                absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300
                ${month.isPaid 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 text-slate-500 group-hover:bg-[#0EA5E9]/20 group-hover:text-[#0EA5E9]'
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
                  ${month.isPaid ? 'text-white' : 'text-slate-700 group-hover:text-[#0EA5E9]'}
                `}>
                  {month.month}º
                </div>
                <div className={`
                  text-xs font-medium uppercase tracking-wider
                  ${month.isPaid ? 'text-white/90' : 'text-slate-500 group-hover:text-[#0EA5E9]/80'}
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
                  ${month.isPaid ? 'text-white' : 'text-slate-600 group-hover:text-[#0EA5E9]'}
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
          ))}
        </div>
        
        {/* Summary section */}
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
              className="bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 font-medium px-3 py-1"
            >
              {planoMonths.filter(m => m.isPaid).length}/{planoMonths.length} pagos
            </Badge>
            <div className="text-sm text-slate-600">
              <span className="font-medium">
                R$ {(planoMonths.filter(m => m.isPaid).length * parseFloat(atendimento.planoData?.valorMensal || '0')).toFixed(2)}
              </span>
              <span className="text-slate-500"> / R$ {(planoMonths.length * parseFloat(atendimento.planoData?.valorMensal || '0')).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanoMonthsVisualizer;
