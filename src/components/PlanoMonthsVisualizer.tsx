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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {planoMonths.map((month, index) => (
            <Button
              key={month.month}
              onClick={() => handlePaymentToggle(index)}
              variant={month.isPaid ? "default" : "outline"}
              className={`
                h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${month.isPaid 
                  ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200/50' 
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-300 text-slate-700 shadow-slate-200/50'
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-bold">
                  Mês {month.month}
                </span>
                {month.isPaid ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <X className="h-4 w-4 opacity-50" />
                )}
              </div>
              
              <div className="text-center w-full">
                <div className="text-xs opacity-75 mb-1">
                  Vencimento
                </div>
                <div className="text-sm font-medium">
                  {formatDate(month.dueDate)}
                </div>
              </div>
              
              <Badge 
                variant={month.isPaid ? "secondary" : "outline"}
                className={`
                  text-xs font-medium
                  ${month.isPaid 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-red-100 text-red-800 border-red-200'
                  }
                `}
              >
                {month.isPaid ? 'Pago' : 'Pendente'}
              </Badge>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-slate-600">Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-400 rounded"></div>
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
