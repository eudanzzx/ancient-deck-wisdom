
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

      console.log('TarotCounterNotifications - Verificando contadores para:', analises.length, 'análises');

      analises.forEach(analise => {
        console.log('TarotCounterNotifications - Análise:', analise.nomeCliente, 'Lembretes:', analise.lembretes);
        
        if (analise.lembretes && Array.isArray(analise.lembretes) && analise.lembretes.length > 0 && analise.dataInicio) {
          analise.lembretes.forEach((lembrete: any) => {
            console.log('TarotCounterNotifications - Processando lembrete:', lembrete);
            
            if (lembrete.texto && lembrete.dias) {
              const dataInicio = new Date(analise.dataInicio);
              const dataExpiracao = new Date(dataInicio);
              dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
              
              const timeDiff = dataExpiracao.getTime() - now.getTime();
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
              const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));
              const hoursRemaining = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
              const minutesRemaining = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));

              console.log('TarotCounterNotifications - Dias restantes:', daysDiff, 'Horas restantes:', hoursDiff);

              // Mostrar todos os contadores ativos (não expirados)
              if (timeDiff >= 0) {
                activeCounters.push({
                  nomeCliente: analise.nomeCliente,
                  lembreteTexto: lembrete.texto,
                  diasRestantes: daysDiff,
                  horasRestantes: hoursDiff,
                  horasRemainingInDay: horasRemaining,
                  minutosRestantes: minutesRemaining,
                  dataExpiracao: dataExpiracao,
                  timeDiff: timeDiff // Para ordenação
                });
              }
            }
          });
        }
      });

      // Ordenar por tempo restante (mais próximo primeiro)
      activeCounters.sort((a, b) => a.timeDiff - b.timeDiff);

      console.log('TarotCounterNotifications - Contadores ativos ordenados:', activeCounters);
      setNotifications(activeCounters);
    };

    checkCounters();
    // Atualizar a cada minuto para precisão
    const interval = setInterval(checkCounters, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [analises]);

  const formatTimeRemaining = (notification: any) => {
    if (notification.diasRestantes === 0) {
      if (notification.horasRemainingInDay === 0) {
        return `${notification.minutosRestantes} minutos`;
      }
      return `${notification.horasRemainingInDay}h ${notification.minutosRestantes}min`;
    }
    if (notification.diasRestantes === 1) {
      return `1 dia e ${notification.horasRemainingInDay}h`;
    }
    return `${notification.diasRestantes} dias`;
  };

  const getUrgencyLevel = (notification: any) => {
    if (notification.diasRestantes === 0) {
      if (notification.horasRemainingInDay <= 2) return 'critical';
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

  if (notifications.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-800">
          Contadores Ativos ({notifications.length})
        </h3>
      </div>

      {notifications.map((notification, index) => {
        const urgency = getUrgencyLevel(notification);
        
        return (
          <Card 
            key={`${notification.nomeCliente}-${index}`}
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
      })}
    </div>
  );
};

export default TarotCounterNotifications;
