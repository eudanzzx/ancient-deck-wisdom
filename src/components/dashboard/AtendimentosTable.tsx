
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  FileText, 
  Calendar,
  DollarSign,
  User,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

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
}

interface AtendimentosTableProps {
  atendimentos: Atendimento[];
  onDeleteAtendimento: (id: string) => void;
}

const AtendimentosTable: React.FC<AtendimentosTableProps> = ({ 
  atendimentos, 
  onDeleteAtendimento 
}) => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/editar-atendimento/${id}`);
  };

  const handleViewReport = (id: string) => {
    navigate(`/relatorio-individual/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'parcelado':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'parcelado':
        return 'Parcelado';
      default:
        return 'Pendente';
    }
  };

  if (atendimentos.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum atendimento registrado</h3>
            <p className="text-slate-500 mb-8 max-w-sm">Comece registrando seu primeiro atendimento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="border-b border-slate-200/50 pb-4">
        <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Últimos Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-200/50">
          {atendimentos.map((atendimento, index) => (
            <div 
              key={atendimento.id} 
              className="p-6 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {atendimento.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {atendimento.nome}
                      </h4>
                      {atendimento.atencaoFlag && (
                        <div className="flex items-center gap-1 mt-1" title={atendimento.atencaoNota}>
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-600 font-medium">ATENÇÃO</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-700 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span>{formatDate(atendimento.dataAtendimento)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-blue-600" />
                      <span className="capitalize">{atendimento.tipoServico.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-blue-600" />
                      <span className="font-medium text-green-600">
                        R$ {parseFloat(atendimento.valor || "0").toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(atendimento.statusPagamento)}`}>
                      {getStatusText(atendimento.statusPagamento)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                    onClick={() => handleViewReport(atendimento.id)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-110"
                    onClick={() => handleEdit(atendimento.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:scale-110"
                    onClick={() => onDeleteAtendimento(atendimento.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AtendimentosTable;
