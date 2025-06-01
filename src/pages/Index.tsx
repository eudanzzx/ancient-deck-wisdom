
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { CalendarDays, Users, Activity, BellRing, Search, TrendingUp } from "lucide-react";
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

// Simple dashboard card component
const DashboardCard = React.memo(({ 
  title, 
  value, 
  icon, 
  delay = "0s"
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  delay?: string;
}) => (
  <Card 
    className="bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300" 
    style={{ animationDelay: delay }}
  >
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-blue-700">
            {value}
          </p>
        </div>
        <div className="rounded-lg p-3 bg-blue-100">
          <div className="text-blue-600">
            {icon}
          </div>
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto py-24 px-4">
        <DashboardContent 
          aniversarianteHoje={aniversarianteHoje}
          atendimentos={atendimentos}
        />

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            Sistema de Atendimentos
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Visão Geral
            </h2>
            <p className="text-gray-600">Acompanhe o desempenho dos seus atendimentos</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1">
            <ToggleGroup 
              type="single" 
              value={periodoVisualizacao} 
              onValueChange={handlePeriodoChange}
              className="border-0"
            >
              <ToggleGroupItem 
                value="dia" 
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 py-2 transition-all duration-300"
              >
                Dia
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="semana" 
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 py-2 transition-all duration-300"
              >
                Semana
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="mes" 
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 py-2 transition-all duration-300"
              >
                Mês
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="ano" 
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white px-4 py-2 transition-all duration-300"
              >
                Ano
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardCard 
            title="Total Atendimentos" 
            value={atendimentos.length.toString()} 
            icon={<Users className="h-6 w-6" />}
            delay="0.1s"
          />
          <DashboardCard 
            title="Esta Semana" 
            value={stats.atendimentosSemana.toString()}
            icon={<CalendarDays className="h-6 w-6" />}
            delay="0.2s" 
          />
          <DashboardCard 
            title={`Recebido (${getPeriodoLabel()})`}
            value={`R$ ${stats.totalRecebido.toFixed(2)}`} 
            icon={<TrendingUp className="h-6 w-6" />}
            delay="0.3s"
          />
          <DashboardCard 
            title="Tratamentos" 
            value={stats.totalLembretes.toString()} 
            icon={<BellRing className="h-6 w-6" />}
            delay="0.4s"
          />
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Atendimentos
            </h2>
            <p className="text-gray-600">Lista completa de todos os atendimentos realizados</p>
          </div>
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Buscar por nome..." 
              className="pr-10 pl-4 py-2 bg-white border border-gray-300 w-80"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
