
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, ChevronDown, ChevronUp, Minimize } from "lucide-react";

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

interface CounterHeaderProps {
  totalCounters: number;
  nextCounter?: CounterData;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onHide: () => void;
}

const CounterHeader: React.FC<CounterHeaderProps> = ({
  totalCounters,
  nextCounter,
  isMinimized,
  onToggleMinimize,
  onHide,
}) => {
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

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-800">
          Contadores Prioritários ({totalCounters})
        </h3>
        {nextCounter && !isMinimized && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Próximo em {formatDetailedTime(nextCounter)}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
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
          onClick={onHide}
          className="hover:bg-purple-100 text-purple-600"
        >
          <Minimize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CounterHeader;
