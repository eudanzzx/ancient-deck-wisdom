
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const RelatoriosFrequenciais = () => {
  const navigate = useNavigate();
  const { getAllTarotAnalyses } = useUserDataService();
  const { toast } = useToast();
  const [analises, setAnalises] = useState([]);

  useEffect(() => {
    loadAnalises();
  }, []);

  const loadAnalises = () => {
    const data = getAllTarotAnalyses();
    setAnalises(data);
  };

  const getMonthlyData = () => {
    const monthlyCount = {};
    analises.forEach(analise => {
      if (analise.dataInicio) {
        const month = new Date(analise.dataInicio).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      }
    });
    
    return Object.entries(monthlyCount).map(([month, count]) => ({
      month,
      count
    }));
  };

  const getStatusData = () => {
    const finalizadas = analises.filter(a => a.finalizado).length;
    const pendentes = analises.filter(a => !a.finalizado).length;
    
    return [
      { name: 'Finalizadas', value: finalizadas, color: '#10B981' },
      { name: 'Pendentes', value: pendentes, color: '#F59E0B' }
    ];
  };

  const getRevenueData = () => {
    const monthlyRevenue = {};
    analises.forEach(analise => {
      if (analise.dataInicio) {
        const month = new Date(analise.dataInicio).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const preco = parseFloat(analise.preco || "150");
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + preco;
      }
    });
    
    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    }));
  };

  const getSignData = () => {
    const signCount = {};
    analises.forEach(analise => {
      if (analise.signo) {
        signCount[analise.signo] = (signCount[analise.signo] || 0) + 1;
      }
    });
    
    return Object.entries(signCount)
      .map(([signo, count]) => ({ signo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getTotalRevenue = () => {
    return analises.reduce((acc, curr) => {
      const preco = parseFloat(curr.preco || "150");
      return acc + preco;
    }, 0);
  };

  const downloadPDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(103, 49, 147);
      doc.text('Relatório Frequencial - Tarot', 20, 30);
      
      // Summary data
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de Análises: ${analises.length}`, 20, 50);
      doc.text(`Receita Total: R$ ${getTotalRevenue().toFixed(2)}`, 20, 60);
      doc.text(`Finalizadas: ${analises.filter(a => a.finalizado).length}`, 20, 70);
      doc.text(`Pendentes: ${analises.filter(a => !a.finalizado).length}`, 20, 80);
      
      // Monthly data table
      const monthlyData = getMonthlyData();
      if (monthlyData.length > 0) {
        doc.text('Análises por Mês:', 20, 100);
        doc.autoTable({
          startY: 110,
          head: [['Mês', 'Quantidade']],
          body: monthlyData.map(item => [item.month, item.count.toString()]),
          theme: 'grid',
          headStyles: { fillColor: [103, 49, 147] }
        });
      }
      
      // Signs data
      const signData = getSignData();
      if (signData.length > 0) {
        doc.text('Signos Mais Frequentes:', 20, doc.lastAutoTable.finalY + 20);
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Signo', 'Quantidade']],
          body: signData.map(item => [item.signo, item.count.toString()]),
          theme: 'grid',
          headStyles: { fillColor: [103, 49, 147] }
        });
      }
      
      doc.save('relatorio-frequencial-tarot.pdf');
      
      toast({
        title: "Relatório PDF gerado",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório PDF.",
      });
    }
  };

  const downloadCSVReport = () => {
    try {
      const csvContent = [
        ['Nome do Cliente', 'Data de Início', 'Preço', 'Status', 'Signo'],
        ...analises.map(analise => [
          analise.nomeCliente,
          analise.dataInicio || '',
          analise.preco || '150',
          analise.finalizado ? 'Finalizada' : 'Pendente',
          analise.signo || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'relatorio-frequencial-tarot.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Relatório CSV gerado",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar CSV",
        description: "Ocorreu um erro ao gerar o relatório CSV.",
      });
    }
  };

  const COLORS = ['#673193', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo height={40} width={40} />
              <h1 className="text-lg font-semibold tracking-tight text-[#673193]">Libertá - Relatórios Frequenciais</h1>
            </div>
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 hover:border-[#673193] transition-all duration-200"
                onClick={() => navigate('/listagem-tarot')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Tarot
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 p-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo height={50} width={50} />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                Relatórios Frequenciais
              </h1>
              <p className="text-[#673193]/80 mt-1">Análises e métricas do Tarot</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={downloadPDFReport}
              className="bg-[#673193] hover:bg-[#673193]/90 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
            <Button 
              onClick={downloadCSVReport}
              variant="outline"
              className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Análises</p>
                  <p className="text-3xl font-bold text-[#673193]">{analises.length}</p>
                </div>
                <Users className="h-8 w-8 text-[#673193]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Receita Total</p>
                  <p className="text-3xl font-bold text-[#673193]">R$ {getTotalRevenue().toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-[#673193]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Finalizadas</p>
                  <p className="text-3xl font-bold text-[#673193]">{analises.filter(a => a.finalizado).length}</p>
                </div>
                <FileText className="h-8 w-8 text-[#673193]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pendentes</p>
                  <p className="text-3xl font-bold text-[#673193]">{analises.filter(a => !a.finalizado).length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#673193]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Analysis Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#673193]">Análises por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#673193" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#673193]">Distribuição de Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#673193]">Tendência de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']} />
                  <Line type="monotone" dataKey="revenue" stroke="#673193" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Signs */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#673193]">Signos Mais Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSignData()} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="signo" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#673193" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RelatoriosFrequenciais;
