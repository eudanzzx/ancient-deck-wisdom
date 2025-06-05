
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
      yPos += 20;

      const ultimaAnalise = cliente.analises[cliente.analises.length - 1];

      // Informações do Cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('INFORMAÇÕES DO CLIENTE', margin, yPos);
      yPos += 12;

      doc.setFontSize(11);

      // Nome e Data de Nascimento
      doc.setFont(undefined, 'bold');
      doc.text('Nome do Cliente:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(cliente.nome || '', margin + 40, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Data de Nascimento:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      const dataNasc = ultimaAnalise?.dataNascimento ? formatarDataSegura(ultimaAnalise.dataNascimento) : '_____/_____/_____';
      doc.text(dataNasc, margin + 155, yPos);
      yPos += 10;

      // Signo e Telefone
      doc.setFont(undefined, 'bold');
      doc.text('Signo:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimaAnalise?.signo || '', margin + 40, yPos);

      if (ultimaAnalise?.telefone) {
        doc.setFont(undefined, 'bold');
        doc.text('Telefone:', margin + 110, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(ultimaAnalise.telefone, margin + 155, yPos);
      }
      yPos += 15;

      // Dados da Análise
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('DADOS DA ANÁLISE', margin, yPos);
      yPos += 12;

      doc.setFontSize(11);

      // Data da Análise e Valor
      doc.setFont(undefined, 'bold');
      doc.text('Data da Análise:', margin, yPos);
      doc.setFont(undefined, 'normal');
      const dataAnalise = ultimaAnalise?.dataInicio ? formatarDataSegura(ultimaAnalise.dataInicio) : '_____/_____/_____';
      doc.text(dataAnalise, margin + 40, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Valor:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`R$ ${parseFloat(ultimaAnalise?.preco || "150").toFixed(2)}`, margin + 155, yPos);
      yPos += 10;

      // Status
      doc.setFont(undefined, 'bold');
      doc.text('Status:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimaAnalise?.finalizado ? 'Finalizada' : 'Em andamento', margin + 40, yPos);
      yPos += 15;

      // Pergunta
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('PERGUNTA', margin, yPos);
      yPos += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Questionamento apresentado:', margin, yPos);
      yPos += 6;

      const perguntaHeight = 20;
      if (ultimaAnalise?.pergunta) {
        const perguntaLines = doc.splitTextToSize(ultimaAnalise.pergunta, pageWidth - 2 * margin - 4);
        doc.text(perguntaLines.slice(0, 3), margin + 2, yPos + 3);
      }
      yPos += perguntaHeight + 3;

      // Leitura
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('LEITURA', margin, yPos);
      yPos += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Interpretação das cartas:', margin, yPos);
      yPos += 6;

      const leituraHeight = 35;
      if (ultimaAnalise?.leitura) {
        const leituraLines = doc.splitTextToSize(ultimaAnalise.leitura, pageWidth - 2 * margin - 4);
        doc.text(leituraLines.slice(0, 5), margin + 2, yPos + 3);
      }
      yPos += leituraHeight + 3;

      // Orientação
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('ORIENTAÇÃO', margin, yPos);
      yPos += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Conselhos e direcionamentos:', margin, yPos);
      yPos += 6;

      const orientacaoHeight = 30;
      if (ultimaAnalise?.orientacao) {
        const orientacaoLines = doc.splitTextToSize(ultimaAnalise.orientacao, pageWidth - 2 * margin - 4);
        doc.text(orientacaoLines.slice(0, 4), margin + 2, yPos + 3);
      }

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
