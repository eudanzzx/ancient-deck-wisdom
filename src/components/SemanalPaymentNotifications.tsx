
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getNextFridays } from "@/utils/fridayCalculator";

interface UpcomingPayment {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  week: number;
  daysUntilDue: number;
}

const SemanalPaymentNotifications = () => {
  const { getPlanos } = useUserDataService();
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [notificationsShown, setNotificationsShown] = useState<Set<string>>(new Set());

  const checkPaymentNotifications = () => {
    const planos = getPlanos() || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming: UpcomingPayment[] = [];

    // Obter a próxima sexta-feira
    const nextFridays = getNextFridays(1);
    const nextFriday = nextFridays[0];
    
    const timeDiff = nextFriday.getTime() - today.getTime();
    const daysUntilFriday = Math.ceil(timeDiff / (1000 * 3600 * 24));

    console.log('SemanalPaymentNotifications - Dias até próxima sexta:', daysUntilFriday);

    planos.forEach((plano) => {
      if (plano.type === 'semanal' && plano.active) {
        const semanalPlano = plano as PlanoSemanal;
        
        upcoming.push({
          id: semanalPlano.id,
          clientName: semanalPlano.clientName,
          amount: semanalPlano.amount,
          dueDate: nextFriday.toISOString().split('T')[0],
          week: semanalPlano.week,
          daysUntilDue: daysUntilFriday
        });

        // Chave única para evitar notificações duplicadas no mesmo dia
        const notificationKey = `${semanalPlano.id}-${today.toDateString()}`;
        
        // Notificar 1 dia antes (quinta-feira) se ainda não foi mostrado hoje
        if (daysUntilFriday === 1 && !notificationsShown.has(notificationKey)) {
          console.log('SemanalPaymentNotifications - Notificação de 1 dia antes para:', semanalPlano.clientName);
          
          toast.warning(
            `⚠️ Pagamento semanal amanhã!`,
            {
              description: `${semanalPlano.clientName} - R$ ${semanalPlano.amount.toFixed(2)} vence amanhã (sexta-feira)`,
              duration: 15000,
              action: {
                label: "Ver detalhes",
                onClick: () => console.log("Detalhes do pagamento semanal:", semanalPlano)
              }
            }
          );

          // Marcar como notificado para hoje
          setNotificationsShown(prev => new Set(prev).add(notificationKey));
        }
        // Notificar no dia do vencimento (sexta-feira)
        else if (daysUntilFriday === 0 && !notificationsShown.has(notificationKey)) {
          console.log('SemanalPaymentNotifications - Notificação do dia para:', semanalPlano.clientName);
          
          toast.error(
            `🚨 Pagamento semanal hoje!`,
            {
              description: `${semanalPlano.clientName} - R$ ${semanalPlano.amount.toFixed(2)} vence hoje (sexta-feira)`,
              duration: 20000,
              action: {
                label: "Ver detalhes",
                onClick: () => console.log("Detalhes do pagamento semanal:", semanalPlano)
              }
            }
          );

          // Marcar como notificado para hoje
          setNotificationsShown(prev => new Set(prev).add(notificationKey));
        }
      }
    });

    setUpcomingPayments(upcoming);
  };

  // Limpar notificações mostradas a cada novo dia
  const clearDailyNotifications = () => {
    const today = new Date().toDateString();
    const currentNotifications = Array.from(notificationsShown);
    const todayNotifications = currentNotifications.filter(key => key.includes(today));
    
    // Se não há notificações para hoje, limpar o conjunto
    if (todayNotifications.length === 0) {
      setNotificationsShown(new Set());
    }
  };

  useEffect(() => {
    // Verificar imediatamente ao carregar
    checkPaymentNotifications();
    clearDailyNotifications();
    
    // Verificar a cada 30 minutos
    const interval = setInterval(() => {
      checkPaymentNotifications();
      clearDailyNotifications();
    }, 30 * 60 * 1000);
    
    // Verificar a cada mudança de dia (às 00:01)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 00:01 do próximo dia
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      console.log('SemanalPaymentNotifications - Verificação da meia-noite');
      setNotificationsShown(new Set()); // Limpar notificações do dia anterior
      checkPaymentNotifications();
      
      // Configurar intervalo diário a partir da meia-noite
      const dailyInterval = setInterval(() => {
        console.log('SemanalPaymentNotifications - Verificação diária automática');
        setNotificationsShown(new Set()); // Limpar notificações do dia anterior
        checkPaymentNotifications();
      }, 24 * 60 * 60 * 1000); // A cada 24 horas
      
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);
    
    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Mostrar apenas pagamentos que vencem em 1 dia ou menos
  const criticalPayments = upcomingPayments.filter(payment => payment.daysUntilDue <= 1);

  if (criticalPayments.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="relative bg-orange-500 hover:bg-orange-600 text-white shadow-lg rounded-full h-12 w-12 p-0 animate-pulse"
          >
            <Bell className="h-6 w-6" />
            {criticalPayments.length > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce"
              >
                {criticalPayments.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Calendar className="h-5 w-5" />
              ⚠️ Pagamentos Semanais Urgentes
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {criticalPayments.map((payment) => (
              <Card key={payment.id} className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">
                        {payment.clientName}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Semana {payment.week} - R$ {payment.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(payment.dueDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={payment.daysUntilDue === 0 ? "destructive" : "secondary"}
                        className={`${payment.daysUntilDue === 0 ? "bg-red-500 animate-pulse" : "bg-orange-500"} text-white`}
                      >
                        {payment.daysUntilDue === 0 ? "HOJE!" : "AMANHÃ"}
                      </Badge>
                      {payment.daysUntilDue === 0 && (
                        <span className="text-xs text-red-600 font-medium animate-pulse">
                          🔥 Vence hoje!
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center text-sm text-slate-500 mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center gap-2 text-yellow-700">
              <Bell className="h-4 w-4" />
              <span className="font-medium">Lembrete automático ativo</span>
            </div>
            <p className="mt-1">
              Você receberá notificações toda quinta-feira para pagamentos que vencem na sexta
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SemanalPaymentNotifications;
