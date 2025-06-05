
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientFormPdfGeneratorProps {
  cliente: {
    nome: string;
    atendimentos: any[];
  };
  className?: string;
}

const ClientFormPdfGenerator: React.FC<ClientFormPdfGeneratorProps> = ({ cliente, className }) => {
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

  const gerarFormularioCliente = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 25;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text('FORMULÁRIO DE ATENDIMENTO', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      doc.setFontSize(12);
      doc.setTextColor(120, 120, 120);
      doc.text('Documento confidencial - Uso exclusivo do cliente', pageWidth / 2, yPos, { align: 'center' });
      yPos += 25;

      // Informações do Cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('INFORMAÇÕES DO CLIENTE', margin, yPos);
      yPos += 15;

      doc.setFontSize(11);
      const ultimoAtendimento = cliente.atendimentos[cliente.atendimentos.length - 1];

      // Primeira linha - Nome e Data de Nascimento
      doc.setFont(undefined, 'bold');
      doc.text('Nome do Cliente:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(cliente.nome || '', margin + 40, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Data de Nascimento:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      const dataNasc = ultimoAtendimento?.dataNascimento ? formatarDataSegura(ultimoAtendimento.dataNascimento) : '_____/_____/_____';
      doc.text(dataNasc, margin + 155, yPos);
      yPos += 12;

      // Segunda linha - Signo
      doc.setFont(undefined, 'bold');
      doc.text('Signo:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimoAtendimento?.signo || '', margin + 40, yPos);
      yPos += 20;

      // Dados do Atendimento
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('DADOS DO ATENDIMENTO', margin, yPos);
      yPos += 15;

      doc.setFontSize(11);

      // Primeira linha - Tipo de Serviço e Data do Atendimento
      doc.setFont(undefined, 'bold');
      doc.text('Tipo de Serviço:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimoAtendimento?.tipoServico || '', margin + 40, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Data do Atendimento:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      const dataAtend = ultimoAtendimento?.dataAtendimento ? formatarDataSegura(ultimoAtendimento.dataAtendimento) : '_____/_____/_____';
      doc.text(dataAtend, margin + 155, yPos);
      yPos += 12;

      // Segunda linha - Valor e Status
      doc.setFont(undefined, 'bold');
      doc.text('Valor Cobrado:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`R$ ${parseFloat(ultimoAtendimento?.valor || "0").toFixed(2)}`, margin + 40, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Status de Pagamento:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimoAtendimento?.statusPagamento || '', margin + 155, yPos);
      yPos += 12;

      // Terceira linha - Destino e Ano
      doc.setFont(undefined, 'bold');
      doc.text('Destino:', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimoAtendimento?.destino || '', margin + 40, yPos);

      doc.setFont(undefined, 'bold');
      doc.text('Ano:', margin + 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ultimoAtendimento?.ano || '', margin + 155, yPos);
      yPos += 18;

      // Plano Contratado - Corrigido para mostrar valores
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('PLANO CONTRATADO', margin, yPos);
      yPos += 12;

      doc.setFontSize(11);

      const hasPlanoMensal = ultimoAtendimento?.planoAtivo;
      const hasSemanal = ultimoAtendimento?.semanalAtivo;

      if (hasPlanoMensal || hasSemanal) {
        // Primeira linha - Plano Selecionado e Duração Contratada
        doc.setFont(undefined, 'bold');
        doc.text('Plano Selecionado:', margin, yPos);
        doc.setFont(undefined, 'normal');
        const tipoPlano = hasPlanoMensal ? 'Plano Mensal' : 'Plano Semanal';
        doc.text(tipoPlano, margin + 45, yPos);

        doc.setFont(undefined, 'bold');
        doc.text('Duração Contratada:', margin + 110, yPos);
        doc.setFont(undefined, 'normal');
        const duracao = hasPlanoMensal 
          ? `${ultimoAtendimento?.meses || 0} meses`
          : `${ultimoAtendimento?.semanas || 0} semanas`;
        doc.text(duracao, margin + 165, yPos);
        yPos += 10;

        // Segunda linha - Valor Total e Valor por Período
        const valorPorPeriodo = hasPlanoMensal 
          ? parseFloat(ultimoAtendimento?.valorMensal || "0")
          : parseFloat(ultimoAtendimento?.valorSemanal || "0");
        
        const durPeriodos = hasPlanoMensal 
          ? parseInt(ultimoAtendimento?.meses || "0")
          : parseInt(ultimoAtendimento?.semanas || "0");
        
        const valorTotal = valorPorPeriodo * durPeriodos;

        doc.setFont(undefined, 'bold');
        doc.text('Valor Total:', margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`R$ ${valorTotal.toFixed(2)}`, margin + 45, yPos);

        doc.setFont(undefined, 'bold');
        const labelPeriodo = hasPlanoMensal ? 'Valor por Mês:' : 'Valor por Semana:';
        doc.text(labelPeriodo, margin + 110, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`R$ ${valorPorPeriodo.toFixed(2)}`, margin + 165, yPos);
        yPos += 12;
      } else {
        doc.setFont(undefined, 'normal');
        doc.text('Nenhum plano contratado', margin, yPos);
        yPos += 12;
      }

      // Detalhes da Sessão
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('DETALHES DA SESSÃO', margin, yPos);
      yPos += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Revelações, conselhos e orientações:', margin, yPos);
      yPos += 6;

      // Caixa para detalhes
      const detalhesHeight = 18;
      if (ultimoAtendimento?.detalhes) {
        const detalhesLines = doc.splitTextToSize(ultimoAtendimento.detalhes, pageWidth - 2 * margin - 4);
        doc.text(detalhesLines.slice(0, 2), margin + 2, yPos + 3);
      }
      yPos += detalhesHeight + 3;

      // Tratamento
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('TRATAMENTO', margin, yPos);
      yPos += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Observações sobre o tratamento:', margin, yPos);
      yPos += 6;

      // Caixa para tratamento
      const tratamentoHeight = 15;
      if (ultimoAtendimento?.tratamento) {
        const tratamentoLines = doc.splitTextToSize(ultimoAtendimento.tratamento, pageWidth - 2 * margin - 4);
        doc.text(tratamentoLines.slice(0, 2), margin + 2, yPos + 3);
      }
      yPos += tratamentoHeight + 3;

      // Indicação
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('INDICAÇÃO', margin, yPos);
      yPos += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text('Informações adicionais e indicações:', margin, yPos);
      yPos += 6;

      // Caixa para indicação
      const indicacaoHeight = 15;
      if (ultimoAtendimento?.indicacao) {
        const indicacaoLines = doc.splitTextToSize(ultimoAtendimento.indicacao, pageWidth - 2 * margin - 4);
        doc.text(indicacaoLines.slice(0, 2), margin + 2, yPos + 3);
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

      doc.save(`formulario-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success(`Formulário de ${cliente.nome} gerado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao gerar formulário:', error);
      toast.error('Erro ao gerar formulário. Verifique os dados do cliente.');
    }
  };

  return (
    <Button
      variant="outline"
      className={`border-green-600/30 text-green-600 hover:bg-green-600/10 ${className}`}
      onClick={gerarFormularioCliente}
    >
      <FileText className="h-4 w-4 mr-2" />
      Formulário
    </Button>
  );
};

export default ClientFormPdfGenerator;
