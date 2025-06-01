
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Check } from "lucide-react";
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {planoMonths.map((month, index) => (
            <div
              key={month.month}
              onClick={() => handlePaymentToggle(index)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${month.isPaid 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-400 shadow-green-200/50' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 shadow-red-200/50'
                }
              `}
            >
              {month.isPaid && (
                <div className="absolute top-2 right-2">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              )}
              
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700 mb-1">
                  Mês {month.month}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  Vencimento
                </div>
                <div className="text-sm font-medium text-slate-600">
                  {formatDate(month.dueDate)}
                </div>
                <div className={`
                  mt-3 px-3 py-1 rounded-full text-xs font-medium
                  ${month.isPaid 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-red-200 text-red-800'
                  }
                `}>
                  {month.isPaid ? 'Pago' : 'Pendente'}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
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
