
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DetailedClientReportGeneratorProps {
  clientName: string;
  analises: any[];
  onGenerate?: () => void;
}

const DetailedClientReportGenerator: React.FC<DetailedClientReportGeneratorProps> = ({
  clientName,
  analises,
  onGenerate
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
    doc.text(`Cliente: ${clientName}`, 14, 35);
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
      new Date(analise.dataInicio).toLocaleDateString('pt-BR'),
      analise.tipoConsulta || 'Não informado',
      `R$ ${parseFloat(analise.valor || 0).toFixed(2)}`,
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
    const fileName = `relatorio-detalhado-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    if (onGenerate) {
      onGenerate();
    }
  };

  return { generateDetailedReport };
};

export default DetailedClientReportGenerator;
