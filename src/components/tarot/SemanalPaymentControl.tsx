
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card className="mt-4 bg-white/90 backdrop-blur-sm border border-[#0EA5E9]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
          <Calendar className="h-5 w-5" />
          Controle Semanal - {clientName}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Total: {totalWeeks} semanas</span>
          <span>Valor semanal: R$ {weeklyValue.toFixed(2)}</span>
          <Badge variant="secondary" className="bg-[#0EA5E9]/10 text-[#0EA5E9]">
            {paidCount}/{totalWeeks} pagas
          </Badge>
          <Badge variant="outline" className="border-emerald-300 text-emerald-600">
            {progressPercentage.toFixed(0)}% concluído
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {Array.from({ length: totalWeeks }, (_, index) => (
            <div key={index} className="flex flex-col items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePayment(index)}
                className={`w-12 h-12 p-0 border-2 transition-all duration-200 ${
                  payments[index]
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-rose-100 border-rose-500 text-rose-700 hover:bg-rose-200'
                }`}
              >
                {payments[index] ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
              <span className="text-xs mt-1 text-center font-medium">
                Sem {index + 1}
              </span>
              <span className="text-xs text-slate-500 text-center">
                {getWeekDate(index)}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-sm text-slate-600">Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded"></div>
              <span className="text-sm text-slate-600">Pendente</span>
            </div>
          </div>
          
          <div className="text-sm text-slate-600">
            Total pago: R$ {(paidCount * weeklyValue).toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemanalPaymentControl;
