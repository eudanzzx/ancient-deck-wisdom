
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import PlanoPaymentHeader from "./payment/PlanoPaymentHeader";
import PlanoMonthCard from "./payment/PlanoMonthCard";
import PlanoPaymentSummary from "./payment/PlanoPaymentSummary";

interface PlanoPaymentControlProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
  };
  startDate: string;
}

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

const PlanoPaymentControl: React.FC<PlanoPaymentControlProps> = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoMonths, setPlanoMonths] = useState<PlanoMonth[]>([]);

  useEffect(() => {
    initializePlanoMonths();
    checkNotifications();
  }, [analysisId, planoData, startDate]);

  const initializePlanoMonths = () => {
    const totalMonths = parseInt(planoData.meses);
    const baseDate = new Date(startDate);
    const planos = getPlanos();
    
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      // Sempre vencer no dia 30 do mês
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDate.setDate(30);
      
      // Ajustar para meses com menos de 30 dias
      if (dueDate.getDate() !== 30) {
        dueDate.setDate(0); // Último dia do mês anterior
      }
      
      const planoForMonth = planos.find(plano => 
        plano.id.startsWith(`${analysisId}-month-${i}`)
      );
      
      months.push({
        month: i,
        isPaid: planoForMonth ? !planoForMonth.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentDate: planoForMonth?.created ? new Date(planoForMonth.created).toISOString().split('T')[0] : undefined,
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
              `⏰ Lembrete: ${clientName} tem um pagamento para fazer amanhã!`,
              {
                duration: 10000,
                description: `Mês ${month.month} - Valor: R$ ${parseFloat(planoData.valorMensal).toFixed(2)} - Vence em ${dueDate.toLocaleDateString('pt-BR')}`,
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
        id: `${analysisId}-month-${month.month}`,
        clientName: clientName,
        type: 'plano' as const,
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(planoData.meses),
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

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <Card className="mt-4 border-[#6B21A8]/20 shadow-lg">
      <PlanoPaymentHeader 
        paidCount={paidCount}
        totalMonths={planoMonths.length}
        planoData={planoData}
      />
      
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
                <PlanoMonthCard
                  key={month.month}
                  month={month}
                  index={index}
                  onToggle={handlePaymentToggle}
                />
              ))}
            </div>
            
            <PlanoPaymentSummary 
              paidCount={paidCount}
              totalMonths={planoMonths.length}
              paidValue={paidValue}
              totalValue={totalValue}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanoPaymentControl;
