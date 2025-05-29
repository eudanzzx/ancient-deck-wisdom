import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ArrowLeft, Download, FileSpreadsheet, FileText, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import useUserDataService from "@/services/userDataService";
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";

const RelatoriosFrequenciais = () => {
  const navigate = useNavigate();
  const [analises, setAnalises] = useState([]);
  const { getAllTarotAnalyses } = useUserDataService();

  useEffect(() => {
    const data = getAllTarotAnalyses();
    setAnalises(data);
  }, []);

  const getMonthlyData = () => {
    const monthlyCount = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    months.forEach(month => monthlyCount[month] = 0);
    
    analises.forEach(analise => {
      if (analise.dataInicio) {
        const month = new Date(analise.dataInicio).getMonth();
        monthlyCount[months[month]]++;
      }
    });
    
    return months.map(month => ({
      month,
      count: monthlyCount[month]
    }));
  };

  const getStatusData = () => {
    const finalizadas = analises.filter(a => a.finalizado).length;
    const pendentes = analises.filter(a => !a.finalizado).length;
    
    return [
      { name: 'Finalizadas', value: finalizadas },
      { name: 'Pendentes', value: pendentes }
    ];
  };

  const getRevenueData = () => {
    const monthlyRevenue = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    months.forEach(month => monthlyRevenue[month] = 0);
    
    analises.forEach(analise => {
      if (analise.dataInicio) {
        const month = new Date(analise.dataInicio).getMonth();
        monthlyRevenue[months[month]] += parseFloat(analise.preco || "150");
      }
    });
    
    return months.map(month => ({
      month,
      revenue: monthlyRevenue[month]
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
      .slice(0, 6);
  };

  const downloadPDFReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(103, 49, 147);
      doc.text('🔮 Relatório Frequencial - Tarot', 105, 15, { align: 'center' });
      
      let yPos = 35;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Total de Análises: ${analises.length}`, 14, yPos);
      yPos += 8;
      
      const totalValue = analises.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
      doc.text(`Valor Total: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      const finalizadas = analises.filter(a => a.finalizado).length;
      doc.text(`Análises Finalizadas: ${finalizadas}`, 14, yPos);
      yPos += 8;
      
      const pendentes = analises.filter(a => !a.finalizado).length;
      doc.text(`Análises Pendentes: ${pendentes}`, 14, yPos);
      yPos += 15;
      
      doc.setFont(undefined, 'bold');
      doc.text('Distribuição por Signos:', 14, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      
      const signData = getSignData();
      signData.forEach(({ signo, count }) => {
        doc.text(`• ${signo}: ${count} análises`, 14, yPos);
        yPos += 6;
      });
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      doc.save(`Relatorio_Frequencial_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório PDF");
    }
  };

  const downloadCSVReport = () => {
    try {
      const headers = ['Nome Cliente', 'Data Início', 'Signo', 'Preço', 'Status', 'Finalizado'];
      
      const csvData = analises.map(analise => [
        analise.nomeCliente || '',
        analise.dataInicio ? new Date(analise.dataInicio).toLocaleDateString('pt-BR') : '',
        analise.signo || '',
        parseFloat(analise.preco || "150").toFixed(2),
        analise.finalizado ? 'Finalizada' : 'Pendente',
        analise.finalizado ? 'Sim' : 'Não'
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Relatorio_Frequencial_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
      link.click();
      
      toast.success("Relatório CSV gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      toast.error("Erro ao gerar relatório CSV");
    }
  };

  const TAROT_COLORS = ['#673193', '#8B5A9F', '#A374B0', '#BB8FC1', '#D3A9D2'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

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

      <main className="pt-20 p-4 animate-fade-in relative z-10">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <Logo height={50} width={50} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                Relatórios Frequenciais
              </h1>
              <p className="text-[#673193]/80 mt-1 opacity-80">Análises e métricas do Tarot</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={downloadPDFReport}
              className="bg-[#673193] hover:bg-[#673193]/90 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={downloadCSVReport}
              variant="outline"
              className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 hover:border-[#673193]"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <DashboardCard 
            title="Total de Análises" 
            value={analises.length.toString()} 
            icon={<Users className="h-8 w-8 text-[#673193]" />} 
          />
          <DashboardCard 
            title="Valor Total" 
            value={`R$ ${analises.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0).toFixed(2)}`}
            icon={<DollarSign className="h-8 w-8 text-[#673193]" />} 
          />
          <DashboardCard 
            title="Finalizadas" 
            value={analises.filter(a => a.finalizado).length.toString()}
            icon={<TrendingUp className="h-8 w-8 text-[#673193]" />} 
          />
          <DashboardCard 
            title="Este Mês" 
            value={analises.filter(a => {
              if (!a.dataInicio) return false;
              const analiseMonth = new Date(a.dataInicio).getMonth();
              return analiseMonth === new Date().getMonth();
            }).length.toString()}
            icon={<Calendar className="h-8 w-8 text-[#673193]" />} 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Monthly Distribution Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-200/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                Análises por Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#673193" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#673193" />
                  <YAxis stroke="#673193" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #673193',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#673193" name="Análises" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution Pie Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-200/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                Status das Análises
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TAROT_COLORS[index % TAROT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #673193',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend Line Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-200/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                Evolução da Receita
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#673193" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#673193" />
                  <YAxis stroke="#673193" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #673193',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#673193" 
                    strokeWidth={3}
                    name="Receita (R$)"
                    dot={{ fill: '#673193', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Most Frequent Signs */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-200/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                Signos Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSignData()} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#673193" opacity={0.2} />
                  <XAxis type="number" stroke="#673193" />
                  <YAxis dataKey="signo" type="category" stroke="#673193" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #673193',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="#673193" name="Quantidade" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );

  // Helper functions for chart data
  function getMonthlyData() {
    const monthlyCount = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    months.forEach(month => monthlyCount[month] = 0);
    
    analises.forEach(analise => {
      if (analise.dataInicio) {
        const month = new Date(analise.dataInicio).getMonth();
        monthlyCount[months[month]]++;
      }
    });
    
    return months.map(month => ({
      month,
      count: monthlyCount[month]
    }));
  }

  function getStatusData() {
    const finalizadas = analises.filter(a => a.finalizado).length;
    const pendentes = analises.filter(a => !a.finalizado).length;
    
    return [
      { name: 'Finalizadas', value: finalizadas },
      { name: 'Pendentes', value: pendentes }
    ];
  }

  function getRevenueData() {
    const monthlyRevenue = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    months.forEach(month => monthlyRevenue[month] = 0);
    
    analises.forEach(analise => {
      if (analise.dataInicio) {
        const month = new Date(analise.dataInicio).getMonth();
        monthlyRevenue[months[month]] += parseFloat(analise.preco || "150");
      }
    });
    
    return months.map(month => ({
      month,
      revenue: monthlyRevenue[month]
    }));
  }

  function getSignData() {
    const signCount = {};
    
    analises.forEach(analise => {
      if (analise.signo) {
        signCount[analise.signo] = (signCount[analise.signo] || 0) + 1;
      }
    });
    
    return Object.entries(signCount)
      .map(([signo, count]) => ({ signo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  function downloadPDFReport() {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(103, 49, 147);
      doc.text('🔮 Relatório Frequencial - Tarot', 105, 15, { align: 'center' });
      
      let yPos = 35;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Total de Análises: ${analises.length}`, 14, yPos);
      yPos += 8;
      
      const totalValue = analises.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
      doc.text(`Valor Total: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      const finalizadas = analises.filter(a => a.finalizado).length;
      doc.text(`Análises Finalizadas: ${finalizadas}`, 14, yPos);
      yPos += 8;
      
      const pendentes = analises.filter(a => !a.finalizado).length;
      doc.text(`Análises Pendentes: ${pendentes}`, 14, yPos);
      yPos += 15;
      
      doc.setFont(undefined, 'bold');
      doc.text('Distribuição por Signos:', 14, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      
      const signData = getSignData();
      signData.forEach(({ signo, count }) => {
        doc.text(`• ${signo}: ${count} análises`, 14, yPos);
        yPos += 6;
      });
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      doc.save(`Relatorio_Frequencial_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório PDF");
    }
  }

  function downloadCSVReport() {
    try {
      const headers = ['Nome Cliente', 'Data Início', 'Signo', 'Preço', 'Status', 'Finalizado'];
      
      const csvData = analises.map(analise => [
        analise.nomeCliente || '',
        analise.dataInicio ? new Date(analise.dataInicio).toLocaleDateString('pt-BR') : '',
        analise.signo || '',
        parseFloat(analise.preco || "150").toFixed(2),
        analise.finalizado ? 'Finalizada' : 'Pendente',
        analise.finalizado ? 'Sim' : 'Não'
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Relatorio_Frequencial_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
      link.click();
      
      toast.success("Relatório CSV gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      toast.error("Erro ao gerar relatório CSV");
    }
  }
};

const DashboardCard = ({ title, value, icon }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-[#673193] transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#673193]/10 group-hover:bg-[#673193]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatoriosFrequenciais;
