
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";

interface SemanalPaymentControlProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
  };
  startDate: string;
}

interface SemanalWeek {
  week: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  semanalId?: string;
}

const SemanalPaymentControl: React.FC<SemanalPaymentControlProps> = ({
  analysisId,
  clientName,
  semanalData,
  startDate,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [semanalWeeks, setSemanalWeeks] = useState<SemanalWeek[]>([]);

  const getNextFriday = (fromDate: Date): Date => {
    const nextFriday = new Date(fromDate);
    const currentDay = nextFriday.getDay(); // 0 = domingo, 1 = segunda, ..., 5 = sexta, 6 = sábado
    
    // Calcular quantos dias faltam até sexta-feira (dia 5)
    let daysToAdd;
    if (currentDay === 5) {
      // Se a data é sexta, próxima sexta é em 7 dias
      daysToAdd = 7;
    } else if (currentDay < 5) {
      // Se é antes de sexta na semana atual
      daysToAdd = 5 - currentDay;
    } else {
      // Se é sábado (6) ou domingo (0), próxima sexta
      daysToAdd = currentDay === 6 ? 6 : 5;
    }
    
    nextFriday.setDate(nextFriday.getDate() + daysToAdd);
    return nextFriday;
  };

  useEffect(() => {
    initializeSemanalWeeks();
  }, [analysisId, semanalData, startDate]);

  const initializeSemanalWeeks = () => {
    const totalWeeks = parseInt(semanalData.semanas);
    const baseDate = new Date(startDate);
    const planos = getPlanos();
    
    const weeks: SemanalWeek[] = [];
    
    for (let i = 1; i <= totalWeeks; i++) {
      // Primeira sexta-feira após a data de início
      let dueDate;
      if (i === 1) {
        dueDate = getNextFriday(baseDate);
      } else {
        // Para semanas subsequentes, adicionar 7 dias para cada semana adicional
        const previousWeekDate = getNextFriday(baseDate);
        previousWeekDate.setDate(previousWeekDate.getDate() + ((i - 1) * 7));
        dueDate = previousWeekDate;
      }
      
      const semanalForWeek = planos.find((plano): plano is PlanoSemanal => 
        plano.id.startsWith(`${analysisId}-week-${i}`) && plano.type === 'semanal'
      );
      
      weeks.push({
        week: i,
        isPaid: semanalForWeek ? !semanalForWeek.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentDate: semanalForWeek?.created ? new Date(semanalForWeek.created).toISOString().split('T')[0] : undefined,
        semanalId: semanalForWeek?.id
      });
    }
    
    setSemanalWeeks(weeks);
  };

  const handlePaymentToggle = (weekIndex: number) => {
    const week = semanalWeeks[weekIndex];
    const planos = getPlanos();
    
    const newIsPaid = !week.isPaid;
    
    if (week.semanalId) {
      const updatedPlanos = planos.map(plano => 
        plano.id === week.semanalId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      savePlanos(updatedPlanos);
    } else if (newIsPaid) {
      const newSemanal: PlanoSemanal = {
        id: `${analysisId}-week-${week.week}`,
        clientName: clientName,
        type: 'semanal',
        amount: parseFloat(semanalData.valorSemanal),
        dueDate: week.dueDate,
        week: week.week,
        totalWeeks: parseInt(semanalData.semanas),
        created: new Date().toISOString(),
        active: false
      };
      
      const updatedPlanos = [...planos, newSemanal];
      savePlanos(updatedPlanos);
      
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].semanalId = newSemanal.id;
      updatedWeeks[weekIndex].isPaid = true;
      setSemanalWeeks(updatedWeeks);
    } else {
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = false;
      setSemanalWeeks(updatedWeeks);
    }
    
    if (week.semanalId || !newIsPaid) {
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = newIsPaid;
      setSemanalWeeks(updatedWeeks);
    }
    
    toast.success(
      newIsPaid 
        ? `Semana ${week.week} marcada como paga` 
        : `Semana ${week.week} marcada como pendente`
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const paidCount = semanalWeeks.filter(w => w.isPaid).length;
  const totalValue = semanalWeeks.length * parseFloat(semanalData.valorSemanal);
  const paidValue = paidCount * parseFloat(semanalData.valorSemanal);

  return (
    <Card className="mt-4 border-[#10B981]/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10">
        <CardTitle className="flex items-center gap-2 text-[#10B981]">
          <Calendar className="h-5 w-5" />
          Controle de Pagamentos Semanal - Vencimento toda Sexta-feira
          <Badge variant="secondary" className="bg-[#10B981]/10 text-[#10B981] ml-2">
            {paidCount}/{semanalWeeks.length}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Total: {semanalData.semanas} semanas</span>
          <span>Valor semanal: R$ {parseFloat(semanalData.valorSemanal).toFixed(2)}</span>
          <span className="font-medium text-emerald-600">
            R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {semanalWeeks.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-32 mx-auto"></div>
            </div>
            <p className="mt-4">Carregando semanas...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {semanalWeeks.map((week, index) => (
                <Button
                  key={week.week}
                  onClick={() => handlePaymentToggle(index)}
                  variant="outline"
                  className={`
                    relative h-auto min-h-[120px] p-4 flex flex-col items-center justify-center gap-3 
                    transition-all duration-300 hover:scale-105 hover:shadow-xl group
                    border-2 rounded-xl overflow-hidden
                    ${week.isPaid 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400 shadow-emerald-200/50' 
                      : 'bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 border-slate-300 text-slate-700 shadow-slate-200/50 hover:border-[#10B981]/50'
                    }
                  `}
                >
                  <div className={`
                    absolute inset-0 opacity-10 transition-opacity duration-300
                    ${week.isPaid 
                      ? 'bg-gradient-to-br from-white/20 to-transparent' 
                      : 'bg-gradient-to-br from-[#10B981]/10 to-transparent group-hover:opacity-20'
                    }
                  `} />
                  
                  <div className={`
                    absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300
                    ${week.isPaid 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 text-slate-500 group-hover:bg-[#10B981]/20 group-hover:text-[#10B981]'
                    }
                  `}>
                    {week.isPaid ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <div className={`
                      text-2xl font-bold mb-1 transition-colors duration-300
                      ${week.isPaid ? 'text-white' : 'text-slate-700 group-hover:text-[#10B981]'}
                    `}>
                      {week.week}ª
                    </div>
                    <div className={`
                      text-xs font-medium uppercase tracking-wider
                      ${week.isPaid ? 'text-white/90' : 'text-slate-500 group-hover:text-[#10B981]/80'}
                    `}>
                      Semana
                    </div>
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <div className={`
                      text-xs opacity-75 mb-1 transition-colors duration-300
                      ${week.isPaid ? 'text-white/80' : 'text-slate-500'}
                    `}>
                      Sexta-feira
                    </div>
                    <div className={`
                      text-sm font-medium transition-colors duration-300
                      ${week.isPaid ? 'text-white' : 'text-slate-600 group-hover:text-[#10B981]'}
                    `}>
                      {formatDate(week.dueDate)}
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline"
                    className={`
                      relative z-10 text-xs font-medium border transition-all duration-300
                      ${week.isPaid 
                        ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                        : 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:border-red-300'
                      }
                    `}
                  >
                    {week.isPaid ? 'Pago' : 'Pendente'}
                  </Badge>
                </Button>
              ))}
            </div>
            
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
                  className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-medium px-3 py-1"
                >
                  {paidCount}/{semanalWeeks.length} pagas
                </Badge>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">
                    R$ {paidValue.toFixed(2)}
                  </span>
                  <span className="text-slate-500"> / R$ {totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SemanalPaymentControl;
