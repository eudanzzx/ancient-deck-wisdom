
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import PlanoVisualizerHeader from "@/components/tarot/visualizer/PlanoVisualizerHeader";
import PlanoVisualizerMonthCard from "@/components/tarot/visualizer/PlanoVisualizerMonthCard";
import PlanoVisualizerSummary from "@/components/tarot/visualizer/PlanoVisualizerSummary";

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
    data?: string;
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
      checkNotifications();
    }
  }, [atendimento]);

  const initializePlanoMonths = () => {
    if (!atendimento.planoData) {
      return;
    }

    let startDateString = atendimento.dataAtendimento;
    if (!startDateString || startDateString.trim() === '') {
      startDateString = atendimento.data || new Date().toISOString();
    }

    const startDate = new Date(startDateString);
    if (isNaN(startDate.getTime())) {
      console.error('Invalid date provided:', startDateString);
      toast.error('Data de atendimento inválida');
      return;
    }

    const totalMonths = parseInt(atendimento.planoData.meses);
    if (isNaN(totalMonths) || totalMonths <= 0) {
      console.error('Invalid number of months:', atendimento.planoData.meses);
      toast.error('Número de meses inválido');
      return;
    }

    const planos = getPlanos();
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      // Sempre vencer no dia 30 do mês
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDate.setDate(30);
      
      // Ajustar para meses com menos de 30 dias
      if (dueDate.getDate() !== 30) {
        dueDate.setDate(0); // Último dia do mês anterior
      }
      
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

  const checkNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar se hoje é dia 29 (um dia antes do vencimento)
    if (today.getDate() === 29) {
      planoMonths.forEach(month => {
        if (!month.isPaid) {
          const dueDate = new Date(month.dueDate);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Se amanhã for o vencimento
          if (dueDate.toDateString() === tomorrow.toDateString()) {
            toast.info(
              `⏰ Lembrete: ${atendimento.nome} tem um pagamento para fazer amanhã!`,
              {
                duration: 10000,
                description: `Mês ${month.month} - Valor: R$ ${parseFloat(atendimento.planoData?.valorMensal || '0').toFixed(2)} - Vence em ${dueDate.toLocaleDateString('pt-BR')}`,
                action: {
                  label: "Ver detalhes",
                  onClick: () => console.log("Detalhes do pagamento:", month)
                }
              }
            );
          }
        }
      });
    }
  };

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    
    const newIsPaid = !month.isPaid;
    
    if (month.planoId) {
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      savePlanos(updatedPlanos);
    } else if (newIsPaid) {
      const newPlano = {
        id: `${Date.now()}-${monthIndex}`,
        clientName: atendimento.nome,
        type: 'plano' as const,
        amount: parseFloat(atendimento.planoData?.valorMensal || '0'),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(atendimento.planoData?.meses || '0'),
        created: new Date().toISOString(),
        active: false
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);
    } else {
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = false;
      setPlanoMonths(updatedMonths);
    }
    
    if (month.planoId || !newIsPaid) {
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = newIsPaid;
      setPlanoMonths(updatedMonths);
    }
    
    toast.success(
      newIsPaid 
        ? `Mês ${month.month} marcado como pago` 
        : `Mês ${month.month} marcado como pendente`
    );
  };

  if (!atendimento.planoAtivo || !atendimento.planoData) {
    return null;
  }

  return (
    <Card className="mt-4 border-[#0EA5E9]/20 shadow-lg">
      <PlanoVisualizerHeader planoData={atendimento.planoData} />
      <CardContent className="p-6">
        {planoMonths.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-32 mx-auto"></div>
            </div>
            <p className="mt-4">Carregando meses do plano...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {planoMonths.map((month, index) => (
                <PlanoVisualizerMonthCard
                  key={month.month}
                  month={month}
                  index={index}
                  onToggle={handlePaymentToggle}
                />
              ))}
            </div>
            
            <PlanoVisualizerSummary 
              planoMonths={planoMonths}
              planoData={atendimento.planoData}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanoMonthsVisualizer;
