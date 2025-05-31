
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TarotCountdownProps {
  analises: any[];
}

const TarotCountdown: React.FC<TarotCountdownProps> = memo(({ analises }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  const expiringAnalyses = useMemo(() => {
    const now = currentTime;
    const expiring = [];

    console.log('TarotCountdown - Verificando análises:', analises.length);

    analises.forEach(analise => {
      console.log('TarotCountdown - Análise:', analise.nomeCliente, 'Lembretes:', analise.lembretes);
      
      if (analise.lembretes && Array.isArray(analise.lembretes) && analise.lembretes.length > 0) {
        analise.lembretes.forEach((lembrete, index) => {
          console.log('TarotCountdown - Lembrete:', lembrete);
          
          // Verificar se o lembrete tem dataLembrete diretamente
          if (lembrete.dataLembrete && !lembrete.concluido) {
            const lembreteDate = new Date(lembrete.dataLembrete);
            const timeDiff = lembreteDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            console.log('TarotCountdown - Dias restantes:', daysDiff);
            
            // Mostrar se expirando em 3 dias ou menos
            if (daysDiff <= 3 && daysDiff >= 0) {
              expiring.push({
                nomeCliente: analise.nomeCliente,
                diasRestantes: daysDiff,
                lembreteTexto: lembrete.texto || "Lembrete programado",
                dataLembrete: lembreteDate
              });
            }
          }
          // Verificar se o lembrete tem dias (contador baseado em data de início)
          else if (lembrete.dias && analise.dataInicio && lembrete.texto) {
            const dataInicio = new Date(analise.dataInicio);
            const dataExpiracao = new Date(dataInicio);
            dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
            
            const timeDiff = dataExpiracao.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            console.log('TarotCountdown - Contador - Dias restantes:', daysDiff);
            
            if (daysDiff <= 3 && daysDiff >= 0) {
              expiring.push({
                nomeCliente: analise.nomeCliente,
                diasRestantes: daysDiff,
                lembreteTexto: lembrete.texto,
                dataLembrete: dataExpiracao
              });
            }
          }
        });
      }
    });

    console.log('TarotCountdown - Lembretes expirando:', expiring);
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
                    {item.lembreteTexto}
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
