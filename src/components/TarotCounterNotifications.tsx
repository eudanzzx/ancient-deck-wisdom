
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BellRing } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TarotCounterNotificationsProps {
  analises: any[];
}

const TarotCounterNotifications: React.FC<TarotCounterNotificationsProps> = ({ analises }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const checkCounters = () => {
      const now = new Date();
      const activeCounters: any[] = [];

      analises.forEach(analise => {
        if (analise.lembretes && analise.lembretes.length > 0 && analise.dataInicio) {
          analise.lembretes.forEach((lembrete: any) => {
            if (lembrete.texto && lembrete.dias) {
              const dataInicio = new Date(analise.dataInicio);
              const dataExpiracao = new Date(dataInicio);
              dataExpiracao.setDate(dataExpiracao.getDate() + lembrete.dias);
              
              const timeDiff = dataExpiracao.getTime() - now.getTime();
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
              const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));

              // Mostrar se falta 2 dias ou menos
              if (daysDiff <= 2 && daysDiff >= 0) {
                activeCounters.push({
                  nomeCliente: analise.nomeCliente,
                  lembreteTexto: lembrete.texto,
                  diasRestantes: daysDiff,
                  horasRestantes: hoursDiff,
                  dataExpiracao: dataExpiracao
                });
              }
            }
          });
        }
      });

      setNotifications(activeCounters);
    };

    checkCounters();
    // Atualizar a cada 5 minutos
    const interval = setInterval(checkCounters, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [analises]);

  const formatTimeRemaining = (days: number, hours: number) => {
    if (days === 0) {
      return hours <= 1 ? "Menos de 1 hora" : `${hours} horas`;
    }
    if (days === 1) return "1 dia";
    return `${days} dias`;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {notifications.map((notification, index) => (
        <Card 
          key={`${notification.nomeCliente}-${index}`}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  {notification.diasRestantes === 0 ? (
                    <BellRing className="h-5 w-5 text-amber-600 animate-pulse" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Contador para {notification.nomeCliente}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {notification.lembreteTexto}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={notification.diasRestantes === 0 ? "destructive" : "secondary"}
                  className={`${
                    notification.diasRestantes === 0 
                      ? "bg-red-100 text-red-700 border-red-200" 
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  {formatTimeRemaining(notification.diasRestantes, notification.horasRestantes)}
                </Badge>
                <p className="text-xs text-amber-600 mt-1">
                  Expira: {notification.dataExpiracao.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TarotCounterNotifications;
