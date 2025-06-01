import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  DollarSign,
  ArrowLeft,
  Clock,
  CheckCircle,
  FileDown,
  ChevronRight,
  ChevronDown,
  Download
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import ReportManager from "@/components/ReportManager";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    getNumberOfPages: () => number;
  }
}

interface AnaliseFrequencial {
  id: string;
  nomeCliente: string;
  dataInicio: string;
  preco: string;
  finalizado: boolean;
  dataNascimento?: string;
  signo?: string;
  analiseAntes?: string;
  analiseDepois?: string;
  lembretes?: Array<{
    texto: string;
    dias: number;
  }>;
  atencaoFlag?: boolean;
}

const RelatoriosFrequencial = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [analises, setAnalises] = useState<AnaliseFrequencial[]>([]);
  const [clientesUnicos, setClientesUnicos] = useState<string[]>([]);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const { getAllTarotAnalyses } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalises();
  }, []);

  const loadAnalises = () => {
    const rawData = getAllTarotAnalyses();
    // Convert to the expected interface format
    const convertedData: AnaliseFrequencial[] = rawData.map(analise => ({
      id: analise.id,
      nomeCliente: analise.nomeCliente,
      dataInicio: analise.dataInicio,
      preco: analise.preco,
      finalizado: analise.finalizado ?? false,
      dataNascimento: analise.dataNascimento,
      signo: analise.signo,
      analiseAntes: analise.analiseAntes,
      analiseDepois: analise.analiseDepois,
      lembretes: analise.lembretes,
      atencaoFlag: analise.atencaoFlag
    }));
    setAnalises(convertedData);
  };

  useEffect(() => {
    const nomes = [...new Set(analises.map(item => item.nomeCliente))];
    setClientesUnicos(nomes);
  }, [analises]);

  const filteredClientes = clientesUnicos.filter(cliente =>
    cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAnalisesByClient = (cliente: string) => {
    return analises.filter(a => a.nomeCliente === cliente);
  };

  const downloadIndividualAnalysisReport = (analise: AnaliseFrequencial) => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(107, 33, 168);
      doc.text('Relatório Individual – Análise Atual', 105, 15, { align: 'center' });
      
      let yPos = 35;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      doc.setFont(undefined, 'bold');
      doc.text(`Nome do Cliente: ${analise.nomeCliente}`, 14, yPos);
      yPos += 8;
      
      if (analise.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(analise.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (analise.signo) {
        doc.text(`Signo: ${analise.signo}`, 14, yPos);
        yPos += 8;
      }
      
      if (analise.dataInicio) {
        doc.text(`Data da Análise: ${new Date(analise.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Valor da Análise: R$ ${parseFloat(analise.preco || "150").toFixed(2)}`, 14, yPos);
      yPos += 15;
      
      doc.setFont(undefined, 'normal');
      
      // Análise – Antes
      if (analise.analiseAntes) {
        doc.setFont(undefined, 'bold');
        doc.text('Análise – Antes', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        const antesLines = doc.splitTextToSize(analise.analiseAntes, 180);
        doc.text(antesLines, 14, yPos);
        yPos += antesLines.length * 6 + 10;
      }
      
      // Análise – Depois
      if (analise.analiseDepois) {
        doc.setFont(undefined, 'bold');
        doc.text('Análise – Depois', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        const depoisLines = doc.splitTextToSize(analise.analiseDepois, 180);
        doc.text(depoisLines, 14, yPos);
        yPos += depoisLines.length * 6 + 10;
      }
      
      // Tratamento Realizado
      if (analise.lembretes && analise.lembretes.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.text('Tratamento Realizado', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        
        analise.lembretes.forEach(lembrete => {
          if (lembrete.texto && lembrete.texto.trim()) {
            const tratamentoLines = doc.splitTextToSize(lembrete.texto, 180);
            doc.text(tratamentoLines, 14, yPos);
            yPos += tratamentoLines.length * 6 + 5;
          }
        });
      }
      
      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      const dataAnalise = analise.dataInicio ? new Date(analise.dataInicio).toLocaleDateString('pt-BR').replace(/\//g, '-') : new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      doc.save(`Relatório_${analise.nomeCliente.replace(/ /g, '_')}_${dataAnalise}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório da análise foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar relatório",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
      });
    }
  };

  const downloadIndividualClientReport = (cliente: string) => {
    try {
      const doc = new jsPDF();
      const analisesCliente = analises.filter(a => a.nomeCliente === cliente);
      
      if (analisesCliente.length === 1) {
        // Relatório Individual – Análise Atual
        const analise = analisesCliente[0];
        
        doc.setFontSize(18);
        doc.setTextColor(107, 33, 168);
        doc.text('🔮 Relatório Individual – Análise Atual', 105, 15, { align: 'center' });
        
        let yPos = 35;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Nome do Cliente: ${cliente}`, 14, yPos);
        yPos += 8;
        
        if (analise.dataNascimento) {
          doc.text(`Data de Nascimento: ${new Date(analise.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 8;
        }
        
        if (analise.signo) {
          doc.text(`Signo: ${analise.signo}`, 14, yPos);
          yPos += 8;
        }
        
        if (analise.dataInicio) {
          doc.text(`Data da Análise: ${new Date(analise.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 8;
        }
        
        doc.text(`Valor da Análise: R$ ${parseFloat(analise.preco || "150").toFixed(2)}`, 14, yPos);
        yPos += 15;
        
        doc.setFont(undefined, 'normal');
        
        // Análise – Antes
        if (analise.analiseAntes) {
          doc.setFont(undefined, 'bold');
          doc.text('Análise – Antes', 14, yPos);
          yPos += 8;
          doc.setFont(undefined, 'normal');
          const antesLines = doc.splitTextToSize(analise.analiseAntes, 180);
          doc.text(antesLines, 14, yPos);
          yPos += antesLines.length * 6 + 10;
        }
        
        // Análise – Depois
        if (analise.analiseDepois) {
          doc.setFont(undefined, 'bold');
          doc.text('Análise – Depois', 14, yPos);
          yPos += 8;
          doc.setFont(undefined, 'normal');
          const depoisLines = doc.splitTextToSize(analise.analiseDepois, 180);
          doc.text(depoisLines, 14, yPos);
          yPos += depoisLines.length * 6 + 10;
        }
        
        // Tratamento Realizado
        if (analise.lembretes && analise.lembretes.length > 0) {
          doc.setFont(undefined, 'bold');
          doc.text('Tratamento Realizado', 14, yPos);
          yPos += 8;
          doc.setFont(undefined, 'normal');
          
          analise.lembretes.forEach(lembrete => {
            if (lembrete.texto && lembrete.texto.trim()) {
              const tratamentoLines = doc.splitTextToSize(lembrete.texto, 180);
              doc.text(tratamentoLines, 14, yPos);
              yPos += tratamentoLines.length * 6 + 5;
            }
          });
        }
      } else {
        // Relatório Geral do Cliente – Histórico Consolidado
        const firstAnalise = analisesCliente[0];
        const lastAnalise = analisesCliente[analisesCliente.length - 1];
        const valorTotal = analisesCliente.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
        const mediaValor = valorTotal / analisesCliente.length;
        
        doc.setFontSize(18);
        doc.setTextColor(107, 33, 168);
        doc.text('🔮 Relatório Geral do Cliente – Histórico Consolidado', 105, 15, { align: 'center' });
        
        let yPos = 35;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Nome do Cliente: ${cliente}`, 14, yPos);
        yPos += 8;
        
        if (firstAnalise.dataNascimento) {
          doc.text(`Data de Nascimento: ${new Date(firstAnalise.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 8;
        }
        
        if (firstAnalise.signo) {
          doc.text(`Signo: ${firstAnalise.signo}`, 14, yPos);
          yPos += 8;
        }
        
        if (firstAnalise.dataInicio) {
          doc.text(`Data da Primeira Análise: ${new Date(firstAnalise.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 8;
        }
        
        if (lastAnalise.dataInicio) {
          doc.text(`Data da Última Análise: ${new Date(lastAnalise.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 8;
        }
        
        doc.text(`Total de Análises Realizadas: ${analisesCliente.length}`, 14, yPos);
        yPos += 8;
        
        doc.text(`Valor Total Investido: R$ ${valorTotal.toFixed(2)}`, 14, yPos);
        yPos += 8;
        
        doc.text(`Média por Análise: R$ ${mediaValor.toFixed(2)}`, 14, yPos);
        yPos += 15;
        
        doc.setFont(undefined, 'normal');
        
        // Resumo das Análises
        doc.setFont(undefined, 'bold');
        doc.text('Resumo das Análises', 14, yPos);
        yPos += 10;
        doc.setFont(undefined, 'normal');
        
        analisesCliente.forEach((analise, index) => {
          if (yPos > 220) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.text(`Análise ${index + 1}:`, 14, yPos);
          yPos += 8;
          doc.setFont(undefined, 'normal');
          
          if (analise.dataInicio) {
            doc.text(`Data: ${new Date(analise.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
            yPos += 6;
          }
          
          if (analise.analiseAntes) {
            doc.text('Antes:', 14, yPos);
            yPos += 6;
            const antesLines = doc.splitTextToSize(analise.analiseAntes, 170);
            doc.text(antesLines, 14, yPos);
            yPos += antesLines.length * 5 + 5;
          }
          
          if (analise.analiseDepois) {
            doc.text('Depois:', 14, yPos);
            yPos += 6;
            const depoisLines = doc.splitTextToSize(analise.analiseDepois, 170);
            doc.text(depoisLines, 14, yPos);
            yPos += depoisLines.length * 5 + 5;
          }
          
          if (analise.lembretes && analise.lembretes.length > 0) {
            const tratamentos = analise.lembretes.filter(l => l.texto?.trim());
            if (tratamentos.length > 0) {
              doc.text('Tratamento:', 14, yPos);
              yPos += 6;
              tratamentos.forEach(lembrete => {
                const tratamentoLines = doc.splitTextToSize(lembrete.texto, 170);
                doc.text(tratamentoLines, 14, yPos);
                yPos += tratamentoLines.length * 5;
              });
              yPos += 5;
            }
          }
          
          yPos += 10;
        });
        
        // Observações Gerais
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text('Observações Gerais', 14, yPos);
        yPos += 10;
        doc.setFont(undefined, 'normal');
        
        doc.text('• Evolução observada nas análises.', 14, yPos);
        yPos += 6;
        doc.text('• Padrões recorrentes nas descrições de "Antes" e "Depois".', 14, yPos);
        yPos += 6;
        doc.text('• Frequência dos retornos com base no campo "Avisar daqui a [X] dias".', 14, yPos);
      }
      
      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      const tipoRelatorio = analisesCliente.length === 1 ? 'Individual' : 'Geral';
      doc.save(`Relatorio_${tipoRelatorio}_${cliente.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar relatório",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
      });
    }
  };

  const getTotalValue = () => {
    return analises.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0).toFixed(2);
  };

  const getStatusCounts = () => {
    const finalizados = analises.filter(a => a.finalizado).length;
    const emAndamento = analises.filter(a => !a.finalizado).length;
    return { finalizados, emAndamento };
  };

  const { finalizados, emAndamento } = getStatusCounts();

  return (
    <div className="min-h-screen bg-[#F1F7FF] text-slate-700 overflow-hidden">
      <BirthdayNotifications />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo height={40} width={40} />
              <h1 className="text-lg font-semibold tracking-tight text-[#6B21A8]">Libertá - Tarot Frequencial</h1>
            </div>
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-all duration-200"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 p-4 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Recebido</p>
                  <p className="text-2xl font-bold text-[#6B21A8]">R$ {getTotalValue()}</p>
                </div>
                <div className="rounded-full p-3 bg-[#6B21A8]/10">
                  <DollarSign className="h-8 w-8 text-[#6B21A8]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Finalizados</p>
                  <p className="text-2xl font-bold text-emerald-600">{finalizados}</p>
                </div>
                <div className="rounded-full p-3 bg-emerald-100">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-[#6B21A8]">{emAndamento}</p>
                </div>
                <div className="rounded-full p-3 bg-[#6B21A8]/10">
                  <Clock className="h-8 w-8 text-[#6B21A8]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
          <CardHeader className="border-b border-slate-200/50">
            <CardTitle className="text-[#6B21A8]">Relatórios Tarot Frequencial</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ReportManager variant="tarot" />
          </CardContent>
        </Card>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-700">Lista de Clientes</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="pr-10 bg-white/80 border-white/20 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-slate-200/50">
            <CardTitle className="text-[#6B21A8]">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredClientes.map(cliente => {
                const analisesCliente = getAnalisesByClient(cliente);
                const isExpanded = expandedClient === cliente;
                
                return (
                  <div key={cliente} className="border border-white/20 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md">
                    <div 
                      className="p-4 cursor-pointer flex justify-between items-center"
                      onClick={() => setExpandedClient(isExpanded ? null : cliente)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-[#6B21A8] transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-[#6B21A8] transition-transform duration-200" />
                        )}
                        <span className="font-medium text-slate-800">{cliente}</span>
                        <span className="text-sm text-slate-500">({analisesCliente.length} análises)</span>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-white/20 bg-white/60 animate-fade-in rounded-b-xl">
                        <div className="p-4">
                          <h4 className="font-medium text-slate-700 mb-3">Análises realizadas:</h4>
                          <div className="space-y-3">
                            {analisesCliente.map((analise, index) => (
                              <div key={analise.id} className="bg-white/80 border border-white/30 rounded-lg p-3 hover:bg-white/90 transition-all duration-200 shadow-sm">
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-slate-700">
                                      Análise {index + 1}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                      Data: {analise.dataInicio ? new Date(analise.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}
                                    </span>
                                    <span className="text-sm text-emerald-600 font-medium">
                                      Valor: R$ {parseFloat(analise.preco || "150").toFixed(2)}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit transition-all duration-200 ${
                                      analise.finalizado 
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                                    }`}>
                                      {analise.finalizado ? 'Finalizada' : 'Em andamento'}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-all duration-200"
                                    onClick={() => downloadIndividualAnalysisReport(analise)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar PDF
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredClientes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
                  <p className="text-slate-500 mt-2">Realize análises para visualizar os relatórios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatoriosFrequencial;
