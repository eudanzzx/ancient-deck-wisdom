
import React, { useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { getNextFridays } from "@/utils/fridayCalculator";

const DailySemanalNotificationManager = () => {
  const { getPlanos } = useUserDataService();

  const checkDailyNotifications = () => {
    const planos = getPlanos() || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Obter a próxima sexta-feira
    const nextFridays = getNextFridays(1);
    const nextFriday = nextFridays[0];
    
    const timeDiff = nextFriday.getTime() - today.getTime();
    const daysUntilFriday = Math.ceil(timeDiff / (1000 * 3600 * 24));

    console.log('DailySemanalNotificationManager - Verificando notificações diárias. Dias até sexta:', daysUntilFriday);

    // Verificar se já foi notificado hoje
    const notificationDate = localStorage.getItem('lastSemanalNotificationDate');
    const todayString = today.toDateString();
    
    if (notificationDate === todayString) {
      console.log('DailySemanalNotificationManager - Já foi notificado hoje');
      return;
    }

    let notificationCount = 0;

    planos.forEach((plano) => {
      if (plano.type === 'semanal' && plano.active) {
        const semanalPlano = plano as PlanoSemanal;
        
        // Notificar 1 dia antes (quinta-feira)
        if (daysUntilFriday === 1) {
          console.log('DailySemanalNotificationManager - Notificação de quinta-feira para:', semanalPlano.clientName);
          
          toast.warning(
            `⚠️ Lembrete: Pagamento semanal amanhã!`,
            {
              description: `${semanalPlano.clientName} - R$ ${semanalPlano.amount.toFixed(2)} vence amanhã (sexta-feira)`,
              duration: 15000,
              action: {
                label: "Ver todos",
                onClick: () => {
                  // Scroll para o componente de notificações se estiver visível
                  const notificationButton = document.querySelector('[data-notification-button]');
                  if (notificationButton) {
                    notificationButton.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }
            }
          );
          
          notificationCount++;
        }
        // Notificar no dia do vencimento (sexta-feira)
        else if (daysUntilFriday === 0) {
          console.log('DailySemanalNotificationManager - Notificação de sexta-feira para:', semanalPlano.clientName);
          
          toast.error(
            `🚨 URGENTE: Pagamento semanal vence hoje!`,
            {
              description: `${semanalPlano.clientName} - R$ ${semanalPlano.amount.toFixed(2)} vence hoje (sexta-feira)`,
              duration: 20000,
              action: {
                label: "Ver detalhes",
                onClick: () => {
                  console.log("Abrir detalhes do pagamento:", semanalPlano);
                }
              }
            }
          );
          
          notificationCount++;
        }
      }
    });

    // Marcar como notificado hoje
    if (notificationCount > 0) {
      localStorage.setItem('lastSemanalNotificationDate', todayString);
      console.log(`DailySemanalNotificationManager - ${notificationCount} notificações enviadas`);
    }
  };

  const setupDailyCheck = () => {
    // Verificar imediatamente
    checkDailyNotifications();

    // Configurar verificação diária às 09:00
    const scheduleDailyCheck = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(9, 0, 0, 0); // 09:00

      // Se já passou das 09:00 hoje, agendar para amanhã
      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }

      const timeUntilTarget = target.getTime() - now.getTime();

      console.log('DailySemanalNotificationManager - Próxima verificação agendada para:', target.toLocaleString());

      setTimeout(() => {
        checkDailyNotifications();
        
        // Configurar verificações diárias subsequentes
        setInterval(() => {
          checkDailyNotifications();
        }, 24 * 60 * 60 * 1000); // A cada 24 horas
        
      }, timeUntilTarget);
    };

    scheduleDailyCheck();

    // Também verificar a cada hora durante o horário comercial (8h às 18h)
    const hourlyCheck = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 8 && hour <= 18) {
        checkDailyNotifications();
      }
    }, 60 * 60 * 1000); // A cada hora

    return () => {
      clearInterval(hourlyCheck);
    };
  };

  useEffect(() => {
    console.log('DailySemanalNotificationManager - Iniciando gerenciador de notificações diárias');
    const cleanup = setupDailyCheck();
    
    return cleanup;
  }, []);

  // Este componente não renderiza nada visível
  return null;
};

export default DailySemanalNotificationManager;
