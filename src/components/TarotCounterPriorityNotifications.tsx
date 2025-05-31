import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle, Timer, ChevronDown, ChevronUp, Minimize, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CounterData {
  nomeCliente: string;
  lembreteTexto: string;
  diasRestantes: number;
  horasRestantes: number;
  minutosRestantes: number;
  dataExpiracao: Date;
  priority: number;
  timeDiff: number;
  analysisId: string; // Add analysis ID to track which analysis this counter belongs to
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
        // Skip finalized analyses
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
                  timeDiff,
                  analysisId: analise.id // Track which analysis this counter belongs to
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

  // Listen for analysis finalization events
  useEffect(() => {
    const handleAnalysisFinalized = (event: CustomEvent) => {
      const { analysisId } = event.detail;
      console.log('TarotCounterPriorityNotifications - Análise finalizada, removendo contadores:', analysisId);
      
      setCounters(prevCounters => 
        prevCounters.filter(counter => counter.analysisId !== analysisId)
      );
    };

    // Listen for the custom event
    window.addEventListener('tarotAnalysisFinalized' as any, handleAnalysisFinalized);
    
    return () => {
      window.removeEventListener('tarotAnalysisFinalized' as any, handleAnalysisFinalized);
    };
  }, []);

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

  const formatExactTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-800">
            Contadores Prioritários ({counters.length})
          </h3>
          {topClientGroups[0] && !isMinimized && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Próximo em {formatDetailedTime(topClientGroups[0][1][0])}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-purple-100 text-purple-600"
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHidden(true)}
            className="hover:bg-purple-100 text-purple-600"
          >
            <Minimize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {topClientGroups.map(([clientName, clientCounters], groupIndex) => {
            const primaryCounter = clientCounters[0]; // O contador mais próximo do cliente
            const hasMultipleCounters = clientCounters.length > 1;
            
            return (
              <Card 
                key={`${clientName}-${groupIndex}`}
                className={`bg-gradient-to-r ${getUrgencyColor(primaryCounter)} shadow-md hover:shadow-lg transition-all duration-200 ${
                  groupIndex === 0 ? 'ring-2 ring-purple-300' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        primaryCounter.diasRestantes === 0 
                          ? primaryCounter.horasRestantes <= 1 
                            ? "bg-red-100" 
                            : "bg-orange-100"
                          : primaryCounter.diasRestantes === 1 
                            ? "bg-amber-100"
                            : "bg-blue-100"
                      }`}>
                        {getIcon(primaryCounter)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {hasMultipleCounters ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="p-0 h-auto font-semibold text-gray-800 hover:bg-transparent hover:text-purple-600 flex items-center gap-1"
                                >
                                  <User className="h-4 w-4" />
                                  {clientName}
                                  <ChevronDown className="h-3 w-3" />
                                  <Badge variant="secondary" className="ml-1 text-xs bg-purple-100 text-purple-700">
                                    {clientCounters.length}
                                  </Badge>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-80 bg-white border shadow-lg">
                                {clientCounters.map((counter, index) => (
                                  <DropdownMenuItem key={index} className="flex-col items-start p-3 hover:bg-gray-50">
                                    <div className="flex items-center gap-2 w-full">
                                      <Badge 
                                        variant="outline"
                                        className={getUrgencyBadge(counter)}
                                      >
                                        {formatDetailedTime(counter)}
                                      </Badge>
                                      <span className="text-xs text-gray-500 ml-auto">
                                        {formatExactTime(counter.dataExpiracao)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {counter.lembreteTexto}
                                    </p>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <h4 className="font-semibold text-gray-800">
                              {clientName}
                            </h4>
                          )}
                          {groupIndex === 0 && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                              MAIS PRÓXIMO
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">
                          {primaryCounter.lembreteTexto}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline"
                        className={getUrgencyBadge(primaryCounter)}
                      >
                        {formatDetailedTime(primaryCounter)}
                      </Badge>
                      <div className="text-xs mt-1 space-y-1">
                        <p className="text-gray-600 font-medium">
                          {formatExactTime(primaryCounter.dataExpiracao)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

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
