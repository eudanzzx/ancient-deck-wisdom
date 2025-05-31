import React, { useState } from 'react';
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RelatorioIndividualStats from "@/components/relatorio-individual/RelatorioIndividualStats";
import { useRelatorioIndividual } from "@/hooks/useRelatorioIndividual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Download, Calendar, DollarSign, User, ArrowLeft, AlertTriangle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from "react-router-dom";

const RelatorioIndividual = () => {
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const {
    searchTerm,
    setSearchTerm,
    atendimentos,
    clientesUnicos,
    getTotalValue
  } = useRelatorioIndividual();

  const downloadIndividualClientReport = (cliente: any) => {
    try {
      const doc = new jsPDF();
      
      // Header compacto
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(`Relatório - ${cliente.nome}`, 105, 15, { align: 'center' });
      
      // Linha decorativa
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.3);
      doc.line(30, 20, 180, 20);
      
      // Resumo ultra compacto
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`Atendimentos: ${cliente.totalConsultas} | Total: R$ ${cliente.valorTotal.toFixed(2)} | Gerado: ${new Date().toLocaleDateString('pt-BR')}`, 30, 28);

      // Histórico detalhado dos atendimentos
      let yPos = 38;
      doc.setFontSize(10);
      doc.setTextColor(37, 99, 235);
      doc.text('Histórico de Atendimentos:', 30, yPos);
      yPos += 8;

      // Limitar a 8 atendimentos para caber em uma página
      const atendimentosLimitados = cliente.atendimentos.slice(0, 8);
      
      atendimentosLimitados.forEach((atendimento: any, index: number) => {
        if (yPos > 250) return; // Parar se não couber na página
        
        // Cabeçalho do atendimento
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A'} - ${atendimento.tipoServico?.replace(/[-_]/g, ' ') || 'Consulta'} - R$ ${parseFloat(atendimento.valor || "0").toFixed(2)}`, 30, yPos);
        yPos += 6;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        
        // Informações básicas em linha compacta
        const infos = [];
        if (atendimento.statusPagamento) infos.push(`Status: ${atendimento.statusPagamento}`);
        if (atendimento.signo) infos.push(`Signo: ${atendimento.signo}`);
        if (atendimento.destino) infos.push(`Destino: ${atendimento.destino}`);
        if (atendimento.ano) infos.push(`Ano: ${atendimento.ano}`);
        
        if (infos.length > 0) {
          const infoText = infos.join(' | ');
          const infoLines = doc.splitTextToSize(infoText, 150);
          doc.text(infoLines, 30, yPos);
          yPos += infoLines.length * 4 + 2;
        }
        
        // Detalhes da sessão
        if (atendimento.detalhes) {
          doc.setTextColor(37, 99, 235);
          doc.text('Detalhes:', 30, yPos);
          yPos += 4;
          doc.setTextColor(60, 60, 60);
          const detalhesLines = doc.splitTextToSize(atendimento.detalhes, 150);
          const maxDetalhesLines = Math.min(detalhesLines.length, 3); // Máximo 3 linhas
          for (let i = 0; i < maxDetalhesLines; i++) {
            doc.text(detalhesLines[i], 30, yPos);
            yPos += 4;
          }
          if (detalhesLines.length > 3) {
            doc.text('...', 30, yPos);
            yPos += 4;
          }
          yPos += 2;
        }
        
        // Tratamento
        if (atendimento.tratamento) {
          doc.setTextColor(37, 99, 235);
          doc.text('Tratamento:', 30, yPos);
          yPos += 4;
          doc.setTextColor(60, 60, 60);
          const tratamentoLines = doc.splitTextToSize(atendimento.tratamento, 150);
          const maxTratamentoLines = Math.min(tratamentoLines.length, 2); // Máximo 2 linhas
          for (let i = 0; i < maxTratamentoLines; i++) {
            doc.text(tratamentoLines[i], 30, yPos);
            yPos += 4;
          }
          if (tratamentoLines.length > 2) {
            doc.text('...', 30, yPos);
            yPos += 4;
          }
          yPos += 2;
        }
        
        // Indicação
        if (atendimento.indicacao) {
          doc.setTextColor(37, 99, 235);
          doc.text('Indicação:', 30, yPos);
          yPos += 4;
          doc.setTextColor(60, 60, 60);
          const indicacaoLines = doc.splitTextToSize(atendimento.indicacao, 150);
          const maxIndicacaoLines = Math.min(indicacaoLines.length, 2); // Máximo 2 linhas
          for (let i = 0; i < maxIndicacaoLines; i++) {
            doc.text(indicacaoLines[i], 30, yPos);
            yPos += 4;
          }
          if (indicacaoLines.length > 2) {
            doc.text('...', 30, yPos);
            yPos += 4;
          }
          yPos += 2;
        }
        
        // Ponto de atenção
        if (atendimento.atencaoFlag && atendimento.atencaoNota) {
          doc.setTextColor(220, 53, 69);
          doc.text('⚠ ATENÇÃO:', 30, yPos);
          yPos += 4;
          const atencaoLines = doc.splitTextToSize(atendimento.atencaoNota, 150);
          const maxAtencaoLines = Math.min(atencaoLines.length, 2); // Máximo 2 linhas
          for (let i = 0; i < maxAtencaoLines; i++) {
            doc.text(atencaoLines[i], 30, yPos);
            yPos += 4;
          }
          if (atencaoLines.length > 2) {
            doc.text('...', 30, yPos);
            yPos += 4;
          }
          yPos += 2;
        }
        
        // Linha separadora
        if (index < atendimentosLimitados.length - 1 && yPos < 240) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.2);
          doc.line(30, yPos, 180, yPos);
          yPos += 6;
        } else {
          yPos += 4;
        }
      });

      // Nota se houver mais atendimentos
      if (cliente.atendimentos.length > 8 && yPos < 270) {
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`Mostrando 8 de ${cliente.atendimentos.length} atendimentos`, 105, yPos, { align: 'center' });
      }

      // Footer compacto
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Libertá - Relatório Individual`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      doc.save(`Relatorio_Cliente_${cliente.nome.replace(/ /g, '_')}.pdf`);
      
      toast.success(`Relatório de ${cliente.nome} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const downloadGeneralReport = () => {
    try {
      const doc = new jsPDF();
      
      // Header elegante
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('Relatório Geral', 105, 25, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(120, 120, 120);
      doc.text('Resumo de Atendimentos', 105, 35, { align: 'center' });
      
      // Linha decorativa
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(30, 45, 180, 45);
      
      // Estatísticas em boxes
      const totalAtendimentos = atendimentos.length;
      const totalValue = parseFloat(getTotalValue());
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Box 1 - Total
      doc.rect(20, 55, 45, 25);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Total', 25, 63);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(totalAtendimentos.toString(), 42, 75, { align: 'center' });
      
      // Box 2 - Valor
      doc.rect(75, 55, 60, 25);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Receita Total', 80, 63);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(`R$ ${totalValue.toFixed(2)}`, 105, 75, { align: 'center' });
      
      // Box 3 - Clientes
      doc.rect(145, 55, 45, 25);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Clientes', 150, 63);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(clientesUnicos.length.toString(), 167, 75, { align: 'center' });
      
      // Tabela simplificada
      const tableData = atendimentos.slice(0, 20).map(a => [
        a.nome || 'N/A',
        a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A',
        a.tipoServico?.replace(/[-_]/g, ' ') || 'N/A',
        `R$ ${parseFloat(a.valor || a.preco || "0").toFixed(2)}`
      ]);
      
      autoTable(doc, {
        head: [["Cliente", "Data", "Serviço", "Valor"]],
        body: tableData,
        startY: 95,
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          cellPadding: 6,
          textColor: [60, 60, 60],
        },
        headStyles: { 
          fillColor: [37, 99, 235], 
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
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`Relatorio_Geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório geral gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <DashboardHeader />

      <main className="pt-20 p-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300">
              <Logo height={50} width={50} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Relatórios Individuais
              </h1>
              <p className="text-blue-600/80 mt-1">Relatórios detalhados por cliente</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-blue-600/30 text-blue-600 hover:bg-blue-600/10 hover:border-blue-600"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>

        <RelatorioIndividualStats
          totalValue={getTotalValue()}
          totalConsultas={atendimentos.length}
          totalClientes={clientesUnicos.length}
        />

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl mb-6">
          <CardHeader className="border-b border-slate-200/50">
            <CardTitle className="text-blue-600">Relatórios Gerais</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={downloadGeneralReport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Relatório Geral
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-200/50 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Clientes para Relatório
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-600/10 text-blue-600 border-blue-600/20">
                  {clientesUnicos.length} clientes
                </Badge>
              </div>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pr-10 bg-white/90 border-white/30 focus:border-blue-600 focus:ring-blue-600/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {clientesUnicos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mt-2">
                  {searchTerm 
                    ? "Tente ajustar sua busca ou limpar o filtro" 
                    : "Nenhum atendimento registrado ainda"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientesUnicos.map((cliente, index) => (
                  <div key={`${cliente.nome}-${index}`} className="border border-white/20 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md">
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-slate-800">{cliente.nome}</span>
                            {cliente.atendimentos.some((a: any) => a.atencaoFlag) && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Última: {cliente.ultimaConsulta 
                                  ? new Date(cliente.ultimaConsulta).toLocaleDateString('pt-BR')
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-emerald-600">
                                R$ {cliente.valorTotal.toFixed(2)}
                              </span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {cliente.totalConsultas} consulta{cliente.totalConsultas !== 1 ? 's' : ''}
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
                            size="sm"
                            onClick={() => downloadIndividualClientReport(cliente)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Relatório Individual
                          </Button>
                        </div>
                      </div>

                      {expandedClient === cliente.nome && (
                        <div className="mt-4 border-t border-blue-600/20 pt-4">
                          <h4 className="font-medium text-blue-600 mb-3">Histórico de Atendimentos</h4>
                          <div className="space-y-3">
                            {cliente.atendimentos.map((atendimento: any, idx: number) => (
                              <div key={idx} className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium text-blue-600">Data:</span>
                                    <span className="ml-2 text-slate-700">
                                      {atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">Serviço:</span>
                                    <span className="ml-2 text-slate-700">{atendimento.tipoServico?.replace(/[-_]/g, ' ') || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">Valor:</span>
                                    <span className="ml-2 text-slate-700">R$ {parseFloat(atendimento.valor || "0").toFixed(2)}</span>
                                  </div>
                                  
                                  {atendimento.statusPagamento && (
                                    <div>
                                      <span className="font-medium text-blue-600">Status:</span>
                                      <span className="ml-2 text-slate-700">{atendimento.statusPagamento}</span>
                                    </div>
                                  )}
                                  
                                  {atendimento.signo && (
                                    <div>
                                      <span className="font-medium text-blue-600">Signo:</span>
                                      <span className="ml-2 text-slate-700">{atendimento.signo}</span>
                                    </div>
                                  )}
                                  
                                  {atendimento.destino && (
                                    <div>
                                      <span className="font-medium text-blue-600">Destino:</span>
                                      <span className="ml-2 text-slate-700">{atendimento.destino}</span>
                                    </div>
                                  )}
                                  
                                  {atendimento.ano && (
                                    <div>
                                      <span className="font-medium text-blue-600">Ano:</span>
                                      <span className="ml-2 text-slate-700">{atendimento.ano}</span>
                                    </div>
                                  )}
                                </div>

                                {atendimento.detalhes && (
                                  <div className="mt-3">
                                    <span className="font-medium text-blue-600">Detalhes da Sessão:</span>
                                    <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border">{atendimento.detalhes}</p>
                                  </div>
                                )}

                                {atendimento.tratamento && (
                                  <div className="mt-3">
                                    <span className="font-medium text-blue-600">Tratamento:</span>
                                    <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border">{atendimento.tratamento}</p>
                                  </div>
                                )}

                                {atendimento.indicacao && (
                                  <div className="mt-3">
                                    <span className="font-medium text-blue-600">Indicação:</span>
                                    <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border">{atendimento.indicacao}</p>
                                  </div>
                                )}

                                {atendimento.atencaoFlag && atendimento.atencaoNota && (
                                  <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                      <span className="font-medium text-red-600">Ponto de Atenção:</span>
                                    </div>
                                    <p className="mt-1 text-sm text-red-700">{atendimento.atencaoNota}</p>
                                  </div>
                                )}
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
