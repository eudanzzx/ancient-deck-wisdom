
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Calendar, DollarSign, FileText, Users, Star, User } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Logo from "@/components/Logo";

const RelatorioIndividual = () => {
  const { getAtendimentos } = useUserDataService();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [analises] = useState(getAtendimentos());

  // Função para formatar data de forma segura
  const formatarDataSegura = (data: string) => {
    if (!data || data.trim() === '') {
      return 'Data não informada';
    }
    
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        return 'Data não informada';
      }
      return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data não informada';
    }
  };

  const clientesUnicos = useMemo(() => {
    const clientesMap = new Map();
    
    analises.forEach(analise => {
      const clienteKey = analise.nome.toLowerCase();
      if (!clientesMap.has(clienteKey)) {
        clientesMap.set(clienteKey, {
          nome: analise.nome,
          atendimentos: []
        });
      }
      clientesMap.get(clienteKey).atendimentos.push(analise);
    });

    return Array.from(clientesMap.values());
  }, [analises]);

  const clientesFiltrados = useMemo(() => {
    return clientesUnicos.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientesUnicos, searchTerm]);

  const calcularTotalCliente = (atendimentos: any[]) => {
    return atendimentos.reduce((total, atendimento) => {
      const valor = parseFloat(atendimento.valor || "0");
      return total + valor;
    }, 0);
  };

  const gerarRelatorioIndividual = useCallback((cliente: any) => {
    try {
      console.log('Gerando relatório para cliente:', cliente.nome);
      console.log('Atendimentos do cliente:', cliente.atendimentos);
      
      const doc = new jsPDF();
      
      // Header elegante
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('Relatório Individual', 105, 25, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(120, 120, 120);
      doc.text('Atendimentos Detalhados', 105, 35, { align: 'center' });
      
      // Linha decorativa
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);
      
      // Informações do cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Cliente: ${cliente.nome}`, 20, 60);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`, 20, 70);
      
      // Resumo em caixas
      const totalGasto = calcularTotalCliente(cliente.atendimentos);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Box 1 - Total de atendimentos
      doc.rect(20, 80, 50, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Total Atendimentos', 25, 87);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(cliente.atendimentos.length.toString(), 45, 96, { align: 'center' });
      
      // Box 2 - Valor total
      doc.rect(80, 80, 50, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Valor Total', 85, 87);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(`R$ ${totalGasto.toFixed(2)}`, 105, 96, { align: 'center' });
      
      // Box 3 - Valor médio
      doc.rect(140, 80, 50, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Valor Médio', 145, 87);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      const valorMedio = cliente.atendimentos.length > 0 ? (totalGasto / cliente.atendimentos.length).toFixed(2) : '0.00';
      doc.text(`R$ ${valorMedio}`, 165, 96, { align: 'center' });

      // Histórico de atendimentos detalhado
      const tableData = cliente.atendimentos.slice(0, 8).map((atendimento: any) => [
        formatarDataSegura(atendimento.dataAtendimento || atendimento.data),
        atendimento.tipoServico || 'N/A',
        `R$ ${parseFloat(atendimento.valor || "0").toFixed(2)}`,
        atendimento.sessao || 'N/A',
        atendimento.tratamento || 'N/A',
        atendimento.indicacao || 'N/A'
      ]);

      console.log('Dados da tabela:', tableData);

      autoTable(doc, {
        head: [['Data', 'Serviço', 'Valor', 'Sessão', 'Tratamento', 'Indicação']],
        body: tableData,
        startY: 115,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: [60, 60, 60],
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 }
        }
      });

      // Footer elegante
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

      console.log('PDF gerado com sucesso, iniciando download...');
      doc.save(`relatorio-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Verifique os dados do cliente.');
    }
  }, []);

  const calcularTotalGeral = () => {
    return clientesUnicos.reduce((total, cliente) => {
      return total + calcularTotalCliente(cliente.atendimentos);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo height={50} width={50} />
            <div>
              <h1 className="text-3xl font-bold text-[#2563EB]">
                Relatórios Individuais
              </h1>
              <p className="text-[#2563EB] mt-1 opacity-80">Análises por cliente</p>
            </div>
          </div>
          
          <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white">
            <Download className="h-4 w-4 mr-2" />
            Relatório Consolidado
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-slate-800">{clientesUnicos.length}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <Users className="h-8 w-8 text-[#2563EB]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Atendimentos</p>
                  <p className="text-3xl font-bold text-slate-800">{analises.length}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <FileText className="h-8 w-8 text-[#2563EB]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Receita Total</p>
                  <p className="text-3xl font-bold text-slate-800">R$ {calcularTotalGeral().toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <DollarSign className="h-8 w-8 text-[#2563EB]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Ticket Médio</p>
                  <p className="text-3xl font-bold text-slate-800">
                    R$ {clientesUnicos.length > 0 ? (calcularTotalGeral() / clientesUnicos.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <Calendar className="h-8 w-8 text-[#2563EB]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
          <CardHeader className="border-b border-slate-200/50 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold text-[#2563EB]">
                  Clientes
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {clientesUnicos.length} clientes
                </Badge>
              </div>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pr-10 bg-white/90 border-white/30 focus:border-[#2563EB]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {clientesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mt-2">
                  {searchTerm 
                    ? "Tente ajustar sua busca" 
                    : "Nenhum atendimento foi registrado ainda"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientesFiltrados.map((cliente, index) => (
                  <div key={`${cliente.nome}-${index}`} className="border border-white/20 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md">
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-[#2563EB]" />
                            <span className="font-medium text-slate-800">{cliente.nome}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-[#2563EB]" />
                              <span>{cliente.atendimentos.length} atendimento(s)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-emerald-600">
                                R$ {calcularTotalCliente(cliente.atendimentos).toFixed(2)}
                              </span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {cliente.atendimentos.length} atendimento{cliente.atendimentos.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedClient(expandedClient === cliente.nome ? null : cliente.nome)}
                            className="border-blue-600/30 text-blue-600 hover:bg-blue-600/10"
                          >
                            {expandedClient === cliente.nome ? 'Ocultar' : 'Ver'} Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            className="border-[#2563EB]/30 text-[#2563EB] hover:bg-[#2563EB]/10"
                            onClick={() => gerarRelatorioIndividual(cliente)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Relatório
                          </Button>
                        </div>
                      </div>

                      {expandedClient === cliente.nome && (
                        <div className="mt-4 border-t border-blue-600/20 pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-blue-600">Histórico de Atendimentos</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#2563EB]/30 text-[#2563EB] hover:bg-[#2563EB]/10"
                              onClick={() => gerarRelatorioIndividual(cliente)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Baixar PDF
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {cliente.atendimentos.map((atendimento: any, idx: number) => (
                              <div key={idx} className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium text-blue-600">Data:</span>
                                    <span className="ml-2 text-slate-700">
                                      {formatarDataSegura(atendimento.dataAtendimento || atendimento.data)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">Serviço:</span>
                                    <span className="ml-2 text-slate-700">{atendimento.tipoServico || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">Valor:</span>
                                    <span className="ml-2 text-slate-700">R$ {parseFloat(atendimento.valor || "0").toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">Sessão:</span>
                                    <span className="ml-2 text-slate-700">{atendimento.sessao || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">Tratamento:</span>
                                    <span className="ml-2 text-slate-700">{atendimento.tratamento || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">Indicação:</span>
                                    <span className="ml-2 text-slate-700">{atendimento.indicacao || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioIndividual;
