import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TarotStatsCards from "@/components/reports/TarotStatsCards";
import TarotCharts from "@/components/charts/TarotCharts";

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
    const doc = new jsPDF();
    
    // Header elegante
    doc.setFontSize(22);
    doc.setTextColor(107, 33, 168);
    doc.text('Relatório Financeiro', 105, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(120, 120, 120);
    doc.text('Tarot Frequencial', 105, 35, { align: 'center' });
    
    // Linha decorativa
    doc.setDrawColor(107, 33, 168);
    doc.setLineWidth(0.5);
    doc.line(30, 45, 180, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`, 20, 55);
    
    // Resumo em boxes elegantes
    const receitaTotal = analises.reduce((sum, analise) => sum + parseFloat(analise.preco || "150"), 0);
    const analisesFinalizadas = analises.filter(a => a.finalizado).length;
    const analisesPendentes = analises.filter(a => !a.finalizado).length;
    const ticketMedio = receitaTotal / analises.length || 0;
    
    // Box 1 - Receita Total
    doc.rect(20, 65, 50, 25);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Receita Total', 25, 73);
    doc.setFontSize(14);
    doc.setTextColor(107, 33, 168);
    doc.text(`R$ ${receitaTotal.toFixed(2)}`, 45, 85, { align: 'center' });
    
    // Box 2 - Total de Análises
    doc.rect(80, 65, 50, 25);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Análises', 85, 73);
    doc.setFontSize(14);
    doc.setTextColor(107, 33, 168);
    doc.text(analises.length.toString(), 105, 85, { align: 'center' });
    
    // Box 3 - Ticket Médio
    doc.rect(140, 65, 50, 25);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Ticket Médio', 145, 73);
    doc.setFontSize(14);
    doc.setTextColor(107, 33, 168);
    doc.text(`R$ ${ticketMedio.toFixed(2)}`, 165, 85, { align: 'center' });

    // Tabela elegante
    const tableData = analises.map(analise => [
      analise.nomeCliente,
      format(new Date(analise.dataInicio), 'dd/MM/yyyy'),
      `R$ ${parseFloat(analise.preco || "150").toFixed(2)}`,
      analise.finalizado ? 'Finalizada' : 'Pendente'
    ]);

    autoTable(doc, {
      head: [['Cliente', 'Data', 'Valor', 'Status']],
      body: tableData,
      startY: 105,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [60, 60, 60],
      },
      headStyles: {
        fillColor: [107, 33, 168],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      margin: { left: 20, right: 20 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Libertá - Página ${i} de ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save('relatorio-financeiro-tarot.pdf');
  }, [analises]);

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
              Gerar PDF
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
