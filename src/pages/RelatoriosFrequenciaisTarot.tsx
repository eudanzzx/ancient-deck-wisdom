import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { jsPDF } from 'jspdf';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TarotStatsCards from "@/components/reports/TarotStatsCards";
import TarotCharts from "@/components/charts/TarotCharts";
import { toast } from 'sonner';

interface TarotAnalise {
  id: string;
  nomeCliente: string;
  dataInicio: string;
  preco: string;
  finalizado: boolean;
}

const RelatoriosFrequenciaisTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const rawAnalises = getAllTarotAnalyses();
  
  // Convert to the expected interface format
  const [analises] = useState<TarotAnalise[]>(
    rawAnalises.map(analise => ({
      id: analise.id,
      nomeCliente: analise.nomeCliente,
      dataInicio: analise.dataInicio,
      preco: analise.preco,
      finalizado: analise.finalizado ?? false
    }))
  );
  
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("6meses");

  const stats = useMemo(() => {
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
  }, [analises]);

  const dadosReceita = useMemo(() => {
    const dadosPorMes: { [key: string]: number } = {};
    const mesesParaMostrar = periodoVisualizacao === "6meses" ? 6 : 12;

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
  }, [analises, periodoVisualizacao]);

  const dadosStatus = useMemo(() => {
    const finalizadas = analises.filter(a => a.finalizado).length;
    const pendentes = analises.filter(a => !a.finalizado).length;

    return [
      { name: 'Finalizadas', value: finalizadas, color: '#22C55E' },
      { name: 'Pendentes', value: pendentes, color: '#F59E0B' },
    ];
  }, [analises]);

  const gerarRelatorioTarot = useCallback(() => {
    try {
      const doc = new jsPDF();
      
      // Configurações de cores
      const primaryColor = [107, 33, 168];
      const secondaryColor = [139, 92, 246];
      const textColor = [30, 30, 30];
      const lightGray = [248, 250, 252];
      const darkGray = [71, 85, 105];
      
      // Background gradient effect
      doc.setFillColor(107, 33, 168);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont(undefined, 'bold');
      doc.text('RELATÓRIO FINANCEIRO', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'normal');
      doc.text('Tarot Frequencial - Análise Completa', 105, 30, { align: 'center' });
      
      // Data e período
      doc.setFontSize(10);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} | Período: ${periodoVisualizacao}`, 15, 50);
      
      // Cálculos financeiros
      const receitaTotal = analises.reduce((sum, analise) => sum + parseFloat(analise.preco || "150"), 0);
      const analisesFinalizadas = analises.filter(a => a.finalizado).length;
      const analisesPendentes = analises.filter(a => !a.finalizado).length;
      const ticketMedio = receitaTotal / analises.length || 0;
      const clientesUnicos = new Set(analises.map(a => a.nomeCliente)).size;
      
      // Receita do mês atual
      const hoje = new Date();
      const receitaMesAtual = analises
        .filter(analise => {
          const data = new Date(analise.dataInicio);
          return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
        })
        .reduce((sum, analise) => sum + parseFloat(analise.preco || "150"), 0);
      
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
      // Total Análises
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, yPos, boxWidth, boxHeight, 'F');
      doc.rect(15, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL ANÁLISES', 45, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(analises.length.toString(), 45, yPos + 20, { align: 'center' });
      
      // Finalizadas
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(80, yPos, boxWidth, boxHeight, 'F');
      doc.rect(80, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('FINALIZADAS', 110, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94); // Green
      doc.text(analisesFinalizadas.toString(), 110, yPos + 20, { align: 'center' });
      
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
      const clientesValor = analises.reduce((acc, analise) => {
        const cliente = analise.nomeCliente;
        const valor = parseFloat(analise.preco || "150");
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
      const fileName = `Relatorio_Financeiro_Tarot_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success('Relatório financeiro personalizado gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório financeiro');
    }
  }, [analises, periodoVisualizacao, dadosReceita]);

  const chartConfig = useMemo(() => ({
    receita: {
      label: "Receita",
      color: "#6B21A8",
    },
    quantidade: {
      label: "Quantidade",
      color: "#8B5CF6",
    },
  }), []);

  const handlePeriodoChange = useCallback((value: string | undefined) => {
    if (value) setPeriodoVisualizacao(value);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/15 to-violet-300/15 rounded-full blur-3xl"></div>
      </div>

      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-105 transition-transform duration-200">
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
              onValueChange={handlePeriodoChange}
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
              Relatório PDF
            </Button>
          </div>
        </div>

        <TarotStatsCards stats={stats} />
        <TarotCharts 
          dadosReceita={dadosReceita}
          dadosStatus={dadosStatus}
          chartConfig={chartConfig}
        />
      </main>
    </div>
  );
};

export default RelatoriosFrequenciaisTarot;
