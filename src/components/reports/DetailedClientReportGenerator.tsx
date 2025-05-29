import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface DetailedClientReportGeneratorProps {
  atendimentos: any[];
  clients: Array<{ name: string; count: number }>;
  variant?: 'home' | 'tarot';
}

const DetailedClientReportGenerator: React.FC<DetailedClientReportGeneratorProps> = ({ 
  atendimentos, 
  clients,
  variant = 'home'
}) => {
  const downloadAllDetailedReports = () => {
    try {
      if (variant === 'tarot') {
        // Para tarot, gera um relatório geral consolidado
        generateTarotGeneralReport();
      } else {
        // Para home, gera relatórios individuais para cada cliente seguindo o formato especificado
        clients.forEach((client, index) => {
          setTimeout(() => {
            downloadDetailedClientReport(client.name);
          }, index * 1000);
        });
        
        toast.success(`Gerando ${clients.length} relatórios individuais detalhados...`);
      }
    } catch (error) {
      console.error("Erro ao gerar relatórios:", error);
      toast.error("Erro ao gerar relatórios");
    }
  };

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
      
      // Título principal
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`Relatório Detalhado – Cliente: ${clientName}`, 14, 20);
      
      // Total de atendimentos
      doc.setFontSize(12);
      doc.text(`Total de Atendimentos: ${clientConsultations.length}`, 14, 35);
      
      let yPos = 50;
      
      // Separador inicial
      doc.text('==================================================', 14, yPos);
      yPos += 15;
      
      clientConsultations.forEach((consultation, index) => {
        // Verificar se precisa de nova página
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        // Número do atendimento
        doc.setFont(undefined, 'bold');
        doc.text(`Atendimento nº ${index + 1}`, 14, yPos);
        yPos += 10;
        
        // Data do atendimento
        doc.setFont(undefined, 'normal');
        const dataAtendimento = consultation.dataAtendimento ? 
          new Date(consultation.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A';
        doc.text(`Data do Atendimento: ${dataAtendimento}`, 14, yPos);
        yPos += 10;
        
        // Nome do cliente
        doc.text(`Nome do Cliente: ${clientName}`, 14, yPos);
        yPos += 8;
        
        // Data de nascimento
        const dataNascimento = consultation.dataNascimento ? 
          new Date(consultation.dataNascimento).toLocaleDateString('pt-BR') : 'N/A';
        doc.text(`Data de Nascimento: ${dataNascimento}`, 14, yPos);
        yPos += 8;
        
        // Signo
        doc.text(`Signo: ${consultation.signo || 'N/A'}`, 14, yPos);
        yPos += 8;
        
        // Tipo de serviço
        const tipoServico = consultation.tipoServico ? 
          consultation.tipoServico.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
        doc.text(`Tipo de Serviço: ${tipoServico}`, 14, yPos);
        yPos += 8;
        
        // Valor cobrado
        const valor = parseFloat(consultation.valor || "0").toFixed(2);
        doc.text(`Valor Cobrado: R$ ${valor}`, 14, yPos);
        yPos += 8;
        
        // Status de pagamento
        const statusPagamento = consultation.statusPagamento ? 
          consultation.statusPagamento.charAt(0).toUpperCase() + consultation.statusPagamento.slice(1) : 'N/A';
        doc.text(`Status de Pagamento: ${statusPagamento}`, 14, yPos);
        yPos += 8;
        
        // Destino
        doc.text(`Destino: ${consultation.destino || 'N/A'}`, 14, yPos);
        yPos += 8;
        
        // Ano
        doc.text(`Ano: ${consultation.ano || 'N/A'}`, 14, yPos);
        yPos += 15;
        
        // Pontos de Atenção
        doc.setFont(undefined, 'bold');
        doc.text('Pontos de Atenção', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        if (consultation.atencaoFlag && consultation.atencaoNota) {
          const atencaoLines = doc.splitTextToSize(consultation.atencaoNota, 180);
          doc.text(atencaoLines, 14, yPos);
          yPos += atencaoLines.length * 6;
        } else {
          doc.text('Nenhum ponto de atenção registrado', 14, yPos);
          yPos += 6;
        }
        yPos += 10;
        
        // Detalhes da Sessão
        doc.setFont(undefined, 'bold');
        doc.text('Detalhes da Sessão', 14, yPos);
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
        
        // Tratamento
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
        
        // Indicação
        doc.setFont(undefined, 'bold');
        doc.text('Indicação', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        if (consultation.indicacao) {
          const indicacaoLines = doc.splitTextToSize(consultation.indicacao, 180);
          doc.text(indicacaoLines, 14, yPos);
          yPos += indicacaoLines.length * 6;
        } else {
          doc.text('Nenhuma indicação registrada', 14, yPos);
          yPos += 6;
        }
        yPos += 15;
        
        // Separador entre atendimentos
        doc.text('==================================================', 14, yPos);
        yPos += 15;
      });
      
      // Rodapé
      addFooter(doc);
      
      // Salvar com o nome correto
      const fileName = `Relatorio_Detalhado_${clientName.replace(/ /g, '_')}.pdf`;
      doc.save(fileName);
      
      toast.success(`Relatório detalhado de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const generateTarotGeneralReport = () => {
    const doc = new jsPDF();
    
    // Relatório Geral do Cliente – Histórico Consolidado
    doc.setFontSize(18);
    doc.setTextColor(124, 100, 244);
    doc.text('🔮 Relatório Geral do Cliente – Histórico Consolidado', 105, 15, { align: 'center' });
    
    let yPos = 35;
    
    // Agrupa análises por cliente
    const clientsMap = new Map();
    atendimentos.forEach(analise => {
      const clientName = analise.nomeCliente;
      if (!clientsMap.has(clientName)) {
        clientsMap.set(clientName, []);
      }
      clientsMap.get(clientName).push(analise);
    });

    // Para cada cliente, gera o relatório
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
        doc.text(`Data da Primeira Análise: ${new Date(firstConsultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (lastConsultation.dataInicio) {
        doc.text(`Data da Última Análise: ${new Date(lastConsultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Total de Análises Realizadas: ${consultations.length}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor Total Investido: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Média por Análise: R$ ${avgValue.toFixed(2)}`, 14, yPos);
      yPos += 15;
      
      doc.setFont(undefined, 'normal');
      
      // Resumo das Análises
      doc.setFont(undefined, 'bold');
      doc.text('Resumo das Análises', 14, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      
      consultations.forEach((consultation, index) => {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`Análise ${index + 1}:`, 14, yPos);
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
      yPos += 15;
    });
    
    addFooter(doc);
    
    const fileName = `Relatorio_Geral_Consolidado_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
    toast.success("Relatório geral consolidado gerado com sucesso!");
  };

  const addFooter = (doc) => {
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
  };

  const buttonColor = variant === 'tarot' ? 
    'bg-[#673193] hover:bg-[#673193]/90 text-white' : 
    'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white';

  return (
    <Button
      onClick={downloadAllDetailedReports}
      className={buttonColor}
    >
      <Download className="h-4 w-4 mr-2" />
      Todos Detalhados
    </Button>
  );
};

export default DetailedClientReportGenerator;
