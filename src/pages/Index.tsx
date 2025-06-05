import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import DashboardBirthdayNotifications from "@/components/DashboardBirthdayNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
import TarotPlanoNotifications from "@/components/TarotPlanoNotifications";
import { CalendarDays, Users, Activity, BellRing, Search, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TratamentoCountdown from "@/components/TratamentoCountdown";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Componente otimizado com React.memo e animações aprimoradas
const DashboardCard = React.memo(({ title, value, icon, delay = "0s" }: { title: string; value: string; icon: React.ReactNode; delay?: string }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105" style={{ animationDelay: delay }}>
    <CardContent className="pt-4 sm:pt-6">
      <div className="flex justify-between items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300 truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300 truncate">{value}</p>
        </div>
        <div className="rounded-xl p-2 sm:p-3 bg-blue-600/10 group-hover:bg-blue-600/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 flex-shrink-0">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
));

DashboardCard.displayName = "DashboardCard";

const Index = () => {
  const { getAtendimentos, saveAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("semana");
  const [aniversarianteHoje, setAniversarianteHoje] = useState<{nome: string, dataNascimento: string} | null>(null);
  const isMobile = useIsMobile();

  // Memoizar atendimentos filtrados para evitar recálculos desnecessários
  const filteredAtendimentos = useMemo(() => {
    if (!searchTerm) return atendimentos;
    return atendimentos.filter(atendimento =>
      atendimento.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, atendimentos]);

  // Memoizar cálculos de estatísticas
  const stats = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    let dataInicio = new Date(hoje);
    
    switch(periodoVisualizacao) {
      case "dia":
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "semana":
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - hoje.getDay());
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "mes":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "ano":
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      default:
        dataInicio.setDate(hoje.getDate() - hoje.getDay());
        dataInicio.setHours(0, 0, 0, 0);
    }
    
    const atendimentosFiltrados = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= dataInicio && dataAtendimento <= hoje;
    });
    
    const totalRecebido = atendimentosFiltrados.reduce((sum, atendimento) => {
      const valor = parseFloat(atendimento.valor) || 0;
      return sum + valor;
    }, 0);

    // Cálculo de atendimentos da semana
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    const atendimentosDestaSemana = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioSemana && dataAtendimento <= hoje;
    });

    const contarLembretes = atendimentos.reduce((count, atendimento) => {
      if (atendimento.tratamento && atendimento.tratamento.trim()) {
        return count + 1;
      }
      return count;
    }, 0);

    return {
      totalRecebido,
      atendimentosSemana: atendimentosDestaSemana.length,
      totalLembretes: contarLembretes
    };
  }, [atendimentos, periodoVisualizacao]);

  const checkBirthdaysToday = useCallback((atendimentosList: Atendimento[]) => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    
    const birthdayClient = atendimentosList.find(atendimento => {
      if (!atendimento.dataNascimento) return false;
      
      try {
        const [year, month, day] = atendimento.dataNascimento.split('-').map(Number);
        return day === todayDay && month === todayMonth;
      } catch (error) {
        console.error('Error parsing birth date:', error);
        return false;
      }
    });
    
    if (birthdayClient) {
      setAniversarianteHoje({
        nome: birthdayClient.nome,
        dataNascimento: birthdayClient.dataNascimento
      });
    }
  }, []);

  useEffect(() => {
    console.log('Index - Loading atendimentos...');
    const regularAtendimentos = getAtendimentos().filter((atendimento: Atendimento) => 
      atendimento.tipoServico !== "tarot-frequencial"
    );
    
    console.log('Index - Regular atendimentos loaded:', regularAtendimentos.length);
    setAtendimentos(regularAtendimentos);
    checkBirthdaysToday(regularAtendimentos);
  }, []); // Remove getAtendimentos from dependencies to prevent infinite loop

  const getPeriodoLabel = useCallback(() => {
    switch(periodoVisualizacao) {
      case "dia":
        return "Hoje";
      case "semana":
        return "Esta Semana";
      case "mes":
        return "Este Mês";
      case "ano":
        return "Este Ano";
      default:
        return "Esta Semana";
    }
  }, [periodoVisualizacao]);

  const handleDeleteAtendimento = useCallback((id: string) => {
    console.log('Index - Deleting atendimento:', id);
    const allAtendimentos = getAtendimentos();
    const updatedAtendimentos = allAtendimentos.filter(
      (atendimento: Atendimento) => atendimento.id !== id
    );
    
    saveAtendimentos(updatedAtendimentos);
    
    const regularAtendimentos = updatedAtendimentos.filter((atendimento: Atendimento) => 
      atendimento.tipoServico !== "tarot-frequencial"
    );
    setAtendimentos(regularAtendimentos);
  }, [getAtendimentos, saveAtendimentos]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePeriodoChange = useCallback((value: string) => {
    if (value) setPeriodoVisualizacao(value);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-sky-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <DashboardHeader />

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4 relative z-10">
        <DashboardBirthdayNotifications />
        
        {/* Tarot Plan Notifications */}
        <TarotPlanoNotifications />
        
        {aniversarianteHoje && (
          <ClientBirthdayAlert 
            clientName={aniversarianteHoje.nome}
            birthDate={aniversarianteHoje.dataNascimento}
            context="tarot"
          />
        )}

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="transform hover:scale-110 transition-transform duration-300 cursor-pointer flex-shrink-0">
              <Logo height={isMobile ? 40 : 50} width={isMobile ? 40 : 50} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent truncate">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-blue-600 mt-1 opacity-80 truncate">Gerencie seus atendimentos</p>
            </div>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-2 text-blue-600/60 hover:text-blue-600 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 flex-shrink-0">
              <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-sm font-medium">Sistema Inteligente</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-800">Visão Geral</h2>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 w-full sm:w-auto">
            <ToggleGroup 
              type="single" 
              value={periodoVisualizacao} 
              onValueChange={handlePeriodoChange}
              className="border rounded-xl overflow-hidden"
            >
              <ToggleGroupItem value="dia" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-2 sm:px-4 text-xs sm:text-sm transition-all duration-300 hover:bg-blue-50 hover:scale-105">
                Dia
              </ToggleGroupItem>
              <ToggleGroupItem value="semana" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-2 sm:px-4 text-xs sm:text-sm transition-all duration-300 hover:bg-blue-50 hover:scale-105">
                Semana
              </ToggleGroupItem>
              <ToggleGroupItem value="mes" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-2 sm:px-4 text-xs sm:text-sm transition-all duration-300 hover:bg-blue-50 hover:scale-105">
                Mês
              </ToggleGroupItem>
              <ToggleGroupItem value="ano" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-2 sm:px-4 text-xs sm:text-sm transition-all duration-300 hover:bg-blue-50 hover:scale-105">
                Ano
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1 mb-6 sm:mb-8">
          <TratamentoCountdown analises={atendimentos} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <DashboardCard 
            title="Total Atendimentos" 
            value={atendimentos.length.toString()} 
            icon={<Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />} 
          />
          <DashboardCard 
            title="Esta Semana" 
            value={stats.atendimentosSemana.toString()}
            icon={<CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />} 
          />
          <DashboardCard 
            title={`Recebido (${getPeriodoLabel()})`}
            value={`R$ ${stats.totalRecebido.toFixed(2)}`} 
            icon={<Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />} 
          />
          <DashboardCard 
            title="Tratamentos" 
            value={stats.totalLembretes.toString()} 
            icon={<BellRing className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />} 
          />
        </div>

        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-800">Atendimentos</h2>
          <div className="relative group w-full sm:w-auto">
            <Input 
              type="text" 
              placeholder="Buscar por nome..." 
              className="pr-10 bg-white/90 border-white/30 focus:border-blue-600 focus:ring-blue-600/20 transition-all duration-300 w-full sm:w-64 hover:shadow-lg transform hover:scale-105 hover:-translate-y-1"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
          </div>
        </div>

        <div className="transform hover:scale-[1.01] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
          <AtendimentosTable 
            atendimentos={filteredAtendimentos}
            onDeleteAtendimento={handleDeleteAtendimento}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
