import React, { useState, useEffect } from 'react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import useUserDataService from "@/services/userDataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, Filter, Search, Calendar, Users, TrendingUp, DollarSign } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RelatoriosFrequenciaisTarot = () => {
  const { getTarotAnalyses } = useUserDataService();
  const [analises, setAnalises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const data = getTarotAnalyses();
    setAnalises(data);
  }, [getTarotAnalyses]);

  const filteredAnalises = analises.filter(analise => {
    const matchesSearch = analise.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || analise.dataInicio?.includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  const stats = {
    total: filteredAnalises.length,
    finalizadas: filteredAnalises.filter(a => a.finalizado).length,
    emAndamento: filteredAnalises.filter(a => !a.finalizado).length,
    valorTotal: filteredAnalises.reduce((sum, a) => sum + (parseFloat(a.valor || a.preco || '0') || 0), 0)
  };

  const generateFinancialReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Relatório Financeiro - Tarot', 14, 22);
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Período: ${dateFilter || 'Todos'} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);
    
    // Statistics
    doc.setFontSize(14);
    doc.text('Resumo Financeiro:', 14, 50);
    doc.setFontSize(12);
    doc.text(`Total de análises: ${stats.total}`, 20, 60);
    doc.text(`Finalizadas: ${stats.finalizadas}`, 20, 70);
    doc.text(`Em andamento: ${stats.emAndamento}`, 20, 80);
    doc.text(`Receita total: R$ ${stats.valorTotal.toFixed(2)}`, 20, 90);
    
    // Detailed table
    const tableData = filteredAnalises.map(analise => [
      new Date(analise.dataInicio || analise.dataAnalise || new Date()).toLocaleDateString('pt-BR'),
      analise.nomeCliente || 'N/A',
      analise.tipoConsulta || analise.tipoServico || 'Consulta Tarot',
      `R$ ${parseFloat(analise.valor || analise.preco || '0').toFixed(2)}`,
      analise.finalizado ? 'Finalizada' : 'Em andamento'
    ]);

    autoTable(doc, {
      head: [['Data', 'Cliente', 'Tipo', 'Valor', 'Status']],
      body: tableData,
      startY: 105,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: { 
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Save
    const fileName = `relatorio-financeiro-tarot-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const generateClientBreakdown = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Análise por Cliente - Tarot', 14, 22);
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);
    
    // Client stats
    const clientStats = filteredAnalises.reduce((acc, analise) => {
      const clientName = analise.nomeCliente || 'N/A';
      if (!acc[clientName]) {
        acc[clientName] = { total: 0, valor: 0, finalizadas: 0 };
      }
      acc[clientName].total++;
      acc[clientName].valor += parseFloat(analise.valor || analise.preco || '0');
      if (analise.finalizado) acc[clientName].finalizadas++;
      return acc;
    }, {} as Record<string, { total: number; valor: number; finalizadas: number }>);
    
    const clientTableData = Object.entries(clientStats).map(([cliente, clientData]) => [
      cliente,
      clientData.total.toString(),
      clientData.finalizadas.toString(),
      (clientData.total - clientData.finalizadas).toString(),
      `R$ ${clientData.valor.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Cliente', 'Total Consultas', 'Finalizadas', 'Em Andamento', 'Valor Total']],
      body: clientTableData,
      startY: 50,
      styles: { 
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: { 
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    const fileName = `analise-clientes-tarot-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-6 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Relatórios Financeiros - Tarot</h1>
          <p className="text-gray-600">Análise financeira detalhada das consultas de tarot</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Consultas</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Finalizadas</p>
                  <p className="text-2xl font-bold text-green-800">{stats.finalizadas}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Em Andamento</p>
                  <p className="text-2xl font-bold text-orange-800">{stats.emAndamento}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Receita Total</p>
                  <p className="text-2xl font-bold text-purple-800">R$ {stats.valorTotal.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar Cliente</Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Nome do cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <Label htmlFor="date">Filtro por Data (Ano-Mês)</Label>
                <Input
                  id="date"
                  type="text"
                  placeholder="2024-01"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Gerar Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={generateFinancialReport}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Relatório Financeiro
              </Button>
              
              <Button 
                onClick={generateClientBreakdown}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Análise por Cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosFrequenciaisTarot;
