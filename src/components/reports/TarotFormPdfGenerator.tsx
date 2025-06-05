
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TarotFormPdfGeneratorProps {
  cliente: {
    nome: string;
    analises: any[];
  };
  className?: string;
}

const TarotFormPdfGenerator: React.FC<TarotFormPdfGeneratorProps> = ({ cliente, className }) => {
  const formatarDataSegura = (data: string) => {
    if (!data || data.trim() === '') {
      return '_____/_____/_____';
    }
    
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        return '_____/_____/_____';
      }
      return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return '_____/_____/_____';
    }
  };

  const gerarFormularioTarot = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 25;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(103, 49, 147);
      doc.text('FORMULÁRIO DE ANÁLISE - TAROT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      doc.setFontSize(12);
      doc.setTextColor(120, 120, 120);
      doc.text('Documento confidencial - Uso exclusivo do cliente', pageWidth / 2, yPos, { align: 'center' });
      yPos += 25;

      const ultimaAnalise = cliente.analises[cliente.analises.length - 1];

      // Informações do Cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('INFORMAÇÕES DO CLIENTE', margin, yPos);
      yPos += 15;

      doc.setFontSize(11);

      // Nome e Data de Nascimento com espaçamento fixo
      doc.setFont(undefined, 'bold');
      doc.text('Nome do Cliente:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(cliente.nome || '', margin + 45, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Data de Nascimento:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      const dataNasc = ultimaAnalise?.dataNascimento ? formatarDataSegura(ultimaAnalise.dataNascimento) : '_____/_____/_____';
      doc.text(dataNasc, margin + 170, yPos);
      yPos += 12;

      // Signo e Telefone
      doc.setFont(undefined, 'bold');
      doc.text('Signo:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimaAnalise?.signo || '', margin + 45, yPos);

      if (ultimaAnalise?.telefone) {
        doc.setFont(undefined, 'bold');
        doc.text('Telefone:', margin + 110, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(ultimaAnalise.telefone, margin + 170, yPos);
      }
      yPos += 20;

      // Dados da Análise
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('DADOS DA ANÁLISE', margin, yPos);
      yPos += 15;

      doc.setFontSize(11);

      // Data da Análise e Valor
      doc.setFont(undefined, 'bold');
      doc.text('Data da Análise:', margin, yPos);
      doc.setFont(undefined, 'normal');
      const dataAnalise = ultimaAnalise?.dataInicio ? formatarDataSegura(ultimaAnalise.dataInicio) : '_____/_____/_____';
      doc.text(dataAnalise, margin + 45, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Valor:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`R$ ${parseFloat(ultimaAnalise?.preco || "150").toFixed(2)}`, margin + 170, yPos);
      yPos += 12;

      // Status
      doc.setFont(undefined, 'bold');
      doc.text('Status:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimaAnalise?.finalizado ? 'Finalizada' : 'Em andamento', margin + 45, yPos);
      yPos += 20;

      // PLANO CONTRATADO - Nova estrutura
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('PLANO CONTRATADO', margin, yPos);
      yPos += 15;

      doc.setFontSize(11);

      // Tipo de Plano - sempre PLANO SEMANAL
      doc.setFont(undefined, 'bold');
      doc.text('Tipo de Plano:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text('PLANO SEMANAL', margin + 45, yPos);
      yPos += 12;

      // Duração
      doc.setFont(undefined, 'bold');
      doc.text('Duração:', margin, yPos);
      doc.setFont(undefined, 'normal');
      const semanas = ultimaAnalise?.semanas || '4';
      doc.text(`${semanas} semanas`, margin + 45, yPos);
      yPos += 12;

      // Valor Total
      doc.setFont(undefined, 'bold');
      doc.text('Valor Total:', margin, yPos);
      doc.setFont(undefined, 'normal');
      const valorSemanal = parseFloat(ultimaAnalise?.valorSemanal || "40");
      const totalSemanas = parseInt(semanas);
      const valorTotal = valorSemanal * totalSemanas;
      doc.text(`R$ ${valorTotal.toFixed(2)}`, margin + 45, yPos);
      yPos += 12;

      // Valor por Semana
      doc.setFont(undefined, 'bold');
      doc.text('Valor por Semana:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`R$ ${valorSemanal.toFixed(2)}`, margin + 45, yPos);
      yPos += 20;

      // ANÁLISE - ANTES
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('ANÁLISE – ANTES', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Descreva a situação antes do tratamento:', margin, yPos);
      yPos += 8;

      if (ultimaAnalise?.pergunta) {
        const perguntaLines = doc.splitTextToSize(ultimaAnalise.pergunta, pageWidth - 2 * margin);
        doc.text(perguntaLines, margin, yPos);
        yPos += perguntaLines.length * 5 + 15;
      } else {
        yPos += 20;
      }

      // ANÁLISE - DEPOIS
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('ANÁLISE – DEPOIS', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Descreva os resultados após o tratamento:', margin, yPos);
      yPos += 8;

      if (ultimaAnalise?.leitura) {
        const leituraLines = doc.splitTextToSize(ultimaAnalise.leitura, pageWidth - 2 * margin);
        doc.text(leituraLines, margin, yPos);
        yPos += leituraLines.length * 5 + 15;
      } else {
        yPos += 20;
      }

      // TRATAMENTO
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('TRATAMENTO', margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.text('Contador 1:', margin, yPos);
      yPos += 8;

      doc.text('Descrição do tratamento:', margin, yPos);
      yPos += 6;

      if (ultimaAnalise?.orientacao) {
        const orientacaoLines = doc.splitTextToSize(ultimaAnalise.orientacao, pageWidth - 2 * margin);
        doc.text(orientacaoLines, margin, yPos);
        yPos += orientacaoLines.length * 5 + 10;
      } else {
        yPos += 15;
      }

      doc.text('Avisar daqui a:', margin, yPos);
      doc.text('[7 dias / próxima sessão / conclusão]', margin + 45, yPos);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Libertá - Formulário gerado em ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      doc.save(`formulario-tarot-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success(`Formulário de Tarot para ${cliente.nome} gerado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao gerar formulário de tarot:', error);
      toast.error('Erro ao gerar formulário. Verifique os dados do cliente.');
    }
  };

  return (
    <Button
      variant="outline"
      className={`border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 ${className}`}
      onClick={gerarFormularioTarot}
    >
      <FileText className="h-4 w-4 mr-2" />
      Formulário Tarot
    </Button>
  );
};

export default TarotFormPdfGenerator;
