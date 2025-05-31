import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

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
      
      // Close the component after generating reports
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
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`Relatorio Detalhado - Cliente: ${clientName}`, 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Total de Atendimentos: ${clientConsultations.length}`, 14, 35);
      
      let yPos = 50;
      
      doc.text('==================================================', 14, yPos);
      yPos += 15;
      
      clientConsultations.forEach((consultation, index) => {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`Atendimento no ${index + 1}`, 14, yPos);
        yPos += 10;
        
        doc.setFont(undefined, 'normal');
        const dataAtendimento = consultation.dataAtendimento ? 
          new Date(consultation.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A';
        doc.text(`Data do Atendimento: ${dataAtendimento}`, 14, yPos);
        yPos += 10;
        
        doc.text(`Nome do Cliente: ${clientName}`, 14, yPos);
        yPos += 8;
        
        const dataNascimento = consultation.dataNascimento ? 
          new Date(consultation.dataNascimento).toLocaleDateString('pt-BR') : 'N/A';
        doc.text(`Data de Nascimento: ${dataNascimento}`, 14, yPos);
        yPos += 8;
        
        doc.text(`Signo: ${consultation.signo || 'N/A'}`, 14, yPos);
        yPos += 8;
        
        const tipoServico = consultation.tipoServico ? 
          consultation.tipoServico.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
        doc.text(`Tipo de Servico: ${tipoServico}`, 14, yPos);
        yPos += 8;
        
        const valorValue = consultation.valor || consultation.preco || "0";
        const valor = parseFloat(valorValue.toString()).toFixed(2);
        doc.text(`Valor Cobrado: R$ ${valor}`, 14, yPos);
        yPos += 8;
        
        const statusPagamento = consultation.statusPagamento ? 
          consultation.statusPagamento.charAt(0).toUpperCase() + consultation.statusPagamento.slice(1) : 'N/A';
        doc.text(`Status de Pagamento: ${statusPagamento}`, 14, yPos);
        yPos += 8;
        
        doc.text(`Destino: ${consultation.destino || 'N/A'}`, 14, yPos);
        yPos += 8;
        
        doc.text(`Ano: ${consultation.ano || 'N/A'}`, 14, yPos);
        yPos += 15;
        
        doc.setFont(undefined, 'bold');
        doc.text('Pontos de Atencao', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        if (consultation.atencaoFlag && consultation.atencaoNota) {
          const atencaoLines = doc.splitTextToSize(consultation.atencaoNota, 180);
          doc.text(atencaoLines, 14, yPos);
          yPos += atencaoLines.length * 6;
        } else {
          doc.text('Nenhum ponto de atencao registrado', 14, yPos);
          yPos += 6;
        }
        yPos += 10;
        
        doc.setFont(undefined, 'bold');
        doc.text('Detalhes da Sessao', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        if (consultation.detalhes) {
          const detalhesLines = doc.splitTextToSize(consultation.detalhes, 180);
          doc.text(detalhesLines, 14, yPos);
          yPos += detalhesLines.length * 6;
        } else {
          doc.text('Nenhum detalhe registrado', 14, yPos);
          yPos += 6;
        }
        yPos += 10;
        
        doc.setFont(undefined, 'bold');
        doc.text('Tratamento', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        if (consultation.tratamento) {
          const tratamentoLines = doc.splitTextToSize(consultation.tratamento, 180);
          doc.text(tratamentoLines, 14, yPos);
          yPos += tratamentoLines.length * 6;
        } else {
          doc.text('Nenhum tratamento registrado', 14, yPos);
          yPos += 6;
        }
        yPos += 10;
        
        doc.setFont(undefined, 'bold');
        doc.text('Indicacao', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        if (consultation.indicacao) {
          const indicacaoLines = doc.splitTextToSize(consultation.indicacao, 180);
          doc.text(indicacaoLines, 14, yPos);
          yPos += indicacaoLines.length * 6;
        } else {
          doc.text('Nenhuma indicacao registrada', 14, yPos);
          yPos += 6;
        }
        yPos += 15;
        
        doc.text('==================================================', 14, yPos);
        yPos += 15;
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
    
    doc.setFontSize(18);
    doc.setTextColor(124, 100, 244);
    doc.text('Relatorio Geral do Cliente - Historico Consolidado', 105, 15, { align: 'center' });
    
    let yPos = 35;
    
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
      
      const firstConsultation = consultations[0];
      const lastConsultation = consultations[consultations.length - 1];
      const totalValue = consultations.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
      const avgValue = totalValue / consultations.length;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      doc.setFont(undefined, 'bold');
      doc.text(`Nome do Cliente: ${clientName}`, 14, yPos);
      yPos += 8;
      
      if (firstConsultation.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(firstConsultation.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (firstConsultation.signo) {
        doc.text(`Signo: ${firstConsultation.signo}`, 14, yPos);
        yPos += 8;
      }
      
      if (firstConsultation.dataInicio) {
        doc.text(`Data da Primeira Analise: ${new Date(firstConsultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (lastConsultation.dataInicio) {
        doc.text(`Data da Ultima Analise: ${new Date(lastConsultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Total de Analises Realizadas: ${consultations.length}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor Total Investido: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Media por Analise: R$ ${avgValue.toFixed(2)}`, 14, yPos);
      yPos += 15;
      
      doc.setFont(undefined, 'normal');
      
      doc.setFont(undefined, 'bold');
      doc.text('Resumo das Analises', 14, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      
      consultations.forEach((consultation, index) => {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`Analise ${index + 1}:`, 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        
        if (consultation.dataInicio) {
          doc.text(`Data: ${new Date(consultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 6;
        }
        
        if (consultation.analiseAntes) {
          doc.text('Antes:', 14, yPos);
          yPos += 6;
          const antesLines = doc.splitTextToSize(consultation.analiseAntes, 170);
          doc.text(antesLines, 14, yPos);
          yPos += antesLines.length * 5 + 5;
        }
        
        if (consultation.analiseDepois) {
          doc.text('Depois:', 14, yPos);
          yPos += 6;
          const depoisLines = doc.splitTextToSize(consultation.analiseDepois, 170);
          doc.text(depoisLines, 14, yPos);
          yPos += depoisLines.length * 5 + 5;
        }
        
        if (consultation.lembretes && consultation.lembretes.length > 0) {
          const tratamentos = consultation.lembretes.filter(l => l.texto?.trim());
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
      
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text('Observacoes Gerais', 14, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      
      doc.text('• Evolucao observada nas analises.', 14, yPos);
      yPos += 6;
      doc.text('• Padroes recorrentes nas descricoes de "Antes" e "Depois".', 14, yPos);
      yPos += 6;
      doc.text('• Frequencia dos retornos com base no campo "Avisar daqui a [X] dias".', 14, yPos);
      yPos += 15;
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
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Liberta - Relatorio gerado em ${new Date().toLocaleDateString('pt-BR')} - Pagina ${i} de ${totalPages}`,
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
