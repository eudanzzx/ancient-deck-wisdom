
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Calendar, AlertTriangle, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PlanoMonthsVisualizer from "@/components/PlanoMonthsVisualizer";

interface Atendimento {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento?: 'pago' | 'pendente' | 'parcelado';
  dataNascimento?: string;
  signo?: string;
  destino?: string;
  ano?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  atencaoNota?: string;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
  } | null;
}

interface AtendimentosTableProps {
  atendimentos: Atendimento[];
  onDeleteAtendimento: (id: string) => void;
}

const AtendimentosTable: React.FC<AtendimentosTableProps> = ({ atendimentos, onDeleteAtendimento }) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      case 'parcelado':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Parcelado</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const getTipoServicoLabel = (tipo: string) => {
    switch (tipo) {
      case 'tarot':
        return 'Tarot';
      case 'terapia':
        return 'Terapia';
      case 'mesa-radionica':
        return 'Mesa Radiônica';
      default:
        return tipo;
    }
  };

  if (atendimentos.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum atendimento encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Lista de Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
                <TableHead className="font-semibold text-slate-700">Data</TableHead>
                <TableHead className="font-semibold text-slate-700">Serviço</TableHead>
                <TableHead className="font-semibold text-slate-700">Valor</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Plano</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atendimentos.map((atendimento) => (
                <React.Fragment key={atendimento.id}>
                  <TableRow className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-slate-900">{atendimento.nome}</div>
                          {atendimento.signo && (
                            <div className="text-sm text-slate-500">{atendimento.signo}</div>
                          )}
                        </div>
                        {atendimento.atencaoFlag && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(atendimento.dataAtendimento)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getTipoServicoLabel(atendimento.tipoServico)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      R$ {parseFloat(atendimento.valor || '0').toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(atendimento.statusPagamento)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {atendimento.planoAtivo && atendimento.planoData && (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {atendimento.planoData.meses}x
                          </Badge>
                        )}
                        {atendimento.planoAtivo && atendimento.planoData && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(atendimento.id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.has(atendimento.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/editar-atendimento/${atendimento.id}`)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o atendimento de {atendimento.nome}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDeleteAtendimento(atendimento.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(atendimento.id) && atendimento.planoAtivo && atendimento.planoData && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-4 bg-slate-50/50">
                          <PlanoMonthsVisualizer atendimento={atendimento} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AtendimentosTable;
