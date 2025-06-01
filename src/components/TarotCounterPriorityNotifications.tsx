
import React, { useState, useEffect } from 'react';
import CounterHeader from './counter/CounterHeader';
import CounterCard from './counter/CounterCard';

interface CounterData {
  nomeCliente: string;
  lembreteTexto: string;
  diasRestantes: number;
  horasRestantes: number;
  minutosRestantes: number;
  dataExpiracao: Date;
  priority: number;
  timeDiff: number;
  analysisId: string;
}

interface TarotCounterPriorityNotificationsProps {
  analises: any[];
}

const TarotCounterPriorityNotifications: React.FC<TarotCounterPriorityNotificationsProps> = ({ analises }) => {
  const [counters, setCounters] = useState<CounterData[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const checkCounters = () => {
      const now = new Date();
      const activeCounters: CounterData[] = [];

      console.log('TarotCounterPriorityNotifications - Verificando contadores para:', analises.length, 'análises');

      analises.forEach(analise => {
        if (analise.finalizado) {
          console.log('TarotCounterPriorityNotifications - Pulando análise finalizada:', analise.nomeCliente);
          return;
        }

        if (analise.lembretes && Array.isArray(analise.lembretes) && analise.lembretes.length > 0 && analise.dataInicio) {
          analise.lembretes.forEach((lembrete: any) => {
            if (lembrete.texto && lembrete.dias) {
              const dataInicio = new Date(analise.dataInicio);
              const dataExpiracao = new Date(dataInicio);
              dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
              
              const timeDiff = dataExpiracao.getTime() - now.getTime();
              
              if (timeDiff >= 0) {
                const diasRestantes = Math.floor(timeDiff / (1000 * 3600 * 24));
                const horasRestantes = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
                const minutosRestantes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
                
                let priority = 0;
                if (diasRestantes === 0) {
                  if (horasRestantes === 0) {
                    priority = 1000 + (60 - minutosRestantes);
                  } else {
                    priority = 900 + (24 - horasRestantes);
                  }
                } else {
                  priority = 800 - diasRestantes;
                }

                activeCounters.push({
                  nomeCliente: analise.nomeCliente,
                  lembreteTexto: lembrete.texto,
                  diasRestantes,
                  horasRestantes,
                  minutosRestantes,
                  dataExpiracao,
                  priority,
                  timeDiff,
                  analysisId: analise.id
                });
              }
            }
          });
        }
      });

      activeCounters.sort((a, b) => a.timeDiff - b.timeDiff);

      console.log('TarotCounterPriorityNotifications - Contadores ordenados por tempo:', activeCounters);
      setCounters(activeCounters);
    };

    checkCounters();
    const interval = setInterval(checkCounters, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [analises]);

  useEffect(() => {
    const handleAnalysisFinalized = (event: CustomEvent) => {
      const { analysisId } = event.detail;
      console.log('TarotCounterPriorityNotifications - Análise finalizada, removendo contadores:', analysisId);
      
      setCounters(prevCounters => 
        prevCounters.filter(counter => counter.analysisId !== analysisId)
      );
    };

    window.addEventListener('tarotAnalysisFinalized' as any, handleAnalysisFinalized);
    
    return () => {
      window.removeEventListener('tarotAnalysisFinalized' as any, handleAnalysisFinalized);
    };
  }, []);

  const groupedCounters = counters.reduce((acc, counter) => {
    if (!acc[counter.nomeCliente]) {
      acc[counter.nomeCliente] = [];
    }
    acc[counter.nomeCliente].push(counter);
    return acc;
  }, {} as Record<string, CounterData[]>);

  const topClientGroups = Object.entries(groupedCounters)
    .sort(([, a], [, b]) => a[0].timeDiff - b[0].timeDiff)
    .slice(0, 3);

  if (counters.length === 0 || isHidden) return null;

  return (
    <div className="mb-6 space-y-3">
      <CounterHeader 
        totalCounters={counters.length}
        nextCounter={topClientGroups[0]?.[1][0]}
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        onHide={() => setIsHidden(true)}
      />

      {!isMinimized && (
        <>
          {topClientGroups.map(([clientName, clientCounters], groupIndex) => (
            <CounterCard
              key={`${clientName}-${groupIndex}`}
              clientName={clientName}
              clientCounters={clientCounters}
              groupIndex={groupIndex}
            />
          ))}

          {Object.keys(groupedCounters).length > 3 && (
            <p className="text-sm text-gray-600 text-center">
              + {Object.keys(groupedCounters).length - 3} outros clientes com contadores ativos
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TarotCounterPriorityNotifications;
