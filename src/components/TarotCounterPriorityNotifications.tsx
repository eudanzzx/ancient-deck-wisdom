
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle, Timer } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface CounterData {
  nomeCliente: string;
  lembreteTexto: string;
  diasRestantes: number;
  horasRestantes: number;
  minutosRestantes: number;
  dataExpiracao: Date;
  priority: number;
  timeDiff: number;
}

interface TarotCounterPriorityNotificationsProps {
  analises: any[];
}

const TarotCounterPriorityNotifications: React.FC<TarotCounterPriorityNotificationsProps> = ({ analises }) => {
  const [counters, setCounters] = useState<CounterData[]>([]);

  useEffect(() => {
    const checkCounters = () => {
      const now = new Date();
      const activeCounters: CounterData[] = [];

      console.log('TarotCounterPriorityNotifications - Verificando contadores para:', analises.length, 'análises');

      analises.forEach(analise => {
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
                
                // Calcular prioridade: quanto menor o tempo, maior a prioridade
                let priority = 0;
                if (diasRestantes === 0) {
                  if (horasRestantes === 0) {
                    priority = 1000 + (60 - minutosRestantes); // Minutos restantes
                  } else {
                    priority = 900 + (24 - horasRestantes); // Horas restantes
                  }
                } else {
                  priority = 800 - diasRestantes; // Dias restantes
                }

                activeCounters.push({
                  nomeCliente: analise.nomeCliente,
                  lembreteTexto: lembrete.texto,
                  diasRestantes,
                  horasRestantes,
                  minutosRestantes,
                  dataExpiracao,
                  priority,
                  timeDiff
                });
              }
            }
          });
        }
      });

      // Ordenar por tempo restante (mais próximo primeiro)
      activeCounters.sort((a, b) => a.timeDiff - b.timeDiff);

      console.log('TarotCounterPriorityNotifications - Contadores ordenados por tempo:', activeCounters);
      setCounters(activeCounters);
    };

    checkCounters();
    // Atualizar a cada minuto para precisão das horas
    const interval = setInterval(checkCounters, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [analises]);

  const formatDetailedTime = (counter: CounterData) => {
    if (counter.diasRestantes === 0) {
      if (counter.horasRestantes === 0) {
        return `${counter.minutosRestantes}min`;
      }
      return `${counter.horasRestantes}h ${counter.minutosRestantes}min`;
    }
    if (counter.diasRestantes === 1) {
      return `1 dia ${counter.horasRestantes}h`;
    }
    return `${counter.diasRestantes} dias ${counter.horasRestantes}h`;
  };

  const getUrgencyColor = (counter: CounterData) => {
    if (counter.diasRestantes === 0) {
      if (counter.horasRestantes <= 1) {
        return "from-red-50 to-red-100 border-red-300";
      }
      return "from-orange-50 to-orange-100 border-orange-300";
    }
    if (counter.diasRestantes === 1) {
      return "from-amber-50 to-amber-100 border-amber-300";
    }
    return "from-blue-50 to-blue-100 border-blue-300";
  };

  const getUrgencyBadge = (counter: CounterData) => {
    if (counter.diasRestantes === 0) {
      if (counter.horasRestantes <= 1) {
        return "bg-red-100 text-red-700 border-red-200 animate-pulse";
      }
      return "bg-orange-100 text-orange-700 border-orange-200";
    }
    if (counter.diasRestantes === 1) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getIcon = (counter: CounterData) => {
    if (counter.diasRestantes === 0 && counter.horasRestantes <= 1) {
      return <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />;
    }
    if (counter.diasRestantes <= 1) {
      return <Timer className="h-5 w-5 text-amber-600" />;
    }
    return <Clock className="h-5 w-5 text-blue-600" />;
  };

  if (counters.length === 0) return null;

  // Mostrar apenas os 3 mais prioritários (mais próximos de expirar)
  const topCounters = counters.slice(0, 3);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-800">
          Contadores Prioritários ({counters.length})
        </h3>
        {topCounters[0] && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Próximo em {formatDetailedTime(topCounters[0])}
          </Badge>
        )}
      </div>

      {topCounters.map((counter, index) => (
        <Card 
          key={`${counter.nomeCliente}-${index}`}
          className={`bg-gradient-to-r ${getUrgencyColor(counter)} shadow-md hover:shadow-lg transition-all duration-200 ${
            index === 0 ? 'ring-2 ring-purple-300' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  counter.diasRestantes === 0 
                    ? counter.horasRestantes <= 1 
                      ? "bg-red-100" 
                      : "bg-orange-100"
                    : counter.diasRestantes === 1 
                      ? "bg-amber-100"
                      : "bg-blue-100"
                }`}>
                  {getIcon(counter)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">
                      {counter.nomeCliente}
                    </h4>
                    {index === 0 && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                        MAIS PRÓXIMO
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">
                    {counter.lembreteTexto}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline"
                  className={getUrgencyBadge(counter)}
                >
                  {formatDetailedTime(counter)}
                </Badge>
                <div className="text-xs mt-1 space-y-1">
                  <p className="text-gray-600">
                    Expira: {counter.dataExpiracao.toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-gray-600">
                    às {counter.dataExpiracao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {counters.length > 3 && (
        <p className="text-sm text-gray-600 text-center">
          + {counters.length - 3} outros contadores ativos
        </p>
      )}
    </div>
  );
};

export default TarotCounterPriorityNotifications;
