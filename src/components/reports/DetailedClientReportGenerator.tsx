
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DetailedClientReportGeneratorProps {
  atendimentos: any[];
  clients: Array<{ name: string; count: number }>;
  variant?: 'home' | 'tarot';
  onClose?: () => void;
}

const DetailedClientReportGenerator: React.FC<DetailedClientReportGeneratorProps> = ({ 
  atendimentos, 
  clients,
  variant = 'home',
  onClose
}) => {
  const downloadAllDetailedReports = () => {
    try {
      if (variant === 'tarot') {
        generateTarotGeneralReport();
      } else {
        clients.forEach((client, index) => {
          setTimeout(() => {
            downloadDetailedClientReport(client.name);
          }, index * 1000);
        });
        
        toast.success(`Gerando ${clients.length} relatorios individuais detalhados...`);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao gerar relatorios:", error);
      toast.error("Erro ao gerar relatorios");
    }
  };

  const downloadDetailedClientReport = (clientName: string) => {
    try {
      const clientConsultations = atendimentos.filter(a => 
        variant === 'tarot' ? a.nomeCliente === clientName : a.nome === clientName || a.nomeCliente === clientName
      );
      
      if (clientConsultations.length === 0) {
        toast.error("Nenhum atendimento encontrado para este cliente");
        return;
      }
      
      const doc = new jsPDF();
      
      // Header elegante
      doc.setFontSize(20);
      doc.setTextColor(variant === 'tarot' ? 103 : 37, variant === 'tarot' ? 49 : 99, variant === 'tarot' ? 147 : 235);
      doc.text(`Relatório Detalhado`, 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(120, 120, 120);
      doc.text(`Cliente: ${clientName}`, 105, 30, { align: 'center' });
      
      // Linha decorativa
      doc.setDrawColor(variant === 'tarot' ? 103 : 37, variant === 'tarot' ? 49 : 99, variant === 'tarot' ? 147 : 235);
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Resumo do cliente
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de Atendimentos: ${clientConsultations.length}`, 20, 55);
      
      const totalValue = clientConsultations.reduce((acc, curr) => {
        const valor = parseFloat(curr.valor || curr.preco || "0");
        return acc + valor;
      }, 0);
      
      doc.text(`Valor Total: R$ ${totalValue.toFixed(2)}`, 20, 65);
      doc.text(`Valor Médio: R$ ${(totalValue / clientConsultations.length).toFixed(2)}`, 20, 75);

      // Tabela de atendimentos
      const tableData = clientConsultations.map(consultation => {
        const dataAtendimento = consultation.dataAtendimento || consultation.dataInicio;
        return [
          dataAtendimento ? new Date(dataAtendimento).toLocaleDateString('pt-BR') : 'N/A',
          consultation.tipoServico || 'N/A',
          `R$ ${parseFloat(consultation.valor || consultation.preco || "0").toFixed(2)}`,
          consultation.statusPagamento || (consultation.finalizado ? 'Finalizada' : 'Pendente')
        ];
      });

      autoTable(doc, {
        head: [['Data', 'Serviço', 'Valor', 'Status']],
        body: tableData,
        startY: 90,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 6,
          textColor: [60, 60, 60],
        },
        headStyles: {
          fillColor: variant === 'tarot' ? [103, 49, 147] : [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        margin: { left: 20, right: 20 },
      });

      addFooter(doc);
      
      const fileName = `Relatorio_Detalhado_${clientName.replace(/ /g, '_')}.pdf`;
      doc.save(fileName);
      
      toast.success(`Relatorio detalhado de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatorio");
    }
  };

  const generateTarotGeneralReport = () => {
    const doc = new jsPDF();
    
    // Header elegante
    doc.setFontSize(20);
    doc.setTextColor(103, 49, 147);
    doc.text('Relatório Geral Consolidado', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(120, 120, 120);
    doc.text('Histórico de Análises', 105, 30, { align: 'center' });
    
    // Linha decorativa
    doc.setDrawColor(103, 49, 147);
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    let yPos = 55;
    
    const clientsMap = new Map();
    atendimentos.forEach(analise => {
      const clientName = analise.nomeCliente;
      if (!clientsMap.has(clientName)) {
        clientsMap.set(clientName, []);
      }
      clientsMap.get(clientName).push(analise);
    });

    Array.from(clientsMap.entries()).forEach(([clientName, consultations], clientIndex) => {
      if (clientIndex > 0) {
        doc.addPage();
        yPos = 20;
      }
      
      const totalValue = consultations.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
      
      doc.setFontSize(16);
      doc.setTextColor(103, 49, 147);
      doc.text(`${clientName}`, 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de Análises: ${consultations.length}`, 20, yPos);
      yPos += 8;
      doc.text(`Valor Total: R$ ${totalValue.toFixed(2)}`, 20, yPos);
      yPos += 15;
      
      // Tabela das análises do cliente
      const tableData = consultations.map(consultation => [
        consultation.dataInicio ? new Date(consultation.dataInicio).toLocaleDateString('pt-BR') : 'N/A',
        `R$ ${parseFloat(consultation.preco || "150").toFixed(2)}`,
        consultation.finalizado ? 'Finalizada' : 'Pendente'
      ]);

      autoTable(doc, {
        head: [['Data', 'Valor', 'Status']],
        body: tableData,
        startY: yPos,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 6,
          textColor: [60, 60, 60],
        },
        headStyles: {
          fillColor: [103, 49, 147],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        margin: { left: 20, right: 20 },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 20;
    });
    
    addFooter(doc);
    
    const fileName = `Relatorio_Geral_Consolidado_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
    toast.success("Relatorio geral consolidado gerado com sucesso!");
  };

  const addFooter = (doc) => {
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
  };

  const buttonColor = variant === 'tarot' ? 
    'bg-[#673193] hover:bg-[#673193]/90 text-white' : 
    'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white';

  return (
    <div className="flex gap-2">
      <Button
        onClick={downloadAllDetailedReports}
        className={buttonColor}
      >
        <Download className="h-4 w-4 mr-2" />
        Todos Detalhados
      </Button>
      {onClose && (
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default DetailedClientReportGenerator;
