
import React, { useState, useEffect } from 'react';
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

interface Atendimento {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento?: 'pago' | 'pendente' | 'parcelado';
}

const RelatoriosFinanceiros = () => {
  const { getAtendimentos } = useUserDataService();
  const [atendimentos] = useState<Atendimento[]>(
    getAtendimentos().filter((atendimento: Atendimento) => 
      atendimento.tipoServico !== "tarot-frequencial"
    )
  );
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("6meses");

  const calcularEstatisticas = () => {
    const hoje = new Date();
    const receitaTotal = atendimentos.reduce((sum, atendimento) => sum + parseFloat(atendimento.valor), 0);
    
    const receitaMesAtual = atendimentos
      .filter(atendimento => {
        const data = new Date(atendimento.dataAtendimento);
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
      })
      .reduce((sum, atendimento) => sum + parseFloat(atendimento.valor), 0);

    const atendimentosPagos = atendimentos.filter(a => a.statusPagamento === 'pago').length;
    const atendimentosPendentes = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
    const ticketMedio = receitaTotal / atendimentos.length || 0;

    return {
      receitaTotal,
      receitaMesAtual,
      atendimentosPagos,
      atendimentosPendentes,
      ticketMedio,
      totalAtendimentos: atendimentos.length
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

    atendimentos.forEach(atendimento => {
      const data = new Date(atendimento.dataAtendimento);
      const chave = format(data, 'MMM/yy', { locale: ptBR });
      
      if (dadosPorMes.hasOwnProperty(chave)) {
        dadosPorMes[chave] += parseFloat(atendimento.valor);
      }
    });

    return Object.entries(dadosPorMes).map(([mes, receita]) => ({
      mes,
      receita: receita
    }));
  };

  const gerarDadosGraficoPagamentos = () => {
    const pagos = atendimentos.filter(a => a.statusPagamento === 'pago').length;
    const pendentes = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
    const parcelados = atendimentos.filter(a => a.statusPagamento === 'parcelado').length;

    return [
      { name: 'Pagos', value: pagos, color: '#22C55E' },
      { name: 'Pendentes', value: pendentes, color: '#EF4444' },
      { name: 'Parcelados', value: parcelados, color: '#F59E0B' },
    ];
  };

  const gerarDadosGraficoServicos = () => {
    const servicosPorTipo: { [key: string]: { count: number; receita: number } } = {};

    atendimentos.forEach(atendimento => {
      const tipo = atendimento.tipoServico;
      if (!servicosPorTipo[tipo]) {
        servicosPorTipo[tipo] = { count: 0, receita: 0 };
      }
      servicosPorTipo[tipo].count += 1;
      servicosPorTipo[tipo].receita += parseFloat(atendimento.valor);
    });

    return Object.entries(servicosPorTipo).map(([tipo, dados]) => ({
      servico: tipo,
      quantidade: dados.count,
      receita: dados.receita
    }));
  };

  const gerarRelatorioFinanceiro = () => {
    const doc = new jsPDF();
    const stats = calcularEstatisticas();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('Relatório Financeiro', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 45);
    
    // Estatísticas Financeiras
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('Resumo Financeiro', 20, 65);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receita Total: R$ ${stats.receitaTotal.toFixed(2)}`, 20, 80);
    doc.text(`Receita Mês Atual: R$ ${stats.receitaMesAtual.toFixed(2)}`, 20, 95);
    doc.text(`Ticket Médio: R$ ${stats.ticketMedio.toFixed(2)}`, 20, 110);
    doc.text(`Total de Atendimentos: ${stats.totalAtendimentos}`, 20, 125);
    doc.text(`Pagamentos Confirmados: ${stats.atendimentosPagos}`, 20, 140);
    doc.text(`Pagamentos Pendentes: ${stats.atendimentosPendentes}`, 20, 155);

    // Tabela detalhada
    const tableData = atendimentos.map(atendimento => [
      atendimento.nome,
      format(new Date(atendimento.dataAtendimento), 'dd/MM/yyyy'),
      atendimento.tipoServico,
      `R$ ${parseFloat(atendimento.valor).toFixed(2)}`,
      atendimento.statusPagamento || 'N/A'
    ]);

    doc.autoTable({
      head: [['Cliente', 'Data', 'Serviço', 'Valor', 'Status']],
      body: tableData,
      startY: 170,
      styles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
      },
    });

    doc.save('relatorio-financeiro.pdf');
  };

  const stats = calcularEstatisticas();
  const dadosReceita = gerarDadosGraficoReceita();
  const dadosPagamentos = gerarDadosGraficoPagamentos();
  const dadosServicos = gerarDadosGraficoServicos();

  const chartConfig = {
    receita: {
      label: "Receita",
      color: "#1E40AF",
    },
    quantidade: {
      label: "Quantidade",
      color: "#3B82F6",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-sky-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <DollarSign className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                Relatórios Financeiros
              </h1>
              <p className="text-blue-600 mt-1 opacity-80">Análise completa das finanças</p>
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
              <ToggleGroupItem value="6meses" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white">
                6 Meses
              </ToggleGroupItem>
              <ToggleGroupItem value="12meses" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white">
                12 Meses
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Button 
              onClick={gerarRelatorioFinanceiro}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
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
            icon={<DollarSign className="h-8 w-8 text-blue-600" />} 
          />
          <StatCard 
            title="Receita Mês Atual" 
            value={`R$ ${stats.receitaMesAtual.toFixed(2)}`}
            icon={<Calendar className="h-8 w-8 text-blue-600" />} 
          />
          <StatCard 
            title="Ticket Médio"
            value={`R$ ${stats.ticketMedio.toFixed(2)}`} 
            icon={<TrendingUp className="h-8 w-8 text-blue-600" />} 
          />
          <StatCard 
            title="Pagos/Pendentes" 
            value={`${stats.atendimentosPagos}/${stats.atendimentosPendentes}`} 
            icon={<Activity className="h-8 w-8 text-blue-600" />} 
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Receita Mensal */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-800">Receita Mensal</CardTitle>
              <CardDescription>Evolução da receita ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosReceita}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="receita" stroke="#1E40AF" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Status de Pagamento */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-800">Status dos Pagamentos</CardTitle>
              <CardDescription>Distribuição dos status de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPagamentos}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {dadosPagamentos.map((entry, index) => (
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

        {/* Gráfico de Receita por Serviço */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-800">Receita por Tipo de Serviço</CardTitle>
            <CardDescription>Performance financeira por categoria de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosServicos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="servico" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="receita" fill="#1E40AF" />
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
          <p className="text-3xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-blue-600/10 group-hover:bg-blue-600/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatoriosFinanceiros;
