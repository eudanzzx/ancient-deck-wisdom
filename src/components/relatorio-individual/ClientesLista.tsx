
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download } from 'lucide-react';
import ClienteCard from './ClienteCard';

interface Cliente {
  nome: string;
  atendimentos: any[];
  totalConsultas: number;
  valorTotal: number;
  ultimaConsulta: string | null;
}

interface ClientesListaProps {
  clientesUnicos: Cliente[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDownloadIndividual: (cliente: Cliente) => void;
  onDownloadConsolidated: () => void;
}

const ClientesLista: React.FC<ClientesListaProps> = ({
  clientesUnicos,
  searchTerm,
  onSearchChange,
  onDownloadIndividual,
  onDownloadConsolidated
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
      <CardHeader className="border-b border-slate-200/50 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Clientes para Relatório
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-600/10 text-blue-600 border-blue-600/20">
              {clientesUnicos.length} clientes
            </Badge>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="pr-10 bg-white/90 border-white/30 focus:border-blue-600 focus:ring-blue-600/20"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <Button
              onClick={onDownloadConsolidated}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Relatório Consolidado
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {clientesUnicos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
            <p className="text-slate-500 mt-2">
              {searchTerm 
                ? "Tente ajustar sua busca ou limpar o filtro" 
                : "Nenhum atendimento registrado ainda"
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clientesUnicos.map((cliente, index) => (
              <ClienteCard
                key={`${cliente.nome}-${index}`}
                cliente={cliente}
                index={index}
                onDownload={onDownloadIndividual}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientesLista;
