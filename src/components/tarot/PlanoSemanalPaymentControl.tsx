
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import PlanoSemanalVisualizerHeader from "./visualizer/PlanoSemanalVisualizerHeader";
import PlanoSemanalVisualizerWeekCard from "./visualizer/PlanoSemanalVisualizerWeekCard";
import PlanoVisualizerSummary from "./visualizer/PlanoVisualizerSummary";

interface PlanoSemanalPaymentControlProps {
  analysisId: string;
  clientName: string;
  planoSemanalData: {
    semanas: string;
    valorSemanal: string;
  };
  startDate: string;
}

interface PlanoWeek {
  week: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

const PlanoSemanalPaymentControl: React.FC<PlanoSemanalPaymentControlProps> = ({
  analysisId,
  clientName,
  planoSemanalData,
  startDate,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoWeeks, setPlanoWeeks] = useState<PlanoWeek[]>([]);

  useEffect(() => {
    initializePlanoWeeks();
    checkNotifications();
  }, [analysisId, planoSemanalData, startDate]);

  const initializePlanoWeeks = () => {
    const totalWeeks = parseInt(planoSemanalData.semanas);
    const baseDate = new Date(startDate);
    const planos = getPlanos();
    
    const weeks: PlanoWeek[] = [];
    
    for (let i = 1; i <= totalWeeks; i++) {
      // Vencer toda segunda-feira
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + (i * 7)); // Adicionar 7 dias por semana
      
      // Ajustar para a próxima segunda-feira se necessário
      const dayOfWeek = dueDate.getDay();
      if (dayOfWeek !== 1) { // Se não é segunda-feira (1)
        const daysUntilMonday = (1 + 7 - dayOfWeek) % 7;
        dueDate.setDate(dueDate.getDate() + daysUntilMonday);
      }
      
      const planoForWeek = planos.find(plano => 
        plano.id.startsWith(`${analysisId}-week-${i}`)
      );
      
      weeks.push({
        week: i,
        isPaid: planoForWeek ? !planoForWeek.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentDate: planoForWeek?.created ? new Date(planoForWeek.created).toISOString().split('T')[0] : undefined,
        planoId: planoForWeek?.id
      });
    }
    
    setPlanoWeeks(weeks);
  };

  const checkNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar se hoje é domingo (um dia antes do vencimento de segunda)
    if (today.getDay() === 0) { // Domingo
      planoWeeks.forEach(week => {
        if (!week.isPaid) {
          const dueDate = new Date(week.dueDate);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Se amanhã for o vencimento
          if (dueDate.toDateString() === tomorrow.toDateString()) {
            toast.info(
              `⏰ Lembrete: ${clientName} tem um pagamento semanal para fazer amanhã!`,
              {
                duration: 10000,
                description: `Semana ${week.week} - Valor: R$ ${parseFloat(planoSemanalData.valorSemanal).toFixed(2)} - Vence em ${dueDate.toLocaleDateString('pt-BR')}`,
                action: {
                  label: "Ver detalhes",
                  onClick: () => console.log("Detalhes do pagamento:", week)
                }
              }
            );
          }
        }
      });
    }
  };

  const handlePaymentToggle = (weekIndex: number) => {
    const week = planoWeeks[weekIndex];
    const planos = getPlanos();
    
    const newIsPaid = !week.isPaid;
    
    if (week.planoId) {
      const updatedPlanos = planos.map(plano => 
        plano.id === week.planoId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      savePlanos(updatedPlanos);
    } else if (newIsPaid) {
      const newPlano = {
        id: `${analysisId}-week-${week.week}`,
        clientName: clientName,
        type: 'planoSemanal' as const,
        amount: parseFloat(planoSemanalData.valorSemanal),
        dueDate: week.dueDate,
        week: week.week,
        totalWeeks: parseInt(planoSemanalData.semanas),
        created: new Date().toISOString(),
        active: false
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
      
      const updatedWeeks = [...planoWeeks];
      updatedWeeks[weekIndex].planoId = newPlano.id;
      updatedWeeks[weekIndex].isPaid = true;
      setPlanoWeeks(updatedWeeks);
    } else {
      const updatedWeeks = [...planoWeeks];
      updatedWeeks[weekIndex].isPaid = false;
      setPlanoWeeks(updatedWeeks);
    }
    
    if (week.planoId || !newIsPaid) {
      const updatedWeeks = [...planoWeeks];
      updatedWeeks[weekIndex].isPaid = newIsPaid;
      setPlanoWeeks(updatedWeeks);
    }
    
    toast.success(
      newIsPaid 
        ? `💫 Semana ${week.week} marcada como paga` 
        : `📋 Semana ${week.week} marcada como pendente`
    );
  };

  return (
    <Card className="mt-4 border-blue-200/30 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 backdrop-blur-sm overflow-hidden">
      <PlanoSemanalVisualizerHeader planoSemanalData={planoSemanalData} />
      
      <CardContent className="p-8">
        {planoWeeks.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gradient-to-r from-blue-200 via-slate-200 to-blue-200 rounded-xl w-64 mx-auto"></div>
              <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 rounded-lg w-40 mx-auto"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium">✨ Carregando semanas do plano...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {planoWeeks.map((week, index) => (
                <PlanoSemanalVisualizerWeekCard
                  key={week.week}
                  week={week}
                  index={index}
                  onToggle={handlePaymentToggle}
                />
              ))}
            </div>
            
            <PlanoVisualizerSummary 
              planoMonths={planoWeeks.map(w => ({ month: w.week, isPaid: w.isPaid, dueDate: w.dueDate, planoId: w.planoId }))}
              planoData={{ meses: planoSemanalData.semanas, valorMensal: planoSemanalData.valorSemanal }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanoSemanalPaymentControl;
