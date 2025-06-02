
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Clock, X } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";

interface SemanalNotification {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  week: number;
  totalWeeks: number;
  daysUntilDue: number;
}

const SemanalPaymentNotifications: React.FC = () => {
  const { getPlanos } = useUserDataService();
  const [notifications, setNotifications] = useState<SemanalNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const getNextFriday = (startDate: Date, weekNumber: number): Date => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (weekNumber * 7));
    
    // Encontrar a próxima sexta-feira
    const dayOfWeek = date.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    date.setDate(date.getDate() + daysUntilFriday);
    
    return date;
  };

  const calculateDaysUntilDue = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    const checkSemanalPayments = () => {
      const planos = getPlanos();
      const semanalPlanos = planos.filter((plano): plano is PlanoSemanal => 
        plano.type === 'semanal' && plano.active
      );

      const upcomingPayments: SemanalNotification[] = [];

      semanalPlanos.forEach(plano => {
        const daysUntilDue = calculateDaysUntilDue(plano.dueDate);
        
        // Notificar de 1 a 7 dias antes do vencimento
        if (daysUntilDue >= 0 && daysUntilDue <= 7) {
          upcomingPayments.push({
            id: plano.id,
            clientName: plano.clientName,
            amount: plano.amount,
            dueDate: plano.dueDate,
            week: plano.week,
            totalWeeks: plano.totalWeeks,
            daysUntilDue
          });
        }
      });

      // Ordenar por proximidade do vencimento
      upcomingPayments.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
      
      setNotifications(upcomingPayments);

      // Mostrar toast para pagamentos urgentes (1-2 dias)
      upcomingPayments.forEach(payment => {
        if (payment.daysUntilDue <= 2 && payment.daysUntilDue >= 0) {
          const message = payment.daysUntilDue === 0 
            ? `🚨 HOJE é o vencimento do pagamento semanal de ${payment.clientName}!`
            : `⚠️ ${payment.clientName} tem pagamento vencendo em ${payment.daysUntilDue} ${payment.daysUntilDue === 1 ? 'dia' : 'dias'}!`;
          
          toast.warning(message, {
            duration: 8000,
            description: `Semana ${payment.week}/${payment.totalWeeks} - R$ ${payment.amount.toFixed(2)}`
          });
        }
      });
    };

    // Verificar imediatamente
    checkSemanalPayments();

    // Verificar a cada hora
    const interval = setInterval(checkSemanalPayments, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [getPlanos]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getUrgencyColor = (daysUntilDue: number): string => {
    if (daysUntilDue === 0) return "bg-red-500 text-white border-red-600";
    if (daysUntilDue <= 2) return "bg-orange-500 text-white border-orange-600";
    if (daysUntilDue <= 5) return "bg-yellow-500 text-white border-yellow-600";
    return "bg-blue-500 text-white border-blue-600";
  };

  const getUrgencyText = (daysUntilDue: number): string => {
    if (daysUntilDue === 0) return "VENCE HOJE!";
    if (daysUntilDue === 1) return "Vence amanhã";
    return `Vence em ${daysUntilDue} dias`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Botão flutuante de notificações */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`
            relative p-4 rounded-full shadow-lg transition-all duration-300
            ${notifications.some(n => n.daysUntilDue <= 2) 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-[#10B981] hover:bg-[#10B981]/90'
            }
          `}
        >
          <Bell className="h-6 w-6 text-white" />
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-600 text-white text-xs font-bold"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Modal/Card de notificações */}
      {showNotifications && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-96 overflow-y-auto">
          <Card className="shadow-2xl border-2 border-[#10B981]/20">
            <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#10B981]">
                  <Calendar className="h-5 w-5" />
                  Pagamentos Semanais
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="h-8 w-8 p-0 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                {notifications.length} pagamento{notifications.length !== 1 ? 's' : ''} próximo{notifications.length !== 1 ? 's' : ''} do vencimento
              </p>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">
                          {notification.clientName}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Semana {notification.week}/{notification.totalWeeks}
                        </p>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(notification.dueDate)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          className={`${getUrgencyColor(notification.daysUntilDue)} text-xs font-medium px-2 py-1`}
                        >
                          {getUrgencyText(notification.daysUntilDue)}
                        </Badge>
                        <span className="text-lg font-bold text-[#10B981]">
                          R$ {notification.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SemanalPaymentNotifications;
