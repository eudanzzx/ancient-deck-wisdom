
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TarotCountdownProps {
  analises: any[];
}

const TarotCountdown: React.FC<TarotCountdownProps> = memo(({ analises }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every 5 minutes instead of every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Memoize expensive calculations
  const expiringAnalyses = useMemo(() => {
    const now = currentTime;
    const expiring = [];

    analises.forEach(analise => {
      if (analise.lembretes && analise.lembretes.length > 0) {
        analise.lembretes.forEach(lembrete => {
          if (lembrete.dataLembrete && !lembrete.concluido) {
            const lembreteDate = new Date(lembrete.dataLembrete);
            const timeDiff = lembreteDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            // Show if expiring within 3 days
            if (daysDiff <= 3 && daysDiff >= 0) {
              expiring.push({
                nomeCliente: analise.nomeCliente,
                diasRestantes: daysDiff,
                lembreteTexto: lembrete.texto,
                dataLembrete: lembreteDate
              });
            }
          }
        });
      }
    });

    return expiring;
  }, [analises, currentTime]);

  const formatTimeRemaining = useMemo(() => (days: number) => {
    if (days === 0) return "Hoje";
    if (days === 1) return "1 dia";
    return `${days} dias`;
  }, []);

  if (expiringAnalyses.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {expiringAnalyses.map((item, index) => (
        <Card 
          key={`${item.nomeCliente}-${index}`}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  {item.diasRestantes === 0 ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Lembrete para {item.nomeCliente}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {item.lembreteTexto || "Retorno programado"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={item.diasRestantes === 0 ? "destructive" : "secondary"}
                  className={`${
                    item.diasRestantes === 0 
                      ? "bg-red-100 text-red-700 border-red-200" 
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  {formatTimeRemaining(item.diasRestantes)}
                </Badge>
                <p className="text-xs text-amber-600 mt-1">
                  {item.dataLembrete.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

TarotCountdown.displayName = 'TarotCountdown';

export default TarotCountdown;
