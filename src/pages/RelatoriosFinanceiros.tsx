import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { format, startOfDay, startOfMonth, startOfYear, endOfDay, endOfMonth, endOfYear, eachMonthOfInterval, eachDayOfInterval, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Download, DollarSign, Calendar, TrendingUp, LineChart } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface Atendimento {
  id: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: number;
}

interface DadosDiarios {
  data: string;
  valor: number;
}

interface DadosMensais {
  mes: string;
  valor: number;
}

interface DadosTiposServico {
  name: string;
  value: number;
}

const RelatoriosFinanceiros = () => {
  const navigate = useNavigate();
  const { getAtendimentos } = useUserDataService();
  const { toast } = useToast();
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [valorTotalDia, setValorTotalDia] = useState(0);
  const [valorTotalMes, setValorTotalMes] = useState(0);
  const [valorTotalAno, setValorTotalAno] = useState(0);
  const [dadosGraficoDiario, setDadosGraficoDiario] = useState<DadosDiarios[]>([]);
  const [dadosGraficoMensal, setDadosGraficoMensal] = useState<DadosMensais[]>([]);
  const [dadosGraficoTiposServico, setDadosGraficoTiposServico] = useState<DadosTiposServico[]>([]);
  
  const COLORS = ['#0EA5E9', '#4f46e5', '#22c55e', '#f59e0b', '#ec4899', '#64748b', '#0f766e'];

  useEffect(() => {
    const todosAtendimentos = getAtendimentos() as Atendimento[];
    setAtendimentos(todosAtendimentos);
    
    const hoje = new Date();
    const inicioDia = startOfDay(hoje);
    const inicioMes = startOfMonth(hoje);
    const inicioAno = startOfYear(hoje);
    const fimDia = endOfDay(hoje);
    const fimMes = endOfMonth(hoje);
    const fimAno = endOfYear(hoje);
    
    const atendimentosDia = todosAtendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioDia && dataAtendimento <= fimDia;
    });
    
    const atendimentosMes = todosAtendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioMes && dataAtendimento <= fimMes;
    });
    
    const atendimentosAno = todosAtendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioAno && dataAtendimento <= fimAno;
    });
    
    const totalDia = atendimentosDia.reduce((soma, atendimento) => {
      return soma + parseFloat(atendimento.valor.toString() || '0');
    }, 0);
    
    const totalMes = atendimentosMes.reduce((soma, atendimento) => {
      return soma + parseFloat(atendimento.valor.toString() || '0');
    }, 0);
    
    const totalAno = atendimentosAno.reduce((soma, atendimento) => {
      return soma + parseFloat(atendimento.valor.toString() || '0');
    }, 0);
    
    setValorTotalDia(totalDia);
    setValorTotalMes(totalMes);
    setValorTotalAno(totalAno);
    
    gerarDadosGraficoDiario(todosAtendimentos);
    gerarDadosGraficoMensal(todosAtendimentos);
    gerarDadosGraficoTiposServico(todosAtendimentos);
    
  }, [getAtendimentos]);
  
  const gerarDadosGraficoDiario = (todosAtendimentos: Atendimento[]) => {
    const hoje = new Date();
    const inicioIntervalo = new Date();
    inicioIntervalo.setDate(hoje.getDate() - 29);
    
    const diasIntervalo = eachDayOfInterval({
      start: inicioIntervalo,
      end: hoje
    });
    
    const dadosGrafico = diasIntervalo.map(dia => {
      const atendimentosDia = todosAtendimentos.filter(atendimento => {
        const dataAtendimento = new Date(atendimento.dataAtendimento);
        return dataAtendimento.toDateString() === dia.toDateString();
      });
      
      const valorTotal = atendimentosDia.reduce((soma, atendimento) => {
        return soma + parseFloat(atendimento.valor.toString() || '0');
      }, 0);
      
      return {
        data: format(dia, 'dd/MM', { locale: ptBR }),
        valor: valorTotal
      };
    });
    
    setDadosGraficoDiario(dadosGrafico);
  };
  
  const gerarDadosGraficoMensal = (todosAtendimentos: Atendimento[]) => {
    const hoje = new Date();
    const inicioIntervalo = new Date();
    inicioIntervalo.setMonth(hoje.getMonth() - 11);
    
    const mesesIntervalo = eachMonthOfInterval({
      start: inicioIntervalo,
      end: hoje
    });
    
    const dadosGrafico = mesesIntervalo.map(mes => {
      const atendimentosMes = todosAtendimentos.filter(atendimento => {
        const dataAtendimento = new Date(atendimento.dataAtendimento);
        return getMonth(dataAtendimento) === getMonth(mes) && 
               getYear(dataAtendimento) === getYear(mes);
      });
      
      const valorTotal = atendimentosMes.reduce((soma, atendimento) => {
        return soma + parseFloat(atendimento.valor.toString() || '0');
      }, 0);
      
      return {
        mes: format(mes, 'MMM', { locale: ptBR }),
        valor: valorTotal
      };
    });
    
    setDadosGraficoMensal(dadosGrafico);
  };
  
  const gerarDadosGraficoTiposServico = (todosAtendimentos: Atendimento[]) => {
    const tiposServico: Record<string, { quantidade: number, valor: number }> = {};
    
    todosAtendimentos.forEach(atendimento => {
      const tipo = atendimento.tipoServico;
      if (!tiposServico[tipo]) {
        tiposServico[tipo] = {
          quantidade: 0,
          valor: 0
        };
      }
      
      tiposServico[tipo].quantidade += 1;
      tiposServico[tipo].valor += parseFloat(atendimento.valor.toString() || '0');
    });
    
    const dadosGrafico = Object.entries(tiposServico).map(([tipo, dados]) => ({
      name: tipo.replace('-', ' '),
      value: dados.valor
    }));
    
    dadosGrafico.sort((a, b) => b.value - a.value);
    
    setDadosGraficoTiposServico(dadosGrafico);
  };
  
  const downloadRelatorioCsv = () => {
    try {
      let csvContent = "Período,Valor Total\n";
      
      csvContent += `Hoje (${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}),R$ ${valorTotalDia.toFixed(2)}\n`;
      csvContent += `Mês atual (${format(new Date(), 'MMMM/yyyy', { locale: ptBR })}),R$ ${valorTotalMes.toFixed(2)}\n`;
      csvContent += `Ano atual (${format(new Date(), 'yyyy', { locale: ptBR })}),R$ ${valorTotalAno.toFixed(2)}\n\n`;
      
      csvContent += "Análise Diária\n";
      csvContent += "Data,Valor\n";
      dadosGraficoDiario.forEach(item => {
        csvContent += `${item.data},R$ ${item.valor.toFixed(2)}\n`;
      });
      
      csvContent += "\nAnálise Mensal\n";
      csvContent += "Mês,Valor\n";
      dadosGraficoMensal.forEach(item => {
        csvContent += `${item.mes},R$ ${item.valor.toFixed(2)}\n`;
      });
      
      csvContent += "\nAnálise por Tipo de Serviço\n";
      csvContent += "Tipo de Serviço,Valor Total\n";
      dadosGraficoTiposServico.forEach(item => {
        csvContent += `${item.name},R$ ${Number(item.value).toFixed(2)}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      const hoje = format(new Date(), 'dd-MM-yyyy', { locale: ptBR });
      link.setAttribute('download', `Relatorio_Financeiro_${hoje}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: "O relatório financeiro está sendo baixado.",
      });
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar relatório",
        description: "Ocorreu um erro ao gerar o arquivo CSV.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 mt-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-[#0EA5E9] hover:bg-white/80 hover:text-[#0EA5E9] transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#0EA5E9]">Relatórios Financeiros</h1>
              <p className="text-sm text-slate-600">Análise de valores recebidos por período</p>
            </div>
          </div>
          <Button 
            onClick={downloadRelatorioCsv}
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
          >
            <Download className="mr-2 h-4 w-4" /> Baixar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Valor do Dia</p>
                  <p className="text-xl font-bold text-[#0EA5E9]">R$ {valorTotalDia.toFixed(2)}</p>
                </div>
                <div className="rounded-full p-2 bg-[#0EA5E9]/10">
                  <Calendar className="h-6 w-6 text-[#0EA5E9]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Valor do Mês</p>
                  <p className="text-xl font-bold text-[#0EA5E9]">R$ {valorTotalMes.toFixed(2)}</p>
                </div>
                <div className="rounded-full p-2 bg-[#0EA5E9]/10">
                  <DollarSign className="h-6 w-6 text-[#0EA5E9]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Valor do Ano</p>
                  <p className="text-xl font-bold text-[#0EA5E9]">R$ {valorTotalAno.toFixed(2)}</p>
                </div>
                <div className="rounded-full p-2 bg-[#0EA5E9]/10">
                  <TrendingUp className="h-6 w-6 text-[#0EA5E9]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
                <LineChart className="h-5 w-5" /> Valores Diários (Últimos 30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dadosGraficoDiario}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="data" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split('/')[0]}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#0EA5E9" 
                      fill="#0EA5E9" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
                <LineChart className="h-5 w-5" /> Valores Mensais (Últimos 12 meses)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosGraficoMensal}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Bar dataKey="valor" fill="#0EA5E9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
              <LineChart className="h-5 w-5" /> Distribuição por Tipo de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGraficoTiposServico}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dadosGraficoTiposServico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatoriosFinanceiros;
