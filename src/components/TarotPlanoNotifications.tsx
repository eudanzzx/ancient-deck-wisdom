
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

interface TarotPlanoNotification {
  id: string;
  clientName: string;
  type: 'plano';
  amount: number;
  dueDate: string;
  month: number;
  totalMonths: number;
  created: string;
  active: boolean;
}

const TarotPlanoNotifications: React.FC = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [notifications, setNotifications] = useState<TarotPlanoNotification[]>([]);

  useEffect(() => {
    checkTarotPlanoNotifications();
  }, []);

  const checkTarotPlanoNotifications = () => {
    const allPlanos = getPlanos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingNotifications = allPlanos.filter(plano => {
      if (!plano.active) return false;
      
      const dueDate = new Date(plano.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate <= today;
    });

    setNotifications(pendingNotifications);

    // Show toast for today's notifications
    pendingNotifications.forEach(notification => {
      const dueDate = new Date(notification.dueDate);
      if (dueDate.getTime() === today.getTime()) {
        toast.info(
          `🔮 Pagamento do plano de tarot de ${notification.clientName} vence hoje!`,
          {
            duration: 8000,
            description: `Valor: R$ ${notification.amount.toFixed(2)} - Mês ${notification.month}/${notification.totalMonths}`,
            action: {
              label: "Ver detalhes",
              onClick: () => console.log("Detalhes do plano:", notification)
            }
          }
        );
      }
    });
  };

  const markAsPaid = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === notificationId ? { ...plano, active: false } : plano
    );
    
    savePlanos(updatedPlanos);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    toast.success("💫 Pagamento do tarot marcado como realizado!");
  };

  const postponeNotification = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === notificationId) {
        const newDueDate = new Date(plano.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);
        return { ...plano, dueDate: newDueDate.toISOString().split('T')[0] };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    checkTarotPlanoNotifications();
    
    toast.info("🔮 Pagamento do tarot adiado por 7 dias");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (notifications.length === 0) return null;

  return (
    <Card className="mb-6 border-[#6B21A8]/20 bg-gradient-to-br from-purple-50/50 to-violet-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#6B21A8]">
          <Sparkles className="h-5 w-5" />
          Notificações de Planos - Tarot ({notifications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const daysOverdue = getDaysOverdue(notification.dueDate);
            const isOverdue = daysOverdue > 0;
            
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  isOverdue 
                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50' 
                    : 'border-[#6B21A8]/20 bg-gradient-to-r from-white to-purple-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-[#6B21A8]" />
                      <h4 className="font-medium text-slate-800">
                        {notification.clientName}
                      </h4>
                      <Badge 
                        variant={isOverdue ? "destructive" : "secondary"}
                        className={isOverdue ? "" : "bg-[#6B21A8]/10 text-[#6B21A8] border-[#6B21A8]/20"}
                      >
                        Mês {notification.month}/{notification.totalMonths}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Vencimento: {formatDate(notification.dueDate)}
                      </span>
                      <span className="font-medium text-green-600">
                        R$ {notification.amount.toFixed(2)}
                      </span>
                      {isOverdue && (
                        <span className="text-red-600 font-medium">
                          {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} em atraso
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => postponeNotification(notification.id)}
                      className="text-[#6B21A8] border-[#6B21A8]/20 hover:bg-[#6B21A8]/10"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Adiar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => markAsPaid(notification.id)}
                      className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Pago
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TarotPlanoNotifications;
