
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, FileText, TrendingUp, Users, Sparkles } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import useUserDataService from "@/services/userDataService";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ReportManager from "@/components/ReportManager";

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface AnaliseFrequencial {
  id: string;
  nomeCliente: string;
  dataAnalise: string;
  tipoServico: string;
  valor: number;
  cartasEscolhidas: string[];
  significados: string[];
  orientacoes: string[];
  pontosPotenciais: string[];
  alertas: string[];
  cartaMensal?: string;
}

const RelatoriosFrequencial = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [analises] = useState<AnaliseFrequencial[]>(getAllTarotAnalyses());

  const calcularEstatisticas = () => {
    const hoje = new Date();
    const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());

    const analisesMesAtual = analises.filter(analise => {
      const dataAnalise = new Date(analise.dataAnalise);
      return dataAnalise >= umMesAtras && dataAnalise <= hoje;
    });

    const totalAnalises = analises.length;
    const analisesMes = analisesMesAtual.length;
    const receitaTotal = analises.reduce((sum, analise) => sum + Number(analise.valor || 0), 0);
    const receitaMes = analisesMesAtual.reduce((sum, analise) => sum + Number(analise.valor || 0), 0);

    return {
      totalAnalises,
      analisesMes,
      receitaTotal,
      receitaMes
    };
  };

  const gerarDadosGraficoMensal = () => {
    const dadosPorMes: { [key: string]: { analises: number; receita: number } } = {};

    analises.forEach(analise => {
      const data = new Date(analise.dataAnalise);
      const mesAno = format(data, 'MM/yyyy');
      
      if (!dadosPorMes[mesAno]) {
        dadosPorMes[mesAno] = { analises: 0, receita: 0 };
      }
      
      dadosPorMes[mesAno].analises += 1;
      dadosPorMes[mesAno].receita += Number(analise.valor || 0);
    });

    return Object.entries(dadosPorMes)
      .map(([mes, dados]) => ({
        mes,
        analises: dados.analises,
        receita: dados.receita
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-6);
  };

  const gerarRelatorioCompleto = () => {
    const doc = new jsPDF();
    const stats = calcularEstatisticas();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(107, 33, 168);
    doc.text('Relatório Tarot - Análise Frequencial', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 45);
    
    // Estatísticas
    doc.setFontSize(16);
    doc.setTextColor(107, 33, 168);
    doc.text('Estatísticas Gerais', 20, 65);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de Análises: ${stats.totalAnalises}`, 20, 80);
    doc.text(`Análises este Mês: ${stats.analisesMes}`, 20, 95);
    doc.text(`Receita Total: R$ ${stats.receitaTotal.toFixed(2)}`, 20, 110);
    doc.text(`Receita este Mês: R$ ${stats.receitaMes.toFixed(2)}`, 20, 125);
    
    // Tabela de análises
    const tableData = analises.map(analise => [
      analise.nomeCliente,
      format(new Date(analise.dataAnalise), 'dd/MM/yyyy'),
      `R$ ${Number(analise.valor || 0).toFixed(2)}`,
      analise.cartasEscolhidas?.slice(0, 3).join(', ') || 'N/A'
    ]);

    doc.autoTable({
      head: [['Cliente', 'Data', 'Valor', 'Cartas Principais']],
      body: tableData,
      startY: 140,
      styles: {
        fontSize: 10,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [107, 33, 168],
        textColor: [255, 255, 255],
      },
    });

    doc.save('relatorio-tarot-frequencial.pdf');
  };

  const stats = calcularEstatisticas();
  const dadosGrafico = gerarDadosGraficoMensal();

  const chartConfig = {
    analises: {
      label: "Análises",
      color: "#8B5CF6",
    },
    receita: {
      label: "Receita",
      color: "#A855F7",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <Sparkles className="h-12 w-12 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-purple-800 bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                Relatórios Tarot
              </h1>
              <p className="text-purple-600 mt-1 opacity-80">Análise frequencial e insights</p>
            </div>
          </div>
          
          <Button 
            onClick={gerarRelatorioCompleto}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Análises" 
            value={stats.totalAnalises.toString()} 
            icon={<FileText className="h-8 w-8 text-purple-600" />} 
          />
          <StatCard 
            title="Este Mês" 
            value={stats.analisesMes.toString()}
            icon={<Calendar className="h-8 w-8 text-purple-600" />} 
          />
          <StatCard 
            title="Receita Total"
            value={`R$ ${stats.receitaTotal.toFixed(2)}`} 
            icon={<TrendingUp className="h-8 w-8 text-purple-600" />} 
          />
          <StatCard 
            title="Receita Mensal" 
            value={`R$ ${stats.receitaMes.toFixed(2)}`} 
            icon={<Users className="h-8 w-8 text-purple-600" />} 
          />
        </div>

        {/* Gráfico */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-purple-800">Evolução Mensal</CardTitle>
            <CardDescription>Análises e receita por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="analises" fill="#8B5CF6" />
                  <Bar dataKey="receita" fill="#A855F7" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Relatórios */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-purple-800">Relatórios Detalhados</CardTitle>
            <CardDescription>Gere relatórios personalizados</CardDescription>
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
          <p className="text-3xl font-bold text-slate-800 group-hover:text-purple-700 transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-purple-600/10 group-hover:bg-purple-600/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatoriosFrequencial;
