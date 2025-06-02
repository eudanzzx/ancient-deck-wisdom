
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Eye, Search, Calendar, DollarSign, Clock, Sparkles } from "lucide-react";
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
  
  const analyses = getTarotAnalyses();
  
  const filteredAnalyses = analyses.filter(analysis =>
    analysis.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    saveTarotAnalyses(updatedAnalyses);
    toast.success("Análise excluída com sucesso!");
  };

  const handleEdit = (id: string) => {
    navigate(`/editar-analise-frequencial/${id}`);
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? "R$ 0,00" : `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
                {searchTerm ? "Nenhuma análise encontrada" : "Nenhuma análise cadastrada"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? "Tente ajustar os termos da busca" 
                  : "Comece criando sua primeira análise de tarot"
                }
              </p>
              {!searchTerm && (
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
                      <CardTitle className="text-lg text-gray-800 mb-2">
                        {analysis.nomeCliente}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
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
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(analysis.id)}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(analysis.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Planos de Pagamento */}
                  {analysis.planoAtivo && analysis.planoData && (
                    <PlanoPaymentControl
                      analysisId={analysis.id}
                      clientName={analysis.nomeCliente}
                      planoData={analysis.planoData}
                      startDate={analysis.dataInicio || analysis.dataAnalise}
                    />
                  )}
                  
                  {/* Detalhes da Análise */}
                  {analysis.detalhesAdicionais && (
                    <div className="mt-4 p-3 bg-purple-50/50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Detalhes:</h4>
                      <p className="text-sm text-gray-600">{analysis.detalhesAdicionais}</p>
                    </div>
                  )}
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
