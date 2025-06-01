
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellRing } from "lucide-react";

interface NotificationData {
  nomeCliente: string;
  lembreteTexto: string;
  diasRestantes: number;
  horasRestantes: number;
  hoursRemaining: number;
  minutosRestantes: number;
  dataExpiracao: Date;
  timeDiff: number;
}

interface SimpleCounterCardProps {
  notification: NotificationData;
  index: number;
}

const SimpleCounterCard: React.FC<SimpleCounterCardProps> = ({
  notification,
  index,
}) => {
  const formatTimeRemaining = (notification: NotificationData) => {
    if (notification.diasRestantes === 0) {
      if (notification.hoursRemaining === 0) {
        return `${notification.minutosRestantes} minutos`;
      }
      return `${notification.hoursRemaining}h ${notification.minutosRestantes}min`;
    }
    if (notification.diasRestantes === 1) {
      return `1 dia e ${notification.hoursRemaining}h`;
    }
    return `${notification.diasRestantes} dias`;
  };

  const getUrgencyLevel = (notification: NotificationData) => {
    if (notification.diasRestantes === 0) {
      if (notification.hoursRemaining <= 2) return 'critical';
      return 'urgent';
    }
    if (notification.diasRestantes <= 1) return 'warning';
    return 'normal';
  };

  const getCardStyle = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return "bg-gradient-to-r from-red-50 to-red-100 border-red-300 shadow-lg";
      case 'urgent':
        return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 shadow-lg";
      case 'warning':
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 shadow-lg";
      default:
        return "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-lg";
    }
  };

  const getBadgeStyle = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return "bg-red-100 text-red-700 border-red-200 animate-pulse";
      case 'urgent':
        return "bg-orange-100 text-orange-700 border-orange-200";
      case 'warning':
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const urgency = getUrgencyLevel(notification);

  return (
    <Card 
      className={`${getCardStyle(urgency)} hover:shadow-xl transition-shadow duration-200`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              urgency === 'critical' ? 'bg-red-100' :
              urgency === 'urgent' ? 'bg-orange-100' :
              urgency === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <BellRing className={`h-5 w-5 ${
                urgency === 'critical' ? 'text-red-600 animate-pulse' :
                urgency === 'urgent' ? 'text-orange-600' :
                urgency === 'warning' ? 'text-amber-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-semibold ${
                  urgency === 'critical' ? 'text-red-800' :
                  urgency === 'urgent' ? 'text-orange-800' :
                  urgency === 'warning' ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  {notification.nomeCliente}
                </h4>
                {index === 0 && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                    PRÓXIMO
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${
                urgency === 'critical' ? 'text-red-700' :
                urgency === 'urgent' ? 'text-orange-700' :
                urgency === 'warning' ? 'text-amber-700' : 'text-blue-700'
              }`}>
                {notification.lembreteTexto}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant="outline"
              className={getBadgeStyle(urgency)}
            >
              {formatTimeRemaining(notification)}
            </Badge>
            <div className="text-xs mt-1 space-y-1">
              <p className={`${
                urgency === 'critical' ? 'text-red-600' :
                urgency === 'urgent' ? 'text-orange-600' :
                urgency === 'warning' ? 'text-amber-600' : 'text-blue-600'
              }`}>
                Expira: {notification.dataExpiracao.toLocaleDateString('pt-BR')}
              </p>
              <p className={`${
                urgency === 'critical' ? 'text-red-600' :
                urgency === 'urgent' ? 'text-orange-600' :
                urgency === 'warning' ? 'text-amber-600' : 'text-blue-600'
              }`}>
                às {notification.dataExpiracao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleCounterCard;
