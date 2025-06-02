
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Eye, Search, Calendar, DollarSign, Clock, Sparkles, CheckCircle, AlertCircle, User, Star, Activity } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import PlanoPaymentButton from "@/components/tarot/PlanoPaymentButton";

const ListagemTarot = () => {
  const navigate = useNavigate();
  const { getTarotAnalyses, saveTarotAnalyses } = useUserDataService();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  
  const analyses = getTarotAnalyses();
  
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "todas") return matchesSearch;
    if (statusFilter === "finalizadas") return matchesSearch && analysis.finalizado;
    if (statusFilter === "pendentes") return matchesSearch && !analysis.finalizado;
    if (statusFilter === "atencao") return matchesSearch && analysis.atencaoFlag;
    
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
          Finalizada
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

  // Estatísticas
  const totalRecebido = analyses.reduce((acc, curr) => acc + parseFloat(curr.preco || "0"), 0);
  const totalAnalises = analyses.length;
  const finalizadas = analyses.filter(a => a.finalizado).length;
  const lembretes = analyses.reduce((acc, curr) => acc + (curr.lembretes?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-violet-600/5 to-purple-600/5"></div>
        
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                <Logo height={45} width={45} />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Libertá - Espaço Terapêutico
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-medium tracking-wider uppercase">Sistema de Atendimentos</span>
                  <Sparkles className="h-3 w-3 text-slate-400 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 text-sm font-medium rounded-xl px-4 py-2"
                onClick={() => navigate('/')}
              >
                Início
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 text-sm font-medium rounded-xl px-4 py-2"
                onClick={() => navigate('/relatorio-frequencial')}
              >
                Relatórios
              </Button>
              
              <Button 
                className="text-white h-10 px-6 text-sm font-medium transition-all duration-300 rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                onClick={() => navigate("/analise-frequencial")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Nova Análise
              </Button>
              
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 mt-20">
        {/* Título Principal */}
        <div className="mb-8 text-center">
          <div className="mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
              Libertá - Espaço Terapêutico
            </h1>
            <h2 className="text-2xl font-semibold text-purple-700 mb-1">
              Tarot Frequencial
            </h2>
            <p className="text-lg text-purple-600/80">
              Análises e acompanhamentos
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Star className="h-5 w-5 text-purple-500" />
            <span className="text-purple-700 font-medium">Sistema Místico</span>
            <Star className="h-5 w-5 text-purple-500" />
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Total Recebido</p>
                  <p className="text-3xl font-bold text-purple-800">R$ {totalRecebido.toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-100">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Total Análises</p>
                  <p className="text-3xl font-bold text-purple-800">{totalAnalises}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-100">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Finalizados</p>
                  <p className="text-3xl font-bold text-purple-800">{finalizadas}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-100">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Lembretes</p>
                  <p className="text-3xl font-bold text-purple-800">{lembretes}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-100">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Análises */}
        <Card className="bg-white/80 backdrop-blur-sm border border-purple-200/50 shadow-xl">
          <CardHeader className="border-b border-purple-200/30">
            <CardTitle className="text-purple-700 text-xl">
              Análises Frequenciais
              <span className="ml-2 text-sm font-normal text-purple-600">
                {analyses.length} análises
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Busca */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
              />
            </div>

            {/* Filtros */}
            <div className="mb-6 flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "todas" ? "default" : "outline"}
                onClick={() => setStatusFilter("todas")}
                className={statusFilter === "todas" 
                  ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white" 
                  : "border-purple-200 text-purple-600 hover:bg-purple-50"
                }
              >
                Todas ({analyses.length})
              </Button>
              <Button
                variant={statusFilter === "finalizadas" ? "default" : "outline"}
                onClick={() => setStatusFilter("finalizadas")}
                className={statusFilter === "finalizadas" 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
                  : "border-green-200 text-green-600 hover:bg-green-50"
                }
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Finalizadas ({finalizadas})
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
                Pendentes ({analyses.length - finalizadas})
              </Button>
              <Button
                variant={statusFilter === "atencao" ? "default" : "outline"}
                onClick={() => setStatusFilter("atencao")}
                className={statusFilter === "atencao" 
                  ? "bg-gradient-to-r from-red-600 to-pink-600 text-white" 
                  : "border-red-200 text-red-600 hover:bg-red-50"
                }
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Atenção ({analyses.filter(a => a.atencaoFlag).length})
              </Button>
            </div>

            {/* Lista de Análises */}
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-purple-700 mb-2">
                  {searchTerm || statusFilter !== "todas" ? "Nenhuma análise encontrada" : "Nenhuma análise encontrada"}
                </h3>
                <p className="text-purple-600 mb-4">
                  {searchTerm || statusFilter !== "todas" 
                    ? "Tente ajustar os filtros ou termos da busca" 
                    : "Comece criando sua primeira análise frequencial"
                  }
                </p>
                {!searchTerm && statusFilter === "todas" && (
                  <Button 
                    onClick={() => navigate("/analise-frequencial")}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Criar Primeira Análise
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnalyses.map((analysis) => (
                  <Card key={analysis.id} className="bg-white/60 backdrop-blur-sm border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                              <User className="h-4 w-4 text-purple-600" />
                              {analysis.nomeCliente}
                            </CardTitle>
                            {getStatusBadge(analysis)}
                            {analysis.atencaoFlag && (
                              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Atenção
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-purple-700">
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
                      {/* Planos de Pagamento */}
                      {analysis.planoAtivo && analysis.planoData && (
                        <PlanoPaymentButton
                          analysisId={analysis.id}
                          clientName={analysis.nomeCliente}
                          planoData={analysis.planoData}
                          startDate={analysis.dataInicio || analysis.dataAnalise}
                        />
                      )}
                      
                      {/* Informações Adicionais */}
                      <div className="mt-4 pt-3 border-t border-purple-200">
                        <div className="flex flex-wrap gap-4 text-xs text-purple-600">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListagemTarot;
