
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface TarotCounterNotificationsProps {
  analises: any[];
  checkOnMount?: boolean;
}

const TarotCounterNotifications: React.FC<TarotCounterNotificationsProps> = ({ 
  analises, 
  checkOnMount = true 
}) => {
  
  const checkExpiringCounters = () => {
    try {
      const today = new Date();
      const expiringCounters = [];

      analises.forEach(analise => {
        if (analise.lembretes && analise.lembretes.length > 0) {
          analise.lembretes.forEach(lembrete => {
            if (lembrete.texto && lembrete.dias > 0) {
              const dataInicio = new Date(analise.dataInicio);
              const dataVencimento = new Date(dataInicio);
              dataVencimento.setDate(dataVencimento.getDate() + lembrete.dias);
              
              const timeDiff = dataVencimento.getTime() - today.getTime();
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
              
              // Mostrar notificação se vence hoje ou amanhã
              if (daysDiff <= 1 && daysDiff >= 0) {
                expiringCounters.push({
                  clienteNome: analise.nomeCliente,
                  tratamento: lembrete.texto,
                  diasRestantes: daysDiff
                });
              }
            }
          });
        }
      });
      
      return expiringCounters;
    } catch (error) {
      console.error('Erro ao verificar contadores:', error);
      return [];
    }
  };

  useEffect(() => {
    if (checkOnMount) {
      console.log('Verificando contadores de tarot...');
      const expiringCounters = checkExpiringCounters();
      console.log('Contadores encontrados:', expiringCounters);
      
      if (expiringCounters.length > 0) {
        expiringCounters.forEach(counter => {
          const timeMessage = counter.diasRestantes === 0 ? 'hoje' : 'amanhã';
          
          console.log(`Exibindo notificação para ${counter.clienteNome}, ${counter.tratamento} vence ${timeMessage}`);
          
          toast.warning(
            `⏰ Contador de ${counter.clienteNome} vence ${timeMessage}!`,
            {
              duration: 8000,
              icon: <AlertTriangle className="h-5 w-5" />,
              description: `Tratamento: ${counter.tratamento}`
            }
          );
        });
      } else {
        console.log('Nenhum contador próximo do vencimento');
      }
    }
  }, [checkOnMount, analises]);

  return null;
};

export default TarotCounterNotifications;
