
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle, Timer } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TarotCountersProps {
  analises: any[];
}

const TarotCounters: React.FC<TarotCountersProps> = ({ analises }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  const contadoresAtivos = useMemo(() => {
    const contadores = [];
    const agora = currentTime;

    analises.forEach(analise => {
      if (analise.lembretes && analise.lembretes.length > 0) {
        analise.lembretes.forEach((lembrete, index) => {
          if (lembrete.texto && lembrete.dias > 0) {
            const dataInicio = new Date(analise.dataInicio);
            const dataVencimento = new Date(dataInicio);
            dataVencimento.setDate(dataVencimento.getDate() + lembrete.dias);
            
            const tempoRestante = dataVencimento.getTime() - agora.getTime();
            
            // Só mostrar se ainda não venceu
            if (tempoRestante > 0) {
              const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
              const diasRestantes = Math.floor(horasRestantes / 24);
              const horasExtras = horasRestantes % 24;
              
              contadores.push({
                id: `${analise.id}-${index}`,
                clienteNome: analise.nomeCliente,
                tratamento: lembrete.texto,
                tempoRestante,
                diasRestantes,
                horasRestantes: horasExtras,
                totalHoras: horasRestantes,
                dataVencimento
              });
            }
          }
        });
      }
    });

    // Ordenar por tempo restante (mais próximo primeiro)
    return contadores.sort((a, b) => a.tempoRestante - b.tempoRestante);
  }, [analises, currentTime]);

  const formatarTempoRestante = (diasRestantes: number, horasRestantes: number, totalHoras: number) => {
    if (totalHoras < 24) {
      return `${totalHoras}h restantes`;
    } else if (diasRestantes === 1 && horasRestantes === 0) {
      return "1 dia";
    } else if (diasRestantes === 1) {
      return `1 dia e ${horasRestantes}h`;
    } else if (horasRestantes === 0) {
      return `${diasRestantes} dias`;
    } else {
      return `${diasRestantes} dias e ${horasRestantes}h`;
    }
  };

  const getUrgencyColor = (totalHoras: number) => {
    if (totalHoras <= 24) return "destructive"; // Vermelho - menos de 1 dia
    if (totalHoras <= 72) return "secondary"; // Laranja - menos de 3 dias
    return "outline"; // Cinza - mais de 3 dias
  };

  const getUrgencyIcon = (totalHoras: number) => {
    if (totalHoras <= 24) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (totalHoras <= 72) return <Clock className="h-5 w-5 text-orange-600" />;
    return <Timer className="h-5 w-5 text-blue-600" />;
  };

  if (contadoresAtivos.length === 0) {
    return (
      <Card className="bg-white/50 border-slate-200/50">
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">
            <Timer className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum contador ativo no momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#6B21A8] flex items-center gap-2">
        <Timer className="h-6 w-6" />
        Contadores Ativos ({contadoresAtivos.length})
      </h3>
      
      {contadoresAtivos.map((contador, index) => (
        <Card 
          key={contador.id}
          className={`transition-all duration-200 ${
            index === 0 
              ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-lg" 
              : "bg-white/50 border-slate-200/50"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getUrgencyIcon(contador.totalHoras)}
                <div>
                  <span className="text-[#6B21A8]">{contador.clienteNome}</span>
                  {index === 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      PRÓXIMO A VENCER
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant={getUrgencyColor(contador.totalHoras)}>
                {formatarTempoRestante(contador.diasRestantes, contador.horasRestantes, contador.totalHoras)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600 mb-1">Tratamento:</p>
                <p className="text-sm font-medium">{contador.tratamento}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Vence em:</p>
                <p className="text-sm font-medium">
                  {contador.dataVencimento.toLocaleDateString('pt-BR')} às{' '}
                  {contador.dataVencimento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TarotCounters;
