import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Eye, Search, Calendar, DollarSign, Clock, Sparkles, CheckCircle, AlertCircle, User } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TarotPlanoNotifications from "@/components/TarotPlanoNotifications";
import PlanoPaymentControl from "@/components/tarot/PlanoPaymentControl";
import PlanoSemanalPaymentControl from "@/components/tarot/PlanoSemanalPaymentControl";

const ListagemTarot = () => {
  const navigate = useNavigate();
  const { getTarotAnalyses, saveTarotAnalyses } = useUserDataService();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  
  const analyses = getTarotAnalyses();
  
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "todos") return matchesSearch;
    if (statusFilter === "finalizados") return matchesSearch && analysis.finalizado;
    if (statusFilter === "pendentes") return matchesSearch && !analysis.finalizado;
    
    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    saveTarotAnalyses(updatedAnalyses);
    toast.success("Análise excluída com sucesso!");
  };

  const handleEdit = (id: string) => {
    navigate(`/editar-analise-frequencial/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/visualizar-analise/${id}`);
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? "R$ 0,00" : `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (analysis: any) => {
    if (analysis.finalizado) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Finalizado
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50">
      <DashboardHeader />
      <TarotPlanoNotifications />
      
      <div className="container mx-auto px-4 py-6 mt-20">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Análises de Tarot
          </h1>
          <Button 
            onClick={() => navigate("/analise-frequencial")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </div>

        {/* Filtros de Status */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "todos" ? "default" : "outline"}
            onClick={() => setStatusFilter("todos")}
            className={statusFilter === "todos" 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
              : "border-purple-200 text-purple-600 hover:bg-purple-50"
            }
          >
            Todos ({analyses.length})
          </Button>
          <Button
            variant={statusFilter === "finalizados" ? "default" : "outline"}
            onClick={() => setStatusFilter("finalizados")}
            className={statusFilter === "finalizados" 
              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
              : "border-green-200 text-green-600 hover:bg-green-50"
            }
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Finalizados ({analyses.filter(a => a.finalizado).length})
          </Button>
          <Button
            variant={statusFilter === "pendentes" ? "default" : "outline"}
            onClick={() => setStatusFilter("pendentes")}
            className={statusFilter === "pendentes" 
              ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white" 
              : "border-orange-200 text-orange-600 hover:bg-orange-50"
            }
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Pendentes ({analyses.filter(a => !a.finalizado).length})
          </Button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
          />
        </div>

        {filteredAnalyses.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardContent className="text-center py-12">
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm || statusFilter !== "todos" ? "Nenhuma análise encontrada" : "Nenhuma análise cadastrada"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "todos" 
                  ? "Tente ajustar os filtros ou termos da busca" 
                  : "Comece criando sua primeira análise de tarot"
                }
              </p>
              {!searchTerm && statusFilter === "todos" && (
                <Button 
                  onClick={() => navigate("/analise-frequencial")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Criar Primeira Análise
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-600" />
                          {analysis.nomeCliente}
                        </CardTitle>
                        {getStatusBadge(analysis)}
                        {(analysis.atencao || analysis.atencaoFlag) && (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Atenção
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(analysis.dataInicio || analysis.dataAnalise)}
                        </span>
                        {analysis.preco && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(analysis.preco)}
                          </span>
                        )}
                        {analysis.signo && (
                          <span className="text-purple-600 font-medium flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {analysis.signo}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(analysis.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        title="Visualizar análise"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(analysis.id)}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        title="Editar análise"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(analysis.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        title="Excluir análise"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Pergunta Principal */}
                  {analysis.pergunta && (
                    <div className="mb-4 p-3 bg-purple-50/50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Pergunta:
                      </h4>
                      <p className="text-sm text-gray-700">{analysis.pergunta}</p>
                    </div>
                  )}

                  {/* Resposta Principal */}
                  {analysis.resposta && (
                    <div className="mb-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-200">
                      <h4 className="font-medium text-indigo-800 mb-2">Resposta:</h4>
                      <p className="text-sm text-gray-700">{analysis.resposta}</p>
                    </div>
                  )}

                  {/* Planos de Pagamento Mensais */}
                  {analysis.planoAtivo && analysis.planoData && (
                    <PlanoPaymentControl
                      analysisId={analysis.id}
                      clientName={analysis.nomeCliente}
                      planoData={analysis.planoData}
                      startDate={analysis.dataInicio || analysis.dataAnalise}
                    />
                  )}
                  
                  {/* Planos de Pagamento Semanais */}
                  {analysis.planoSemanalAtivo && analysis.planoSemanalData && (
                    <PlanoSemanalPaymentControl
                      analysisId={analysis.id}
                      clientName={analysis.nomeCliente}
                      planoSemanalData={analysis.planoSemanalData}
                      startDate={analysis.dataInicio || analysis.dataAnalise}
                    />
                  )}
                  
                  {/* Detalhes da Análise */}
                  {analysis.detalhesAdicionais && (
                    <div className="mt-4 p-3 bg-violet-50/50 rounded-lg border border-violet-200">
                      <h4 className="font-medium text-violet-800 mb-2">Detalhes Adicionais:</h4>
                      <p className="text-sm text-gray-700">{analysis.detalhesAdicionais}</p>
                    </div>
                  )}

                  {/* Observações */}
                  {analysis.observacoes && (
                    <div className="mt-4 p-3 bg-yellow-50/50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Observações:
                      </h4>
                      <p className="text-sm text-gray-700">{analysis.observacoes}</p>
                    </div>
                  )}

                  {/* Informações Adicionais */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {analysis.dataNascimento && (
                        <span>Nascimento: {formatDate(analysis.dataNascimento)}</span>
                      )}
                      {analysis.dataAtualizacao && (
                        <span>Atualizado: {formatDate(analysis.dataAtualizacao)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ID: {analysis.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListagemTarot;
