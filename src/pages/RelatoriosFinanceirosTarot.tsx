import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "@/components/Logo";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Users, Download } from 'lucide-react';
import useUserDataService from "@/services/userDataService";
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

const RelatoriosFinanceirosTarot = () => {
  const navigate = useNavigate();
  const { getAllTarotAnalyses } = useUserDataService();
  
  const analises = getAllTarotAnalyses();

  const financialData = useMemo(() => {
    let totalValue = 0;
    let totalAnalyses = 0;
    const monthlyData: { [key: string]: number } = {};
    const clientData: { [key: string]: { count: number; value: number } } = {};

    analises.forEach(analise => {
      const value = parseFloat(analise.valor || analise.preco || "0");
      totalValue += value;
      totalAnalyses++;

      // Group by month
      const date = new Date(analise.dataInicio);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + value;

      // Group by client
      const client = analise.nomeCliente;
      if (!clientData[client]) {
        clientData[client] = { count: 0, value: 0 };
      }
      clientData[client].count++;
      clientData[client].value += value;
    });

    return {
      totalValue,
      totalAnalyses,
      averageValue: totalAnalyses > 0 ? totalValue / totalAnalyses : 0,
      monthlyData: Object.entries(monthlyData).map(([month, value]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        value
      })),
      clientData: Object.entries(clientData)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    };
  }, [analises]);

  const generateCustomFinancialReport = () => {
    try {
      const doc = new jsPDF();
      
      // Configurações de cores
      const primaryColor = [103, 49, 147]; // Purple
      const secondaryColor = [168, 85, 247]; // Light purple
      const textColor = [30, 30, 30];
      const lightGray = [245, 245, 245];
      
      // Header com gradiente visual
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 35, 'F');
      
      // Logo e título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('RELATÓRIO FINANCEIRO', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.text('Tarot Frequencial', 105, 28, { align: 'center' });
      
      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
      
      // Seção de métricas principais - layout em grid
      let yPos = 55;
      const boxWidth = 40;
      const boxHeight = 25;
      
      // Caixa 1 - Total Arrecadado
      doc.setFillColor(...lightGray);
      doc.rect(20, yPos, boxWidth, boxHeight, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.rect(20, yPos, boxWidth, boxHeight, 'S');
      
      doc.setTextColor(...textColor);
      doc.setFontSize(8);
      doc.text('TOTAL ARRECADADO', 40, yPos + 6, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`R$ ${financialData.totalValue.toFixed(2)}`, 40, yPos + 15, { align: 'center' });
      
      // Caixa 2 - Total de Análises
      doc.setFillColor(...lightGray);
      doc.rect(70, yPos, boxWidth, boxHeight, 'F');
      doc.rect(70, yPos, boxWidth, boxHeight, 'S');
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text('TOTAL DE ANÁLISES', 90, yPos + 6, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(financialData.totalAnalyses.toString(), 90, yPos + 15, { align: 'center' });
      
      // Caixa 3 - Valor Médio
      doc.setFillColor(...lightGray);
      doc.rect(120, yPos, boxWidth, boxHeight, 'F');
      doc.rect(120, yPos, boxWidth, boxHeight, 'S');
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text('VALOR MÉDIO', 140, yPos + 6, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`R$ ${financialData.averageValue.toFixed(2)}`, 140, yPos + 15, { align: 'center' });
      
      // Caixa 4 - Clientes Únicos
      doc.setFillColor(...lightGray);
      doc.rect(170, yPos, boxWidth, boxHeight, 'F');
      doc.rect(170, yPos, boxWidth, boxHeight, 'S');
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text('CLIENTES ÚNICOS', 190, yPos + 6, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(financialData.clientData.length.toString(), 190, yPos + 15, { align: 'center' });
      
      yPos += 35;
      
      // Seção Top 5 Clientes
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('TOP 5 CLIENTES', 20, yPos);
      
      yPos += 10;
      
      // Tabela compacta dos top clientes
      const topClients = financialData.clientData.slice(0, 5);
      
      // Header da tabela
      doc.setFillColor(...primaryColor);
      doc.rect(20, yPos, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('CLIENTE', 25, yPos + 5);
      doc.text('ANÁLISES', 110, yPos + 5);
      doc.text('VALOR TOTAL', 150, yPos + 5);
      
      yPos += 8;
      
      // Dados da tabela
      topClients.forEach((client, index) => {
        const rowColor = index % 2 === 0 ? [255, 255, 255] : lightGray;
        doc.setFillColor(...rowColor);
        doc.rect(20, yPos, 170, 7, 'F');
        
        doc.setTextColor(...textColor);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(client.name.substring(0, 25), 25, yPos + 4);
        doc.text(client.count.toString(), 110, yPos + 4);
        doc.text(`R$ ${client.value.toFixed(2)}`, 150, yPos + 4);
        
        yPos += 7;
      });
      
      yPos += 10;
      
      // Seção de Faturamento Mensal
      if (financialData.monthlyData.length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('FATURAMENTO MENSAL', 20, yPos);
        
        yPos += 10;
        
        // Mini gráfico de barras textual
        const maxValue = Math.max(...financialData.monthlyData.map(d => d.value));
        
        financialData.monthlyData.slice(0, 6).forEach((month, index) => {
          const barWidth = (month.value / maxValue) * 80;
          
          // Barra
          doc.setFillColor(...secondaryColor);
          doc.rect(20, yPos, barWidth, 4, 'F');
          
          // Texto
          doc.setTextColor(...textColor);
          doc.setFontSize(8);
          doc.text(`${month.month}: R$ ${month.value.toFixed(2)}`, 110, yPos + 3);
          
          yPos += 8;
        });
      }
      
      // Linha decorativa no final
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.line(20, 280, 190, 280);
      
      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('Libertá - Sistema de Gestão', 105, 290, { align: 'center' });
      
      // Salvar o PDF
      const fileName = `Relatorio_Financeiro_Tarot_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success('Relatório financeiro personalizado gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório financeiro');
    }
  };

  const COLORS = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      <DashboardHeader />

      <main className="pt-20 p-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300">
              <Logo height={50} width={50} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Relatórios Financeiros - Tarot
              </h1>
              <p className="text-purple-600/80 mt-1">Análise financeira das consultas de Tarot</p>
            </div>
          </div>
          
          <Button
            onClick={generateCustomFinancialReport}
            className="bg-[#673193] hover:bg-[#673193]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Relatório PDF
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Arrecadado</p>
                  <p className="text-3xl font-bold text-slate-800">R$ {financialData.totalValue.toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-600/10">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total de Análises</p>
                  <p className="text-3xl font-bold text-slate-800">{financialData.totalAnalyses}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-600/10">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Valor Médio</p>
                  <p className="text-3xl font-bold text-slate-800">R$ {financialData.averageValue.toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-600/10">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Clientes Únicos</p>
                  <p className="text-3xl font-bold text-slate-800">{financialData.clientData.length}</p>
                </div>
                <div className="rounded-xl p-3 bg-purple-600/10">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-purple-800">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-purple-800">Top 10 Clientes (Valor)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData.clientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor Total']}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Client Distribution */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-purple-800">Distribuição por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financialData.clientData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {financialData.clientData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Analysis Count by Client */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-purple-800">Quantidade de Análises por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData.clientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Análises']}
                  />
                  <Bar dataKey="count" fill="#A78BFA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RelatoriosFinanceirosTarot;
