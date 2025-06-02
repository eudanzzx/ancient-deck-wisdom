
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Calendar } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { toast } from "sonner";

interface SemanalPaymentControlProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
  };
  startDate: string;
}

const SemanalPaymentControl: React.FC<SemanalPaymentControlProps> = ({
  analysisId,
  clientName,
  semanalData,
  startDate
}) => {
  const [payments, setPayments] = useState<boolean[]>([]);
  const { getSemanalPayments, saveSemanalPayments } = useUserDataService();

  const totalWeeks = parseInt(semanalData.semanas);
  const weeklyValue = parseFloat(semanalData.valorSemanal);

  useEffect(() => {
    const savedPayments = getSemanalPayments(analysisId);
    if (savedPayments && savedPayments.length > 0) {
      setPayments(savedPayments);
    } else {
      setPayments(new Array(totalWeeks).fill(false));
    }
  }, [analysisId, totalWeeks]);

  const togglePayment = (weekIndex: number) => {
    const newPayments = [...payments];
    newPayments[weekIndex] = !newPayments[weekIndex];
    setPayments(newPayments);
    saveSemanalPayments(analysisId, newPayments);
    
    const weekNumber = weekIndex + 1;
    const action = newPayments[weekIndex] ? "pago" : "pendente";
    
    toast.success(`Semana ${weekNumber} marcada como ${action}`, {
      description: `${clientName} - R$ ${weeklyValue.toFixed(2)}`
    });
  };

  const getWeekDate = (weekIndex: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + ((weekIndex + 1) * 7));
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const paidCount = payments.filter(p => p).length;
  const progressPercentage = (paidCount / totalWeeks) * 100;
  const totalValue = totalWeeks * weeklyValue;
  const paidValue = paidCount * weeklyValue;

  return (
    <Card className="mt-4 border-[#0EA5E9]/20 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-[#0EA5E9]/5 to-[#0EA5E9]/10">
        <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
          <Calendar className="h-5 w-5" />
          Controle Semanal - {clientName}
          <Badge variant="secondary" className="bg-[#0EA5E9]/10 text-[#0EA5E9] ml-2">
            {paidCount}/{totalWeeks}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Total: {totalWeeks} semanas</span>
          <span>Valor semanal: R$ {weeklyValue.toFixed(2)}</span>
          <span className="font-medium text-emerald-600">
            R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="mt-3 h-3 bg-slate-200" 
        />
        <div className="text-xs text-slate-500 mt-1">
          {progressPercentage.toFixed(0)}% concluído
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: totalWeeks }, (_, index) => (
            <Button
              key={index}
              onClick={() => togglePayment(index)}
              variant="outline"
              className={`
                relative h-auto min-h-[120px] p-4 flex flex-col items-center justify-center gap-3 
                transition-all duration-300 hover:scale-105 hover:shadow-xl group
                border-2 rounded-xl overflow-hidden
                ${payments[index]
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400 shadow-emerald-200/50' 
                  : 'bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 border-slate-300 text-slate-700 shadow-slate-200/50 hover:border-[#0EA5E9]/50'
                }
              `}
            >
              {/* Background decoration */}
              <div className={`
                absolute inset-0 opacity-10 transition-opacity duration-300
                ${payments[index]
                  ? 'bg-gradient-to-br from-white/20 to-transparent' 
                  : 'bg-gradient-to-br from-[#0EA5E9]/10 to-transparent group-hover:opacity-20'
                }
              `} />
              
              {/* Status icon */}
              <div className={`
                absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300
                ${payments[index]
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 text-slate-500 group-hover:bg-[#0EA5E9]/20 group-hover:text-[#0EA5E9]'
                }
              `}>
                {payments[index] ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </div>
              
              {/* Week number */}
              <div className="relative z-10 text-center">
                <div className={`
                  text-2xl font-bold mb-1 transition-colors duration-300
                  ${payments[index] ? 'text-white' : 'text-slate-700 group-hover:text-[#0EA5E9]'}
                `}>
                  {index + 1}ª
                </div>
                <div className={`
                  text-xs font-medium uppercase tracking-wider
                  ${payments[index] ? 'text-white/90' : 'text-slate-500 group-hover:text-[#0EA5E9]/80'}
                `}>
                  Semana
                </div>
              </div>
              
              {/* Due date */}
              <div className="relative z-10 text-center">
                <div className={`
                  text-xs opacity-75 mb-1 transition-colors duration-300
                  ${payments[index] ? 'text-white/80' : 'text-slate-500'}
                `}>
                  Data
                </div>
                <div className={`
                  text-sm font-medium transition-colors duration-300
                  ${payments[index] ? 'text-white' : 'text-slate-600 group-hover:text-[#0EA5E9]'}
                `}>
                  {getWeekDate(index)}
                </div>
              </div>
              
              {/* Status badge */}
              <Badge 
                variant="outline"
                className={`
                  relative z-10 text-xs font-medium border transition-all duration-300
                  ${payments[index]
                    ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                    : 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:border-red-300'
                  }
                `}
              >
                {payments[index] ? 'Pago' : 'Pendente'}
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
              {paidCount}/{totalWeeks} pagas
            </Badge>
            <div className="text-sm text-slate-600">
              <span className="font-medium">
                R$ {paidValue.toFixed(2)}
              </span>
              <span className="text-slate-500"> / R$ {totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemanalPaymentControl;
