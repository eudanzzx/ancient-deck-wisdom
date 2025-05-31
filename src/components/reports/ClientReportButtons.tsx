
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ClientReportButtonsProps {
  clients: Array<{ name: string; count: number }>;
  atendimentos: any[];
  variant?: 'home' | 'tarot';
}

const ClientReportButtons: React.FC<ClientReportButtonsProps> = ({ 
  clients, 
  atendimentos,
  variant = 'home'
}) => {
  const downloadDetailedClientReport = (clientName: string) => {
    try {
      const clientConsultations = atendimentos.filter(a => 
        variant === 'tarot' ? a.nomeCliente === clientName : a.nome === clientName
      );
      
      if (clientConsultations.length === 0) {
        toast.error("Nenhum atendimento encontrado para este cliente");
        return;
      }
      
      const doc = new jsPDF();
      
      // Header elegante e minimalista
      doc.setFontSize(20);
      doc.setTextColor(variant === 'tarot' ? 103 : 37, variant === 'tarot' ? 49 : 99, variant === 'tarot' ? 147 : 235);
      doc.text(`Relatório - ${clientName}`, 105, 25, { align: 'center' });
      
      // Linha decorativa
      doc.setDrawColor(variant === 'tarot' ? 103 : 37, variant === 'tarot' ? 49 : 99, variant === 'tarot' ? 147 : 235);
      doc.setLineWidth(0.5);
      doc.line(30, 35, 180, 35);
      
      // Resumo em boxes elegantes
      const totalValue = clientConsultations.reduce((acc, curr) => {
        const valor = parseFloat(curr.valor || curr.preco || "0");
        return acc + valor;
      }, 0);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Box com informações resumidas
      doc.rect(40, 45, 120, 30, 'S');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('RESUMO', 100, 55, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Atendimentos: ${clientConsultations.length}`, 50, 65);
      doc.text(`Total: R$ ${totalValue.toFixed(2)}`, 120, 65);

      // Tabela simplificada e elegante
      const tableData = clientConsultations.map(consultation => {
        const dataAtendimento = consultation.dataAtendimento || consultation.dataInicio;
        return [
          dataAtendimento ? new Date(dataAtendimento).toLocaleDateString('pt-BR') : 'N/A',
          consultation.tipoServico?.replace('-', ' ') || 'Análise',
          `R$ ${parseFloat(consultation.valor || consultation.preco || "0").toFixed(2)}`
        ];
      });

      autoTable(doc, {
        head: [['Data', 'Serviço', 'Valor']],
        body: tableData,
        startY: 90,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 8,
          textColor: [40, 40, 40],
          lineColor: [220, 220, 220],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: variant === 'tarot' ? [103, 49, 147] : [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        margin: { left: 30, right: 30 },
      });

      // Footer minimalista
      addFooter(doc);
      
      const filePrefix = variant === 'tarot' ? 'Relatorio_Tarot' : 'Relatorio_Cliente';
      doc.save(`${filePrefix}_${clientName.replace(/ /g, '_')}.pdf`);
      
      toast.success(`Relatório de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const addFooter = (doc) => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Libertá - Página ${i} de ${totalPages}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  };

  if (clients.length === 0) return null;

  const buttonStyle = variant === 'tarot' ? 
    'border-[#673193] text-[#673193] hover:bg-purple-50' : 
    'border-[#2196F3] text-[#2196F3] hover:bg-blue-50';

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Relatórios por Cliente:</h3>
      <div className="flex flex-wrap gap-2">
        {clients.map((client) => (
          <Button
            key={client.name}
            onClick={() => downloadDetailedClientReport(client.name)}
            variant="outline"
            size="sm"
            className={`text-xs ${buttonStyle}`}
          >
            <User className="h-3 w-3 mr-1" />
            {client.name} ({client.count})
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ClientReportButtons;
