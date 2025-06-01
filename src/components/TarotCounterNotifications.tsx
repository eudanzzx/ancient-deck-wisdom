
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import SimpleCounterCard from './counter/SimpleCounterCard';

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

interface TarotCounterNotificationsProps {
  analises: any[];
}

const TarotCounterNotifications: React.FC<TarotCounterNotificationsProps> = ({ analises }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const checkCounters = () => {
      const now = new Date();
      const clientCounters: { [key: string]: NotificationData } = {};

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

              if (timeDiff >= 0) {
                const notification = {
                  nomeCliente: analise.nomeCliente,
                  lembreteTexto: lembrete.texto,
                  diasRestantes: daysDiff,
                  horasRestantes: hoursDiff,
                  hoursRemaining: hoursRemaining,
                  minutosRestantes: minutesRemaining,
                  dataExpiracao: dataExpiracao,
                  timeDiff: timeDiff
                };

                if (!clientCounters[analise.nomeCliente] || timeDiff < clientCounters[analise.nomeCliente].timeDiff) {
                  clientCounters[analise.nomeCliente] = notification;
                }
              }
            }
          });
        }
      });

      const activeCounters = Object.values(clientCounters).sort((a, b) => a.timeDiff - b.timeDiff);

      console.log('TarotCounterNotifications - Contadores ativos agrupados por cliente:', activeCounters);
      setNotifications(activeCounters);
    };

    checkCounters();
    const interval = setInterval(checkCounters, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [analises]);

  if (notifications.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-800">
          Contadores Ativos ({notifications.length})
        </h3>
      </div>

      {notifications.map((notification, index) => (
        <SimpleCounterCard
          key={`${notification.nomeCliente}-${index}`}
          notification={notification}
          index={index}
        />
      ))}
    </div>
  );
};

export default TarotCounterNotifications;
