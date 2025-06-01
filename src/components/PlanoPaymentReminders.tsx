
import React, { useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

const PlanoPaymentReminders: React.FC = () => {
  const { getPlanos } = useUserDataService();

  useEffect(() => {
    checkPaymentReminders();
    
    // Verificar a cada hora
    const interval = setInterval(checkPaymentReminders, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkPaymentReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Só mostrar notificações no dia 29
    if (today.getDate() !== 29) return;
    
    const allPlanos = getPlanos();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Agrupar planos por cliente
    const clientesPendentes = new Map();
    
    allPlanos.forEach(plano => {
      if (plano.active) { // Se está ativo, significa que não foi pago
        const dueDate = new Date(plano.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Se vence amanhã (dia 30)
        if (dueDate.getTime() === tomorrow.getTime()) {
          if (!clientesPendentes.has(plano.clientName)) {
            clientesPendentes.set(plano.clientName, []);
          }
          clientesPendentes.get(plano.clientName).push(plano);
        }
      }
    });
    
    // Mostrar uma notificação por cliente
    clientesPendentes.forEach((planos, clientName) => {
      const totalValue = planos.reduce((sum: number, plano: any) => sum + plano.amount, 0);
      const monthsList = planos.map((plano: any) => `${plano.month}º mês`).join(', ');
      
      toast.info(
        `⏰ Lembrete de Pagamento`,
        {
          duration: 15000,
          description: `${clientName} tem ${planos.length > 1 ? 'pagamentos' : 'um pagamento'} para fazer amanhã (dia 30): ${monthsList} - Total: R$ ${totalValue.toFixed(2)}`,
          action: {
            label: "Ver detalhes",
            onClick: () => {
              console.log("Planos pendentes para", clientName, ":", planos);
            }
          }
        }
      );
    });
  };

  return null;
};

export default PlanoPaymentReminders;
