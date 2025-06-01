
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, Users, Activity, Sparkles, TrendingUp } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ReportManager from "@/components/ReportManager";
import TarotPlanoNotifications from "@/components/TarotPlanoNotifications";

const RelatorioGeralTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [analises] = useState(getAllTarotAnalyses());

  const calcularEstatisticas = () => {
    const hoje = new Date();
    const receitaTotal = analises.reduce((sum, analise) => sum + parseFloat(analise.preco || "150"), 0);
    
    const receitaMesAtual = analises
      .filter(analise => {
        const data = new Date(analise.dataInicio);
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
      })
      .reduce((sum, analise) => sum + parseFloat(analise.preco || "150"), 0);

    const analisesFinalizadas = analises.filter(a => a.finalizado === true).length;
    const analisesPendentes = analises.filter(a => a.finalizado !== true).length;
    const ticketMedio = receitaTotal / analises.length || 0;

    return {
      receitaTotal,
      receitaMesAtual,
      analisesFinalizadas,
      analisesPendentes,
      ticketMedio,
      totalAnalises: analises.length
    };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <Sparkles className="h-12 w-12 text-[#6B21A8]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#6B21A8] bg-gradient-to-r from-[#6B21A8] to-purple-600 bg-clip-text text-transparent">
                Relatorios Gerais - Tarot
              </h1>
              <p className="text-[#6B21A8] mt-1 opacity-80">Visao geral das analises de tarot frequencial</p>
            </div>
          </div>
        </div>

        {/* Tarot Plan Notifications */}
        <TarotPlanoNotifications />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total de Analises" 
            value={stats.totalAnalises.toString()} 
            icon={<Users className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Analises Finalizadas" 
            value={stats.analisesFinalizadas.toString()}
            icon={<Activity className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Analises Pendentes"
            value={stats.analisesPendentes.toString()} 
            icon={<Calendar className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Receita Total" 
            value={`R$ ${stats.receitaTotal.toFixed(2)}`} 
            icon={<TrendingUp className="h-8 w-8 text-[#6B21A8]" />} 
          />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#6B21A8]">Opcoes de Relatorios</CardTitle>
            <CardDescription>Gere relatorios detalhados dos dados do tarot</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportManager variant="tarot" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatorioGeralTarot;
