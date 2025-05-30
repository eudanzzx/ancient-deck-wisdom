
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import DashboardBirthdayNotifications from "@/components/DashboardBirthdayNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
import { CalendarDays, Users, Activity, BellRing, Search, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TratamentoCountdown from "@/components/TratamentoCountdown";
import Logo from "@/components/Logo";

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

// Componente otimizado com React.memo
const DashboardCard = React.memo(({ title, value, icon, delay = "0s" }: { title: string; value: string; icon: React.ReactNode; delay?: string }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group hover:bg-white transform hover:scale-105" style={{ animationDelay: delay }}>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-blue-600/10 group-hover:bg-blue-600/20 transition-all duration-300">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 relative overflow-hidden">
      {/* Simplified background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-sky-200/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/15 to-sky-300/15 rounded-full blur-3xl opacity-60"></div>
      </div>

      <DashboardHeader />

      <main className="container mx-auto py-24 px-4 relative z-10">
        <DashboardBirthdayNotifications />
        
        {aniversarianteHoje && (
          <ClientBirthdayAlert 
            clientName={aniversarianteHoje.nome}
            birthDate={aniversarianteHoje.dataNascimento}
            context="tarot"
          />
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-transform duration-200">
              <Logo height={50} width={50} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-blue-600 mt-1 opacity-80">Gerencie seus atendimentos</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-blue-600/60">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Sistema Inteligente</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-800">Visão Geral</h2>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30">
            <ToggleGroup 
              type="single" 
              value={periodoVisualizacao} 
              onValueChange={handlePeriodoChange}
              className="border rounded-xl overflow-hidden"
            >
              <ToggleGroupItem value="dia" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 transition-colors duration-200">
                Dia
              </ToggleGroupItem>
              <ToggleGroupItem value="semana" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 transition-colors duration-200">
                Semana
              </ToggleGroupItem>
              <ToggleGroupItem value="mes" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 transition-colors duration-200">
                Mês
              </ToggleGroupItem>
              <ToggleGroupItem value="ano" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 transition-colors duration-200">
                Ano
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <TratamentoCountdown analises={atendimentos} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Atendimentos" 
            value={atendimentos.length.toString()} 
            icon={<Users className="h-8 w-8 text-blue-600" />} 
          />
          <DashboardCard 
            title="Esta Semana" 
            value={stats.atendimentosSemana.toString()}
            icon={<CalendarDays className="h-8 w-8 text-blue-600" />} 
          />
          <DashboardCard 
            title={`Recebido (${getPeriodoLabel()})`}
            value={`R$ ${stats.totalRecebido.toFixed(2)}`} 
            icon={<Activity className="h-8 w-8 text-blue-600" />} 
          />
          <DashboardCard 
            title="Tratamentos" 
            value={stats.totalLembretes.toString()} 
            icon={<BellRing className="h-8 w-8 text-blue-600" />} 
          />
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-800">Atendimentos</h2>
          <div className="relative group">
            <Input 
              type="text" 
              placeholder="Buscar por nome..." 
              className="pr-10 bg-white/90 border-white/30 focus:border-blue-600 focus:ring-blue-600/20 transition-all duration-200 w-64"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
          </div>
        </div>

        <AtendimentosTable 
          atendimentos={filteredAtendimentos}
          onDeleteAtendimento={handleDeleteAtendimento}
        />
      </main>
    </div>
  );
};

export default Index;
