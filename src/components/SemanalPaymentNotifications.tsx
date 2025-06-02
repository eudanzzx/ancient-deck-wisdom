
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
  const [showNotifications, setShowNotifications] = useState(false);

  const getNextFriday = (date: Date): Date => {
    const nextFriday = new Date(date);
    const dayOfWeek = date.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0 && date.getDay() === 5) {
      // Se hoje é sexta, próxima sexta é em 7 dias
      nextFriday.setDate(date.getDate() + 7);
    } else {
      nextFriday.setDate(date.getDate() + daysUntilFriday);
    }
    return nextFriday;
  };

  const checkPaymentNotifications = () => {
    const planos = getPlanos() || [];
    const today = new Date();
    const upcoming: UpcomingPayment[] = [];

    planos.forEach((plano) => {
      if (plano.type === 'semanal' && plano.active) {
        const semanalPlano = plano as PlanoSemanal;
        
        // Calcular a próxima sexta-feira a partir da data de vencimento original
        const originalDueDate = new Date(semanalPlano.dueDate);
        let nextFriday = getNextFriday(originalDueDate);
        
        // Se a data original já passou, calcular a próxima sexta apropriada
        while (nextFriday < today) {
          nextFriday.setDate(nextFriday.getDate() + 7);
        }

        const timeDiff = nextFriday.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Notificar um dia antes (quinta-feira) e no dia (sexta-feira)
        if (daysUntilDue <= 1) {
          upcoming.push({
            id: semanalPlano.id,
            clientName: semanalPlano.clientName,
            amount: semanalPlano.amount,
            dueDate: nextFriday.toISOString().split('T')[0],
            week: semanalPlano.week,
            daysUntilDue
          });

          // Toast de notificação urgente
          if (daysUntilDue === 1) {
            toast.warning(
              `⚠️ Pagamento semanal amanhã!`,
              {
                description: `${semanalPlano.clientName} - R$ ${semanalPlano.amount.toFixed(2)} vence amanhã (sexta-feira)`,
                duration: 10000,
              }
            );
          } else if (daysUntilDue === 0) {
            toast.error(
              `🚨 Pagamento semanal hoje!`,
              {
                description: `${semanalPlano.clientName} - R$ ${semanalPlano.amount.toFixed(2)} vence hoje (sexta-feira)`,
                duration: 15000,
              }
            );
          }
        }
      }
    });

    setUpcomingPayments(upcoming);
  };

  useEffect(() => {
    checkPaymentNotifications();
    
    // Verificar a cada hora
    const interval = setInterval(checkPaymentNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
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

  if (upcomingPayments.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="relative bg-orange-500 hover:bg-orange-600 text-white shadow-lg rounded-full h-12 w-12 p-0"
          >
            <Bell className="h-6 w-6" />
            {upcomingPayments.length > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {upcomingPayments.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Calendar className="h-5 w-5" />
              Pagamentos Semanais Próximos
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingPayments.map((payment) => (
              <Card key={payment.id} className="border-orange-200">
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
                    <Badge 
                      variant={payment.daysUntilDue === 0 ? "destructive" : "secondary"}
                      className={payment.daysUntilDue === 0 ? "bg-red-500" : "bg-orange-500"}
                    >
                      {payment.daysUntilDue === 0 ? "Hoje" : "Amanhã"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center text-sm text-slate-500 mt-4">
            Lembre-se: pagamentos semanais vencem toda sexta-feira
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SemanalPaymentNotifications;
