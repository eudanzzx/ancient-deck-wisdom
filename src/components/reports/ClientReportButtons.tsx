
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ClientReportButtonsProps {
  clientName: string;
  analises: any[];
  allAnalises?: any[];
}

const ClientReportButtons: React.FC<ClientReportButtonsProps> = ({
  clientName,
  analises,
  allAnalises = []
}) => {
  const generateDetailedReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Relatório Detalhado - Tarot', 14, 22);
    
    // Client info
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${clientName || 'Todos os Clientes'}`, 14, 35);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 45);
    
    // Statistics
    const finalizadas = analises.filter(a => a.finalizado).length;
    const emAndamento = analises.length - finalizadas;
    const valorTotal = analises.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0);
    
    doc.setFontSize(12);
    doc.text('Resumo:', 14, 60);
    doc.text(`Total de análises: ${analises.length}`, 20, 70);
    doc.text(`Finalizadas: ${finalizadas}`, 20, 80);
    doc.text(`Em andamento: ${emAndamento}`, 20, 90);
    doc.text(`Valor total: R$ ${valorTotal.toFixed(2)}`, 20, 100);
    
    // Detailed table
    const tableData = analises.map(analise => [
      new Date(analise.dataInicio || analise.dataAtendimento).toLocaleDateString('pt-BR'),
      analise.tipoConsulta || analise.tipoServico || 'Não informado',
      `R$ ${parseFloat(analise.valor || analise.preco || 0).toFixed(2)}`,
      analise.finalizado ? 'Finalizada' : 'Em andamento',
      analise.observacoes || 'Sem observações'
    ]);

    autoTable(doc, {
      head: [['Data', 'Tipo', 'Valor', 'Status', 'Observações']],
      body: tableData,
      startY: 110,
      styles: { 
        fontSize: 8,
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
    const fileName = `relatorio-detalhado-${clientName ? clientName.replace(/\s+/g, '-') : 'geral'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const generateGeneralReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Relatório Geral - Tarot', 14, 22);
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);
    
    // General statistics
    const totalAnalises = allAnalises.length;
    const finalizadas = allAnalises.filter(a => a.finalizado).length;
    const emAndamento = totalAnalises - finalizadas;
    const valorTotal = allAnalises.reduce((sum, a) => sum + (parseFloat(a.valor || a.preco) || 0), 0);
    const clientes = [...new Set(allAnalises.map(a => a.nomeCliente || a.nome))].length;
    
    doc.text('Estatísticas Gerais:', 14, 50);
    doc.text(`Total de análises: ${totalAnalises}`, 20, 60);
    doc.text(`Clientes únicos: ${clientes}`, 20, 70);
    doc.text(`Análises finalizadas: ${finalizadas}`, 20, 80);
    doc.text(`Análises em andamento: ${emAndamento}`, 20, 90);
    doc.text(`Valor total faturado: R$ ${valorTotal.toFixed(2)}`, 20, 100);
    
    // Client breakdown
    const clientStats = allAnalises.reduce((acc, analise) => {
      const cliente = analise.nomeCliente || analise.nome;
      if (!acc[cliente]) {
        acc[cliente] = { total: 0, valor: 0, finalizadas: 0 };
      }
      acc[cliente].total++;
      acc[cliente].valor += parseFloat(analise.valor || analise.preco || 0);
      if (analise.finalizado) acc[cliente].finalizadas++;
      return acc;
    }, {});
    
    const clientTableData = Object.entries(clientStats).map(([cliente, stats]: [string, any]) => [
      cliente,
      stats.total.toString(),
      stats.finalizadas.toString(),
      (stats.total - stats.finalizadas).toString(),
      `R$ ${stats.valor.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Cliente', 'Total', 'Finalizadas', 'Em Andamento', 'Valor Total']],
      body: clientTableData,
      startY: 115,
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
    
    // Save
    const fileName = `relatorio-geral-tarot-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={generateDetailedReport}
        className="bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Relatório Individual
      </Button>
      
      {allAnalises.length > 0 && (
        <Button 
          onClick={generateGeneralReport}
          variant="outline"
          size="sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Relatório Geral
        </Button>
      )}
    </div>
  );
};

export default ClientReportButtons;
