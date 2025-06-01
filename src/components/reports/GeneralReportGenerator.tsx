
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GeneralReportGeneratorProps {
  analises: any[];
  onGenerate?: () => void;
}

const GeneralReportGenerator: React.FC<GeneralReportGeneratorProps> = ({
  analises,
  onGenerate
}) => {
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
    const totalAnalises = analises.length;
    const finalizadas = analises.filter(a => a.finalizado).length;
    const emAndamento = totalAnalises - finalizadas;
    const valorTotal = analises.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0);
    const clientes = [...new Set(analises.map(a => a.nomeCliente))].length;
    
    doc.text('Estatísticas Gerais:', 14, 50);
    doc.text(`Total de análises: ${totalAnalises}`, 20, 60);
    doc.text(`Clientes únicos: ${clientes}`, 20, 70);
    doc.text(`Análises finalizadas: ${finalizadas}`, 20, 80);
    doc.text(`Análises em andamento: ${emAndamento}`, 20, 90);
    doc.text(`Valor total faturado: R$ ${valorTotal.toFixed(2)}`, 20, 100);
    
    // Client breakdown
    const clientStats = analises.reduce((acc, analise) => {
      const cliente = analise.nomeCliente;
      if (!acc[cliente]) {
        acc[cliente] = { total: 0, valor: 0, finalizadas: 0 };
      }
      acc[cliente].total++;
      acc[cliente].valor += parseFloat(analise.valor || 0);
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
    
    if (onGenerate) {
      onGenerate();
    }
  };

  return { generateGeneralReport };
};

export default GeneralReportGenerator;
