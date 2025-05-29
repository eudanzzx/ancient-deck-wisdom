
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, DollarSign, TrendingUp, Users, Activity, Sparkles } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import useUserDataService from "@/services/userDataService";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface TarotAnalise {
  id: string;
  nomeCliente: string;
  dataInicio: string;
  preco: string;
  finalizado: boolean;
}

const RelatoriosFrequenciaisTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [analises] = useState<TarotAnalise[]>(getAllTarotAnalyses());
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("6meses");

  const calcularEstatisticas = () => {
    const hoje = new Date();
    const receitaTotal = analises.reduce((sum, analise) => sum + parseFloat(analise.preco || "150"), 0);
    
    const receitaMesAtual = analises
      .filter(analise => {
        const data = new Date(analise.dataInicio);
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
      })
      .reduce((sum, analise) => sum + parseFloat(analise.preco || "150"), 0);

    const analisesFinalizadas = analises.filter(a => a.finalizado).length;
    const analisesPendentes = analises.filter(a => !a.finalizado).length;
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

  const gerarDadosGraficoReceita = () => {
    const dadosPorMes: { [key: string]: number } = {};
    const mesesParaMostrar = periodoVisualizacao === "6meses" ? 6 : 12;

    // Inicializar últimos meses
    for (let i = mesesParaMostrar - 1; i >= 0; i--) {
      const data = subMonths(new Date(), i);
      const chave = format(data, 'MMM/yy', { locale: ptBR });
      dadosPorMes[chave] = 0;
    }

    analises.forEach(analise => {
      const data = new Date(analise.dataInicio);
      const chave = format(data, 'MMM/yy', { locale: ptBR });
      
      if (dadosPorMes.hasOwnProperty(chave)) {
        dadosPorMes[chave] += parseFloat(analise.preco || "150");
      }
    });

    return Object.entries(dadosPorMes).map(([mes, receita]) => ({
      mes,
      receita: receita
    }));
  };

  const gerarDadosGraficoStatus = () => {
    const finalizadas = analises.filter(a => a.finalizado).length;
    const pendentes = analises.filter(a => !a.finalizado).length;

    return [
      { name: 'Finalizadas', value: finalizadas, color: '#22C55E' },
      { name: 'Pendentes', value: pendentes, color: '#F59E0B' },
    ];
  };

  const gerarRelatorioTarot = () => {
    const doc = new jsPDF();
    const stats = calcularEstatisticas();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(107, 33, 168);
    doc.text('Relatório Financeiro - Tarot Frequencial', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 45);
    
    // Estatísticas Financeiras
    doc.setFontSize(16);
    doc.setTextColor(107, 33, 168);
    doc.text('Resumo Financeiro', 20, 65);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receita Total: R$ ${stats.receitaTotal.toFixed(2)}`, 20, 80);
    doc.text(`Receita Mês Atual: R$ ${stats.receitaMesAtual.toFixed(2)}`, 20, 95);
    doc.text(`Ticket Médio: R$ ${stats.ticketMedio.toFixed(2)}`, 20, 110);
    doc.text(`Total de Análises: ${stats.totalAnalises}`, 20, 125);
    doc.text(`Análises Finalizadas: ${stats.analisesFinalizadas}`, 20, 140);
    doc.text(`Análises Pendentes: ${stats.analisesPendentes}`, 20, 155);

    // Tabela detalhada
    const tableData = analises.map(analise => [
      analise.nomeCliente,
      format(new Date(analise.dataInicio), 'dd/MM/yyyy'),
      `R$ ${parseFloat(analise.preco || "150").toFixed(2)}`,
      analise.finalizado ? 'Finalizada' : 'Pendente'
    ]);

    doc.autoTable({
      head: [['Cliente', 'Data', 'Valor', 'Status']],
      body: tableData,
      startY: 170,
      styles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [107, 33, 168],
        textColor: [255, 255, 255],
      },
    });

    doc.save('relatorio-financeiro-tarot.pdf');
  };

  const stats = calcularEstatisticas();
  const dadosReceita = gerarDadosGraficoReceita();
  const dadosStatus = gerarDadosGraficoStatus();

  const chartConfig = {
    receita: {
      label: "Receita",
      color: "#6B21A8",
    },
    quantidade: {
      label: "Quantidade",
      color: "#8B5CF6",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
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
                Relatórios Financeiros - Tarot
              </h1>
              <p className="text-[#6B21A8] mt-1 opacity-80">Análise financeira do tarot frequencial</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ToggleGroup 
              type="single" 
              value={periodoVisualizacao} 
              onValueChange={(value) => {
                if (value) setPeriodoVisualizacao(value);
              }}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30"
            >
              <ToggleGroupItem value="6meses" className="data-[state=on]:bg-[#6B21A8] data-[state=on]:text-white">
                6 Meses
              </ToggleGroupItem>
              <ToggleGroupItem value="12meses" className="data-[state=on]:bg-[#6B21A8] data-[state=on]:text-white">
                12 Meses
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Button 
              onClick={gerarRelatorioTarot}
              className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Receita Total" 
            value={`R$ ${stats.receitaTotal.toFixed(2)}`} 
            icon={<DollarSign className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Receita Mês Atual" 
            value={`R$ ${stats.receitaMesAtual.toFixed(2)}`}
            icon={<Calendar className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Ticket Médio"
            value={`R$ ${stats.ticketMedio.toFixed(2)}`} 
            icon={<TrendingUp className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Finalizadas/Pendentes" 
            value={`${stats.analisesFinalizadas}/${stats.analisesPendentes}`} 
            icon={<Activity className="h-8 w-8 text-[#6B21A8]" />} 
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Receita Mensal */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#6B21A8]">Receita Mensal - Tarot</CardTitle>
              <CardDescription>Evolução da receita do tarot frequencial</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosReceita}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="receita" stroke="#6B21A8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Status das Análises */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#6B21A8]">Status das Análises</CardTitle>
              <CardDescription>Distribuição das análises por status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {dadosStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Análises por Mês */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#6B21A8]">Análises por Mês</CardTitle>
            <CardDescription>Quantidade de análises realizadas mensalmente</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosReceita}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="receita" fill="#6B21A8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
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

export default RelatoriosFrequenciaisTarot;
