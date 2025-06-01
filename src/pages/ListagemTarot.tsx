import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  DollarSign,
  CheckCircle,
  Calendar,
  Edit3,
  Trash2,
  Star,
  AlertTriangle,
  Users,
  Sparkles,
  BellRing,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Logo from "@/components/Logo";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PlanoPaymentButton from "@/components/tarot/PlanoPaymentButton";

const ListagemTarot = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [analises, setAnalises] = useState([]);
  const [filteredAnalises, setFilteredAnalises] = useState([]);
  const [activeTab, setActiveTab] = useState("todas");
  const [aniversarianteHoje, setAniversarianteHoje] = useState(null);
  const { getAllTarotAnalyses, deleteTarotAnalysis, saveAllTarotAnalyses } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalises();
  }, []);

  // Reload analyses when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      console.log('ListagemTarot - Página focada, recarregando análises...');
      loadAnalises();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const filtered = analises.filter(analise =>
      analise.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnalises(filtered);
  }, [searchTerm, analises]);

  useEffect(() => {
    checkBirthdaysToday(analises);
  }, [analises]);

  // Listen for birthday notification removal events
  useEffect(() => {
    const handleBirthdayNotificationRemoved = (event) => {
      const { clientName, analysisType } = event.detail;
      
      if (analysisType === 'tarot' && aniversarianteHoje?.nome === clientName) {
        console.log('ListagemTarot - Removendo notificação de aniversário para:', clientName);
        setAniversarianteHoje(null);
      }
    };

    window.addEventListener('birthdayNotificationRemoved', handleBirthdayNotificationRemoved);
    
    return () => {
      window.removeEventListener('birthdayNotificationRemoved', handleBirthdayNotificationRemoved);
    };
  }, [aniversarianteHoje]);

  const loadAnalises = () => {
    console.log('ListagemTarot - Carregando análises...');
    const data = getAllTarotAnalyses();
    console.log('ListagemTarot - Dados carregados:', data.length, 'análises');
    console.log('ListagemTarot - Primeira análise:', data[0]);
    setAnalises(data);
    setFilteredAnalises(data);
  };

  const checkBirthdaysToday = (analises) => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    
    const birthdayClient = analises.find(analise => {
      if (!analise.dataNascimento) return false;
      
      try {
        const [year, month, day] = analise.dataNascimento.split('-').map(Number);
        return day === todayDay && month === todayMonth;
      } catch (error) {
        console.error('Error parsing birth date:', error);
        return false;
      }
    });
    
    if (birthdayClient) {
      setAniversarianteHoje({
        nome: birthdayClient.nomeCliente,
        dataNascimento: birthdayClient.dataNascimento
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      deleteTarotAnalysis(id);
      loadAnalises();
      toast({
        title: "Análise removida",
        description: "A análise foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover análise",
        description: "Ocorreu um erro ao tentar remover a análise.",
      });
    }
  };

  const handleToggleFinished = (id) => {
    try {
      const updatedAnalises = analises.map(analise => 
        analise.id === id 
          ? { ...analise, finalizado: !analise.finalizado }
          : analise
      );
      
      saveAllTarotAnalyses(updatedAnalises);
      setAnalises(updatedAnalises);
      setFilteredAnalises(updatedAnalises);
      
      const analise = analises.find(a => a.id === id);
      const newStatus = !analise.finalizado;
      
      // Dispatch event when analysis is finalized to remove counters
      if (newStatus) {
        console.log('ListagemTarot - Disparando evento de finalização para:', id);
        const event = new CustomEvent('tarotAnalysisFinalized', {
          detail: { analysisId: id }
        });
        window.dispatchEvent(event);
      }
      
      toast({
        title: newStatus ? "Análise finalizada" : "Análise reaberta",
        description: newStatus 
          ? "A análise foi marcada como finalizada." 
          : "A análise foi reaberta e marcada como pendente.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar análise",
        description: "Ocorreu um erro ao tentar atualizar o status da análise.",
      });
    }
  };

  const calculateTimeRemaining = (analise) => {
    console.log('ListagemTarot - Calculando tempo restante para:', analise.nomeCliente, 'Lembretes:', analise.lembretes);
    
    if (!analise.lembretes || !Array.isArray(analise.lembretes) || analise.lembretes.length === 0 || !analise.dataInicio) {
      console.log('ListagemTarot - Sem lembretes ou data de início');
      return null;
    }

    const now = new Date();
    let closestExpiration = null;
    let closestDiff = Infinity;

    analise.lembretes.forEach((lembrete) => {
      console.log('ListagemTarot - Processando lembrete:', lembrete);
      
      if (lembrete.texto && lembrete.dias) {
        const dataInicio = new Date(analise.dataInicio);
        const dataExpiracao = new Date(dataInicio);
        dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
        
        const timeDiff = dataExpiracao.getTime() - now.getTime();
        
        console.log('ListagemTarot - Tempo diferença:', timeDiff, 'Data expiração:', dataExpiracao);
        
        if (timeDiff < closestDiff && timeDiff >= 0) {
          closestDiff = timeDiff;
          closestExpiration = {
            days: Math.ceil(timeDiff / (1000 * 3600 * 24)),
            hours: Math.ceil(timeDiff / (1000 * 3600)),
            timeDiff: timeDiff
          };
        }
      }
    });

    console.log('ListagemTarot - Resultado tempo restante:', closestExpiration);
    return closestExpiration;
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining) return null;
    
    if (timeRemaining.days === 0) {
      return timeRemaining.hours <= 1 ? "< 1h" : `${timeRemaining.hours}h`;
    }
    if (timeRemaining.days === 1) return "1d";
    return `${timeRemaining.days}d`;
  };

  const sortAnalisesByTimeRemaining = (analises) => {
    return [...analises].sort((a, b) => {
      const timeA = calculateTimeRemaining(a);
      const timeB = calculateTimeRemaining(b);
      
      // Análises sem contador vão para o final
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;
      
      // Ordena por tempo mais próximo primeiro
      return timeA.timeDiff - timeB.timeDiff;
    });
  };

  const getFilteredAnalisesByTab = () => {
    let filtered;
    switch(activeTab) {
      case "finalizadas":
        filtered = filteredAnalises.filter(analise => analise.finalizado);
        break;
      case "pendentes":
        filtered = filteredAnalises.filter(analise => !analise.finalizado);
        break;
      case "atencao":
        filtered = filteredAnalises.filter(analise => analise.atencaoFlag);
        break;
      default:
        filtered = filteredAnalises;
    }
    
    // Ordena por tempo restante
    return sortAnalisesByTimeRemaining(filtered);
  };

  const getTotalValue = () => {
    return analises.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0).toFixed(2);
  };

  const getStatusCounts = () => {
    const finalizados = analises.filter(a => a.finalizado).length;
    const emAndamento = analises.filter(a => !a.finalizado).length;
    const atencao = analises.filter(a => a.atencaoFlag).length;
    return { finalizados, emAndamento, atencao };
  };

  const analisesToShow = useMemo(() => getFilteredAnalisesByTab(), [activeTab, filteredAnalises]);
  const { finalizados, emAndamento, atencao } = useMemo(() => getStatusCounts(), [analises]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-violet-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <DashboardHeader />

      <main className="pt-20 p-4 animate-fade-in relative z-10">
        <TarotCounterPriorityNotifications analises={analises} />
        
        {aniversarianteHoje && (
          <div className="animate-scale-in mb-6">
            <ClientBirthdayAlert 
              clientName={aniversarianteHoje.nome}
              birthDate={aniversarianteHoje.dataNascimento}
              context="tarot"
            />
          </div>
        )}

        <div className="mb-8 flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <Logo height={50} width={50} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                Tarot Frequencial
              </h1>
              <p className="text-[#673193]/80 mt-1 opacity-80">Análises e acompanhamentos</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[#673193]/60">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Sistema Místico</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <DashboardCard 
            title="Total Recebido" 
            value={`R$ ${getTotalValue()}`} 
            icon={<DollarSign className="h-8 w-8 text-[#673193]" />} 
            delay="0s"
          />
          <DashboardCard 
            title="Total Análises" 
            value={analises.length.toString()} 
            icon={<Users className="h-8 w-8 text-[#673193]" />} 
            delay="0.1s"
          />
          <DashboardCard 
            title="Finalizados" 
            value={finalizados.toString()} 
            icon={<CheckCircle className="h-8 w-8 text-[#673193]" />} 
            delay="0.2s"
          />
          <DashboardCard 
            title="Lembretes" 
            value={analises.filter(a => a.lembretes && a.lembretes.length > 0).length.toString()} 
            icon={<BellRing className="h-8 w-8 text-[#673193]" />} 
            delay="0.3s"
          />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="border-b border-slate-200/50 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                  Análises Frequenciais
                </CardTitle>
                <Badge variant="secondary" className="bg-[#673193]/10 text-[#673193] border-[#673193]/20">
                  {analises.length} análises
                </Badge>
              </div>
              <div className="relative group">
                <Input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pr-10 bg-white/90 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:scale-105"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-[#673193] transition-colors duration-300" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 border border-white/30 rounded-xl mb-6">
                <TabsTrigger 
                  value="todas" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Todas ({analises.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="finalizadas" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Finalizadas ({finalizados})
                </TabsTrigger>
                <TabsTrigger 
                  value="pendentes" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Pendentes ({emAndamento})
                </TabsTrigger>
                <TabsTrigger 
                  value="atencao" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Atenção ({atencao})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 animate-fade-in">
                {analisesToShow.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-16 w-16 text-slate-300 mb-4 animate-pulse" />
                    <h3 className="text-xl font-medium text-slate-600">Nenhuma análise encontrada</h3>
                    <p className="text-slate-500 mt-2">
                      {searchTerm 
                        ? "Tente ajustar sua busca ou limpar o filtro" 
                        : "Comece criando sua primeira análise frequencial"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {analisesToShow.map((analise, index) => {
                      const timeRemaining = calculateTimeRemaining(analise);
                      const formattedTime = formatTimeRemaining(timeRemaining);
                      
                      console.log('ListagemTarot - Renderizando análise:', analise.nomeCliente, 'Tempo restante:', formattedTime);
                      
                      return (
                        <div key={analise.id}>
                          <Card 
                            className="bg-white/80 border border-white/30 hover:bg-white/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] animate-fade-in group"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-[#673193] transition-colors duration-300 flex items-center gap-2">
                                      {analise.nomeCliente}
                                      {formattedTime && (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs flex items-center gap-1 ${
                                            timeRemaining?.days === 0 
                                              ? "border-red-300 text-red-600 bg-red-50" 
                                              : timeRemaining?.days === 1
                                              ? "border-amber-300 text-amber-600 bg-amber-50"
                                              : "border-blue-300 text-blue-600 bg-blue-50"
                                          }`}
                                        >
                                          <Clock className="h-3 w-3" />
                                          {formattedTime}
                                        </Badge>
                                      )}
                                    </h3>
                                    {analise.atencaoFlag && (
                                      <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                                    )}
                                    <Badge 
                                      variant={analise.finalizado ? "default" : "secondary"}
                                      className={`${
                                        analise.finalizado 
                                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" 
                                          : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                                      } transition-all duration-300`}
                                    >
                                      {analise.finalizado ? "Finalizada" : "Em andamento"}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-[#673193]" />
                                      <span>
                                        {analise.dataInicio 
                                          ? new Date(analise.dataInicio).toLocaleDateString('pt-BR')
                                          : 'Data não informada'
                                        }
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-emerald-600" />
                                      <span className="font-medium text-emerald-600">
                                        R$ {parseFloat(analise.preco || "150").toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-amber-500" />
                                      <span>{analise.signo || 'Signo não informado'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`transition-all duration-300 hover:scale-105 ${
                                      analise.finalizado 
                                        ? "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                        : "border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400"
                                    }`}
                                    onClick={() => handleToggleFinished(analise.id)}
                                  >
                                    {analise.finalizado ? (
                                      <X className="h-4 w-4" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 hover:border-[#673193] transition-all duration-300 hover:scale-105"
                                    onClick={() => navigate(`/editar-analise-frequencial/${analise.id}`)}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-300 hover:scale-105"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir a análise de <strong>{analise.nomeCliente}</strong>? 
                                          Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="hover:bg-slate-100 transition-colors duration-300">
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDelete(analise.id)}
                                          className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Botão de Pagamentos do Plano - aparece apenas se o plano estiver ativo */}
                          {analise.planoAtivo && analise.planoData && (
                            <PlanoPaymentButton
                              analysisId={analise.id}
                              clientName={analise.nomeCliente}
                              planoData={analise.planoData}
                              startDate={analise.dataInicio || analise.dataAtendimento || new Date().toISOString().split('T')[0]}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, delay = "0s" }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105 animate-fade-in" style={{ animationDelay: delay }}>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-[#673193] transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#673193]/10 group-hover:bg-[#673193]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ListagemTarot;
