
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GeneralReportGeneratorProps {
  atendimentos: any[];
}

const GeneralReportGenerator: React.FC<GeneralReportGeneratorProps> = ({ atendimentos }) => {
  const downloadGeneralReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text('Relatorio Geral de Atendimentos', 105, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      const totalAtendimentos = atendimentos.length;
      const totalValue = atendimentos.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);
      const paidConsultations = atendimentos.filter(a => a.statusPagamento === 'pago').length;
      const pendingConsultations = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
      
      doc.text(`Total de Atendimentos: ${totalAtendimentos}`, 14, yPos);
      yPos += 8;
      doc.text(`Valor Total: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 8;
      doc.text(`Consultas Pagas: ${paidConsultations}`, 14, yPos);
      yPos += 8;
      doc.text(`Consultas Pendentes: ${pendingConsultations}`, 14, yPos);
      yPos += 15;
      
      const tableColumn = ["Cliente", "Data", "Servico", "Valor", "Status"];
      const tableRows = atendimentos.map(a => [
        a.nome || 'N/A',
        a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A',
        a.tipoServico?.replace('-', ' ') || 'N/A',
        `R$ ${parseFloat(a.valor || "0").toFixed(2)}`,
        a.statusPagamento || 'N/A'
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] }
      });
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Liberta - Relatorio gerado em ${new Date().toLocaleDateString('pt-BR')} - Pagina ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`Relatorio_Geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatorio geral gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatorio");
    }
  };

  return (
    <Button
      onClick={downloadGeneralReport}
      className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
    >
      <FileText className="h-4 w-4 mr-2" />
      Relatorio Geral
    </Button>
  );
};

export default GeneralReportGenerator;
