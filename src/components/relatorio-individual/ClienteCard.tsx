
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, BarChart3, Download } from 'lucide-react';

interface Cliente {
  nome: string;
  atendimentos: any[];
  totalConsultas: number;
  valorTotal: number;
  ultimaConsulta: string | null;
}

interface ClienteCardProps {
  cliente: Cliente;
  index: number;
  onDownload: (cliente: Cliente) => void;
}

const ClienteCard: React.FC<ClienteCardProps> = ({ cliente, index, onDownload }) => {
  return (
    <Card 
      key={`${cliente.nome}-${index}`} 
      className="bg-white/80 border border-white/30 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-slate-800">
                {cliente.nome}
              </h3>
              <Badge 
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-blue-200"
              >
                {cliente.totalConsultas} consulta{cliente.totalConsultas !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>
                  Última: {cliente.ultimaConsulta 
                    ? new Date(cliente.ultimaConsulta).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-600">
                  Total: R$ {cliente.valorTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>
                  Média: R$ {(cliente.valorTotal / cliente.totalConsultas).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              onClick={() => onDownload(cliente)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Relatório Individual
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClienteCard;
