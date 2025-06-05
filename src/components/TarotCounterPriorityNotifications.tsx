
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle, Timer, ChevronDown, ChevronUp, Minimize, User, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CounterData {
  nomeCliente: string;
  lembreteTexto: string;
  diasRestantes: number;
  horasRestantes: number;
  minutosRestantes: number;
  dataExpiracao: Date;
  dataInicio: Date;
  diasTotais: number;
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
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

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
                  dataInicio,
                  diasTotais: parseInt(lembrete.dias),
                  priority,
                  timeDiff,
                  analysisId: analise.id
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
    return `${counter.diasRestantes} dias`;
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
      return <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />;
    }
    if (counter.diasRestantes <= 1) {
      return <Timer className="h-4 w-4 text-amber-600" />;
    }
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const groupedCounters = counters.reduce((acc, counter) => {
    if (!acc[counter.nomeCliente]) {
      acc[counter.nomeCliente] = [];
    }
    acc[counter.nomeCliente].push(counter);
    return acc;
  }, {} as Record<string, CounterData[]>);

  const sortedClientGroups = Object.entries(groupedCounters)
    .sort(([, a], [, b]) => a[0].timeDiff - b[0].timeDiff);

  const toggleClientExpansion = (clientName: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientName)) {
        newSet.delete(clientName);
      } else {
        newSet.add(clientName);
      }
      return newSet;
    });
  };

  if (counters.length === 0 || isHidden) return null;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-800">
            Contadores Ativos ({counters.length})
          </h3>
          {sortedClientGroups[0] && !isMinimized && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Próximo em {formatDetailedTime(sortedClientGroups[0][1][0])}
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
        <div className="space-y-3">
          {sortedClientGroups.map(([clientName, clientCounters], groupIndex) => {
            const primaryCounter = clientCounters[0]; // O contador mais próximo do cliente
            const hasMultipleCounters = clientCounters.length > 1;
            const isExpanded = expandedClients.has(clientName);
            
            return (
              <Card 
                key={`${clientName}-${groupIndex}`}
                className={`bg-gradient-to-r ${getUrgencyColor(primaryCounter)} shadow-md hover:shadow-lg transition-all duration-200 ${
                  groupIndex === 0 ? 'ring-2 ring-purple-300' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Cabeçalho principal */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
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
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                              {clientName}
                            </h4>
                            {hasMultipleCounters && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                {clientCounters.length} contadores
                              </Badge>
                            )}
                            {groupIndex === 0 && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                PRÓXIMO
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm truncate">
                            {primaryCounter.lembreteTexto}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge 
                          variant="outline"
                          className={`${getUrgencyBadge(primaryCounter)} text-xs`}
                        >
                          {formatDetailedTime(primaryCounter)}
                        </Badge>
                        <div className="text-xs mt-1">
                          <p className="text-gray-600 font-medium">
                            {formatExactTime(primaryCounter.dataExpiracao)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão para expandir se houver múltiplos contadores */}
                    {hasMultipleCounters && (
                      <Collapsible open={isExpanded} onOpenChange={() => toggleClientExpansion(clientName)}>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full justify-center hover:bg-white/50 text-gray-600 text-xs"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Ocultar outros contadores
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Ver outros {clientCounters.length - 1} contadores
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {clientCounters.slice(1).map((counter, index) => (
                            <div 
                              key={index}
                              className="bg-white/30 rounded-lg p-3 border border-white/50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className={`p-1.5 rounded-full flex-shrink-0 ${
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
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-gray-700 truncate">
                                      {counter.lembreteTexto}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Duração: {counter.diasTotais} dias</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <Badge 
                                    variant="outline"
                                    className={`${getUrgencyBadge(counter)} text-xs`}
                                  >
                                    {formatDetailedTime(counter)}
                                  </Badge>
                                  <div className="text-xs mt-1">
                                    <p className="text-gray-600">
                                      {formatExactTime(counter.dataExpiracao)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Informações adicionais do contador principal */}
                    {!hasMultipleCounters && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/20 rounded p-2">
                        <Calendar className="h-3 w-3" />
                        <span>Duração total: {primaryCounter.diasTotais} dias</span>
                        <span>•</span>
                        <span>Iniciado em: {primaryCounter.dataInicio.toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TarotCounterPriorityNotifications;
