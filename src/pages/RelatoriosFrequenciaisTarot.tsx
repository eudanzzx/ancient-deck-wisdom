import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RelatoriosFrequenciaisTarot = () => {
  const { getTarotAnalyses } = useUserDataService();
  const [analises, setAnalises] = useState<any[]>([]);

  useEffect(() => {
    const data = getTarotAnalyses();
    setAnalises(data);
  }, []);

  const calcularEstatisticas = () => {
    const total = analises.length;
    const finalizadas = analises.filter(a => a.finalizado).length;
    const valorTotal = analises.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0);
    const clientesUnicos = [...new Set(analises.map(a => a.nomeCliente))].length;
    
    // Análises por mês
    const analysesPorMes = analises.reduce((acc, analise) => {
      const mes = new Date(analise.dataInicio).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});
    
    // Top clientes
    const clienteStats = analises.reduce((acc, analise) => {
      const cliente = analise.nomeCliente;
      if (!acc[cliente]) {
        acc[cliente] = { total: 0, valor: 0 };
      }
      acc[cliente].total++;
      acc[cliente].valor += parseFloat(analise.valor || 0);
      return acc;
    }, {});
    
    const topClientes = Object.entries(clienteStats)
      .sort(([,a], [,b]) => (b as any).total - (a as any).total)
      .slice(0, 5);
    
    return {
      total,
      finalizadas,
      valorTotal,
      clientesUnicos,
      analysesPorMes,
      topClientes
    };
  };

  const gerarRelatorioFrequencial = () => {
    const doc = new jsPDF();
    const stats = calcularEstatisticas();
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Relatório Frequencial - Tarot', 14, 22);
    
    // Data
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Período: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);
    
    // Estatísticas gerais
    doc.text('Estatísticas Gerais:', 14, 50);
    doc.text(`Total de análises: ${stats.total}`, 20, 60);
    doc.text(`Análises finalizadas: ${stats.finalizadas}`, 20, 70);
    doc.text(`Clientes únicos: ${stats.clientesUnicos}`, 20, 80);
    doc.text(`Faturamento total: R$ ${stats.valorTotal.toFixed(2)}`, 20, 90);
    
    // Top clientes
    doc.text('Top 5 Clientes:', 14, 110);
    stats.topClientes.forEach(([cliente, dados]: [string, any], index) => {
      doc.text(`${index + 1}. ${cliente} - ${dados.total} análises (R$ ${dados.valor.toFixed(2)})`, 20, 120 + (index * 10));
    });
    
    // Tabela de análises por mês
    const monthData = Object.entries(stats.analysesPorMes).map(([mes, total]) => [mes, total.toString()]);
    
    if (monthData.length > 0) {
      autoTable(doc, {
        head: [['Mês', 'Quantidade de Análises']],
        body: monthData,
        startY: 180,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [102, 126, 234] }
      });
    }
    
    doc.save(`relatorio-frequencial-tarot-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const stats = calcularEstatisticas();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-purple-800">Relatórios Frequenciais - Tarot</h1>
        <Button onClick={gerarRelatorioFrequencial} className="bg-purple-600 hover:bg-purple-700">
          <Download className="h-4 w-4 mr-2" />
          Baixar Relatório PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de Análises</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.clientesUnicos}</p>
                <p className="text-sm text-gray-600">Clientes Únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.finalizadas}</p>
                <p className="text-sm text-gray-600">Finalizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">R$ {stats.valorTotal.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Faturamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topClientes.map(([cliente, dados]: [string, any], index) => (
                <div key={cliente} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}º</Badge>
                    <span className="font-medium">{cliente}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{dados.total} análises</p>
                    <p className="text-sm text-gray-600">R$ {dados.valor.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análises por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.analysesPorMes).map(([mes, total]) => (
                <div key={mes} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{mes}</span>
                  <Badge>{total} análises</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosFrequenciaisTarot;
