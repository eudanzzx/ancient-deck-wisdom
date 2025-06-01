import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import { CalendarDays, Users, Activity, BellRing, Search, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

// Componente elegante com React.memo e animações aprimoradas
const ElegantDashboardCard = React.memo(({ 
  title, 
  value, 
  icon, 
  delay = "0s",
  gradient = "from-blue-500 to-purple-600"
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  delay?: string;
  gradient?: string;
}) => (
  <Card 
    className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-700 hover:bg-white hover:-translate-y-3 hover:scale-105 animate-fade-scale" 
    style={{ animationDelay: delay }}
  >
    {/* Gradient border effect */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} p-[1px] rounded-3xl`}>
      <div className="bg-white rounded-3xl h-full w-full" />
    </div>
    
    {/* Shimmer effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
    </div>

    <CardContent className="relative pt-8 pb-6 px-6 z-10">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300 tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-500">
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-4 bg-gradient-to-br ${gradient} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </CardContent>
  </Card>
));

ElegantDashboardCard.displayName = "ElegantDashboardCard";

const Index = () => {
  const { getAtendimentos, saveAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("semana");
  const [aniversarianteHoje, setAniversarianteHoje] = useState<{nome: string, dataNascimento: string} | null>(null);

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

  const checkBirthdaysToday = useCallback((atendimentos: Atendimento[]) => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    
    const birthdayClient = atendimentos.find(atendimento => {
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
  }, [getAtendimentos, checkBirthdaysToday]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 relative overflow-hidden">
      {/* Elegant animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float opacity-70" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-violet-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <DashboardHeader />

      <main className="container mx-auto py-24 px-4 relative z-10">
        <DashboardContent 
          aniversarianteHoje={aniversarianteHoje}
          atendimentos={atendimentos}
        />

        <DashboardTitle />

        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 via-purple-700 to-blue-800 bg-clip-text text-transparent">
              Visão Geral
            </h2>
            <p className="text-slate-600 text-sm">Acompanhe o desempenho dos seus atendimentos</p>
          </div>
          <div className="glass rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <ToggleGroup 
              type="single" 
              value={periodoVisualizacao} 
              onValueChange={handlePeriodoChange}
              className="border-0 rounded-2xl overflow-hidden p-1"
            >
              <ToggleGroupItem 
                value="dia" 
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-600 data-[state=on]:to-purple-600 data-[state=on]:text-white px-6 py-2 transition-all duration-300 hover:bg-blue-50 hover:scale-105 rounded-xl font-medium"
              >
                Dia
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="semana" 
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-600 data-[state=on]:to-purple-600 data-[state=on]:text-white px-6 py-2 transition-all duration-300 hover:bg-blue-50 hover:scale-105 rounded-xl font-medium"
              >
                Semana
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="mes" 
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-600 data-[state=on]:to-purple-600 data-[state=on]:text-white px-6 py-2 transition-all duration-300 hover:bg-blue-50 hover:scale-105 rounded-xl font-medium"
              >
                Mês
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="ano" 
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-600 data-[state=on]:to-purple-600 data-[state=on]:text-white px-6 py-2 transition-all duration-300 hover:bg-blue-50 hover:scale-105 rounded-xl font-medium"
              >
                Ano
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <ElegantDashboardCard 
            title="Total Atendimentos" 
            value={atendimentos.length.toString()} 
            icon={<Users className="h-8 w-8" />}
            delay="0.1s"
            gradient="from-blue-500 to-cyan-500"
          />
          <ElegantDashboardCard 
            title="Esta Semana" 
            value={stats.atendimentosSemana.toString()}
            icon={<CalendarDays className="h-8 w-8" />}
            delay="0.2s" 
            gradient="from-purple-500 to-pink-500"
          />
          <ElegantDashboardCard 
            title={`Recebido (${getPeriodoLabel()})`}
            value={`R$ ${stats.totalRecebido.toFixed(2)}`} 
            icon={<TrendingUp className="h-8 w-8" />}
            delay="0.3s"
            gradient="from-emerald-500 to-teal-500"
          />
          <ElegantDashboardCard 
            title="Tratamentos" 
            value={stats.totalLembretes.toString()} 
            icon={<BellRing className="h-8 w-8" />}
            delay="0.4s"
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 via-purple-700 to-blue-800 bg-clip-text text-transparent">
              Atendimentos
            </h2>
            <p className="text-slate-600 text-sm">Lista completa de todos os atendimentos realizados</p>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Buscar por nome..." 
                className="pr-12 pl-4 py-3 bg-white/90 border-0 focus:border-0 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 w-80 hover:shadow-lg transform hover:scale-105 rounded-2xl backdrop-blur-sm input-elegant"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" />
            </div>
          </div>
        </div>

        <div className="transform hover:scale-[1.01] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl">
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
