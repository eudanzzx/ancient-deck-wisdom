import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

interface PlanoNotification {
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

const PlanoNotifications: React.FC = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [notifications, setNotifications] = useState<PlanoNotification[]>([]);

  useEffect(() => {
    checkPlanoNotifications();
  }, []);

  const checkPlanoNotifications = () => {
    const allPlanos = getPlanos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter only plano type notifications
    const planoNotifications = allPlanos.filter(plano => plano.type === 'plano');
    
    const pendingNotifications = planoNotifications.filter(plano => {
      if (!plano.active) return false;
      
      const dueDate = new Date(plano.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate <= today;
    }) as PlanoNotification[];

    setNotifications(pendingNotifications);

    // Show toast for today's notifications
    pendingNotifications.forEach(notification => {
      const dueDate = new Date(notification.dueDate);
      if (dueDate.getTime() === today.getTime()) {
        toast.info(
          `💳 Pagamento do plano de ${notification.clientName} vence hoje!`,
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
    
    toast.success("Pagamento marcado como realizado!");
  };

  const postponeNotification = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === notificationId) {
        const newDueDate = new Date(plano.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7); // Adiar por 7 dias
        return { ...plano, dueDate: newDueDate.toISOString().split('T')[0] };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    checkPlanoNotifications();
    
    toast.info("Pagamento adiado por 7 dias");
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
    <Card className="mb-6 border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <CreditCard className="h-5 w-5" />
          Notificações de Planos ({notifications.length})
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
                className={`p-4 rounded-lg border ${
                  isOverdue 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-orange-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800">
                        {notification.clientName}
                      </h4>
                      <Badge variant={isOverdue ? "destructive" : "secondary"}>
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
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Adiar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => markAsPaid(notification.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
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

export default PlanoNotifications;
