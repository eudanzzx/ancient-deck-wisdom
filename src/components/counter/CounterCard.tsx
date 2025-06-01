
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ChevronDown } from "lucide-react";
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
  analysisId: string;
}

interface CounterCardProps {
  clientName: string;
  clientCounters: CounterData[];
  groupIndex: number;
}

const CounterCard: React.FC<CounterCardProps> = ({
  clientName,
  clientCounters,
  groupIndex,
}) => {
  const primaryCounter = clientCounters[0];
  const hasMultipleCounters = clientCounters.length > 1;

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

  return (
    <Card 
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
};

export default CounterCard;
