
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, DollarSign, TrendingUp, Users, Activity, Sparkles } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import useUserDataService from "@/services/userDataService";
import { jsPDF } from 'jspdf';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from 'sonner';

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

  const stats = useMemo(() => {
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
  }, [atendimentos]);

  const dadosReceita = useMemo(() => {
    const dadosPorMes: { [key: string]: number } = {};
    const mesesParaMostrar = periodoVisualizacao === "6meses" ? 6 : 12;

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
  }, [atendimentos, periodoVisualizacao]);

  const dadosPagamentos = useMemo(() => {
    const pagos = atendimentos.filter(a => a.statusPagamento === 'pago').length;
    const pendentes = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
    const parcelados = atendimentos.filter(a => a.statusPagamento === 'parcelado').length;

    return [
      { name: 'Pagos', value: pagos, color: '#22C55E' },
      { name: 'Pendentes', value: pendentes, color: '#EF4444' },
      { name: 'Parcelados', value: parcelados, color: '#F59E0B' },
    ];
  }, [atendimentos]);

  const dadosServicos = useMemo(() => {
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
  }, [atendimentos]);

  const gerarRelatorioFinanceiro = useCallback(() => {
    try {
      const doc = new jsPDF();
      
      // Configurações de cores
      const primaryColor = [30, 64, 175];
      const secondaryColor = [59, 130, 246];
      const textColor = [30, 30, 30];
      const lightGray = [248, 250, 252];
      const darkGray = [71, 85, 105];
      
      // Background gradient effect
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont(undefined, 'bold');
      doc.text('RELATÓRIO FINANCEIRO', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'normal');
      doc.text('Atendimentos Gerais - Análise Completa', 105, 30, { align: 'center' });
      
      // Data e período
      doc.setFontSize(10);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} | Período: ${periodoVisualizacao}`, 15, 50);
      
      // Cálculos financeiros
      const receitaTotal = atendimentos.reduce((sum, atendimento) => sum + parseFloat(atendimento.valor), 0);
      const atendimentosPagos = atendimentos.filter(a => a.statusPagamento === 'pago').length;
      const atendimentosPendentes = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
      const ticketMedio = receitaTotal / atendimentos.length || 0;
      const clientesUnicos = new Set(atendimentos.map(a => a.nome)).size;
      
      // Receita do mês atual
      const hoje = new Date();
      const receitaMesAtual = atendimentos
        .filter(atendimento => {
          const data = new Date(atendimento.dataAtendimento);
          return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
        })
        .reduce((sum, atendimento) => sum + parseFloat(atendimento.valor), 0);
      
      // Grid de métricas principais (2x3)
      let yPos = 65;
      const boxWidth = 60;
      const boxHeight = 30;
      const spacing = 5;
      
      // Primeira linha
      // Receita Total
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, yPos, boxWidth, boxHeight, 'F');
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.rect(15, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('RECEITA TOTAL', 45, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`R$ ${receitaTotal.toFixed(2)}`, 45, yPos + 20, { align: 'center' });
      
      // Receita Mês Atual
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(80, yPos, boxWidth, boxHeight, 'F');
      doc.rect(80, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('RECEITA MÊS ATUAL', 110, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`R$ ${receitaMesAtual.toFixed(2)}`, 110, yPos + 20, { align: 'center' });
      
      // Ticket Médio
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(145, yPos, boxWidth, boxHeight, 'F');
      doc.rect(145, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('TICKET MÉDIO', 175, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`R$ ${ticketMedio.toFixed(2)}`, 175, yPos + 20, { align: 'center' });
      
      yPos += boxHeight + spacing;
      
      // Segunda linha
      // Total Atendimentos
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, yPos, boxWidth, boxHeight, 'F');
      doc.rect(15, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL ATENDIMENTOS', 45, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(atendimentos.length.toString(), 45, yPos + 20, { align: 'center' });
      
      // Pagos
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(80, yPos, boxWidth, boxHeight, 'F');
      doc.rect(80, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('PAGAMENTOS PAGOS', 110, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94); // Green
      doc.text(atendimentosPagos.toString(), 110, yPos + 20, { align: 'center' });
      
      // Clientes Únicos
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(145, yPos, boxWidth, boxHeight, 'F');
      doc.rect(145, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('CLIENTES ÚNICOS', 175, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(clientesUnicos.toString(), 175, yPos + 20, { align: 'center' });
      
      yPos += 45;
      
      // Top 10 Clientes por Valor
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOP 10 CLIENTES POR VALOR', 15, yPos);
      
      yPos += 8;
      
      // Agrupa clientes por valor
      const clientesValor = atendimentos.reduce((acc, atendimento) => {
        const cliente = atendimento.nome;
        const valor = parseFloat(atendimento.valor);
        if (!acc[cliente]) {
          acc[cliente] = { nome: cliente, valor: 0, quantidade: 0 };
        }
        acc[cliente].valor += valor;
        acc[cliente].quantidade += 1;
        return acc;
      }, {} as Record<string, { nome: string; valor: number; quantidade: number }>);
      
      const topClientes = Object.values(clientesValor)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);
      
      // Header da tabela
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, yPos, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('CLIENTE', 20, yPos + 5);
      doc.text('QTD', 120, yPos + 5);
      doc.text('VALOR TOTAL', 155, yPos + 5);
      
      yPos += 8;
      
      // Linhas da tabela
      topClientes.forEach((cliente, index) => {
        if (yPos > 250) return; // Limite da página
        
        const rowColor = index % 2 === 0 ? [255, 255, 255] : lightGray;
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
        doc.rect(15, yPos, 180, 7, 'F');
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(cliente.nome.substring(0, 30), 20, yPos + 4);
        doc.text(cliente.quantidade.toString(), 120, yPos + 4);
        doc.text(`R$ ${cliente.valor.toFixed(2)}`, 155, yPos + 4);
        
        yPos += 7;
      });
      
      // Faturamento mensal (mini gráfico)
      if (yPos < 240) {
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('EVOLUÇÃO MENSAL', 15, yPos);
        
        yPos += 8;
        
        const dadosMensais = dadosReceita.slice(-6); // Últimos 6 meses
        const maxValor = Math.max(...dadosMensais.map(d => d.receita));
        
        dadosMensais.forEach((mes, index) => {
          if (yPos > 270) return;
          
          const barWidth = maxValor > 0 ? (mes.receita / maxValor) * 100 : 0;
          
          // Barra
          doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          doc.rect(15, yPos, barWidth, 4, 'F');
          
          // Texto
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(8);
          doc.text(`${mes.mes}: R$ ${mes.receita.toFixed(2)}`, 125, yPos + 3);
          
          yPos += 8;
        });
      }
      
      // Footer decorativo
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(2);
      doc.line(15, 285, 195, 285);
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(8);
      doc.text('Libertá - Sistema de Gestão | Relatório Financeiro Personalizado', 105, 292, { align: 'center' });
      
      // Salvar
      const fileName = `Relatorio_Financeiro_Geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success('Relatório financeiro personalizado gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório financeiro');
    }
  }, [atendimentos, periodoVisualizacao, dadosReceita]);

  const chartConfig = useMemo(() => ({
    receita: {
      label: "Receita",
      color: "#1E40AF",
    },
    quantidade: {
      label: "Quantidade",
      color: "#3B82F6",
    },
  }), []);

  const handlePeriodoChange = useCallback((value: string | undefined) => {
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
              onValueChange={handlePeriodoChange}
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
              Relatório PDF
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
