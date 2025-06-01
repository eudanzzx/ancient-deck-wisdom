
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, CreditCard } from "lucide-react";
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
    if (!atendimento.planoData) return;

    const totalMonths = parseInt(atendimento.planoData.meses);
    const startDate = new Date(atendimento.dataAtendimento);
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

  const togglePayment = (monthIndex: number) => {
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
      
      // Atualizar o estado local
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = !month.isPaid;
      setPlanoMonths(updatedMonths);
      
      toast.success(
        month.isPaid 
          ? `Mês ${month.month} marcado como pendente` 
          : `Mês ${month.month} marcado como pago`
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (!atendimento.planoAtivo || !atendimento.planoData) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
          <CreditCard className="h-5 w-5" />
          Controle de Pagamentos do Plano
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Total: {atendimento.planoData.meses} meses</span>
          <span>Valor mensal: R$ {parseFloat(atendimento.planoData.valorMensal).toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {planoMonths.map((month, index) => (
            <div
              key={month.month}
              className="flex flex-col items-center"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePayment(index)}
                className={`w-12 h-12 p-0 border-2 ${
                  month.isPaid
                    ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'
                }`}
              >
                {month.isPaid ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
              <span className="text-xs mt-1 text-center">
                Mês {month.month}
              </span>
              <span className="text-xs text-slate-500 text-center">
                {formatDate(month.dueDate)}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-slate-600">Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-slate-600">Pendente</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {planoMonths.filter(m => m.isPaid).length}/{planoMonths.length} pagos
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanoMonthsVisualizer;
