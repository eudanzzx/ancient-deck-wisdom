
import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertTriangle, Timer } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TarotCounterNotificationsProps {
  analises: any[];
}

const TarotCounterNotifications: React.FC<TarotCounterNotificationsProps> = ({ analises }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  const urgentCounters = useMemo(() => {
    const now = currentTime;
    const urgent = [];

    analises.forEach(analise => {
      if (analise.lembretes && analise.lembretes.length > 0) {
        analise.lembretes.forEach((lembrete, index) => {
          if (lembrete.texto && lembrete.dias > 0) {
            const dataInicio = new Date(analise.dataInicio);
            const dataVencimento = new Date(dataInicio);
            dataVencimento.setDate(dataVencimento.getDate() + lembrete.dias);
            
            const tempoRestante = dataVencimento.getTime() - now.getTime();
            
            // Mostrar apenas contadores que vencem em menos de 24 horas
            if (tempoRestante > 0 && tempoRestante <= 24 * 60 * 60 * 1000) {
              const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
              const minutosRestantes = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
              
              urgent.push({
                id: `${analise.id}-${index}`,
                clienteNome: analise.nomeCliente,
                tratamento: lembrete.texto,
                horasRestantes,
                minutosRestantes,
                dataVencimento,
                tempoRestante
              });
            }
          }
        });
      }
    });

    // Ordenar por tempo restante (mais urgente primeiro)
    return urgent.sort((a, b) => a.tempoRestante - b.tempoRestante);
  }, [analises, currentTime]);

  const formatarTempoRestante = (horas: number, minutos: number) => {
    if (horas === 0) {
      return `${minutos} minutos`;
    } else if (horas === 1) {
      return minutos > 0 ? `1 hora e ${minutos} minutos` : "1 hora";
    } else {
      return minutos > 0 ? `${horas} horas e ${minutos} minutos` : `${horas} horas`;
    }
  };

  if (urgentCounters.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {urgentCounters.map((contador) => (
        <Alert 
          key={contador.id} 
          variant="warning"
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-lg animate-pulse"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 font-semibold">
            Contador Urgente - {contador.clienteNome}
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="font-medium">{contador.tratamento}</p>
                <p className="text-sm">
                  Vence em: <strong>{formatarTempoRestante(contador.horasRestantes, contador.minutosRestantes)}</strong>
                </p>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
                  {contador.horasRestantes <= 1 ? 'CRÍTICO' : 'URGENTE'}
                </Badge>
                <p className="text-xs mt-1">
                  {contador.dataVencimento.toLocaleDateString('pt-BR')} às{' '}
                  {contador.dataVencimento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default TarotCounterNotifications;
