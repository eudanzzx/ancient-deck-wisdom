
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
      yPos += 20;

      // Linha decorativa
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Informações do Cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('INFORMAÇÕES DO CLIENTE', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);

      // Nome
      doc.text('Nome do Cliente:', margin, yPos);
      doc.setDrawColor(150, 150, 150);
      doc.line(margin + 35, yPos + 2, pageWidth - margin, yPos + 2);
      doc.text(cliente.nome || '', margin + 37, yPos);
      yPos += 12;

      // Data de Nascimento
      doc.text('Data de Nascimento:', margin, yPos);
      doc.line(margin + 45, yPos + 2, margin + 85, yPos + 2);
      const ultimoAtendimento = cliente.atendimentos[cliente.atendimentos.length - 1];
      doc.text(ultimoAtendimento?.dataNascimento ? formatarDataSegura(ultimoAtendimento.dataNascimento) : '_____/_____/_____', margin + 47, yPos);
      
      // Signo
      doc.text('Signo:', margin + 100, yPos);
      doc.line(margin + 115, yPos + 2, pageWidth - margin, yPos + 2);
      doc.text(ultimoAtendimento?.signo || '', margin + 117, yPos);
      yPos += 20;

      // Dados do Atendimento
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('DADOS DO ATENDIMENTO', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);

      // Tipo de Serviço
      doc.text('Tipo de Serviço:', margin, yPos);
      doc.line(margin + 35, yPos + 2, margin + 100, yPos + 2);
      doc.text(ultimoAtendimento?.tipoServico || '', margin + 37, yPos);

      // Data do Atendimento
      doc.text('Data do Atendimento:', margin + 110, yPos);
      doc.line(margin + 145, yPos + 2, pageWidth - margin, yPos + 2);
      doc.text(ultimoAtendimento?.dataAtendimento ? formatarDataSegura(ultimoAtendimento.dataAtendimento) : '_____/_____/_____', margin + 147, yPos);
      yPos += 12;

      // Valor e Status
      doc.text('Valor Cobrado (R$):', margin, yPos);
      doc.line(margin + 42, yPos + 2, margin + 85, yPos + 2);
      doc.text(`R$ ${parseFloat(ultimoAtendimento?.valor || "0").toFixed(2)}`, margin + 44, yPos);

      doc.text('Status de Pagamento:', margin + 100, yPos);
      doc.line(margin + 135, yPos + 2, pageWidth - margin, yPos + 2);
      doc.text(ultimoAtendimento?.statusPagamento || '', margin + 137, yPos);
      yPos += 12;

      // Destino e Ano
      doc.text('Destino:', margin, yPos);
      doc.line(margin + 20, yPos + 2, margin + 85, yPos + 2);
      doc.text(ultimoAtendimento?.destino || '', margin + 22, yPos);

      doc.text('Ano:', margin + 100, yPos);
      doc.line(margin + 115, yPos + 2, pageWidth - margin, yPos + 2);
      doc.text(ultimoAtendimento?.ano || '', margin + 117, yPos);
      yPos += 20;

      // Plano Contratado
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('PLANO CONTRATADO', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);

      // Checkboxes para planos
      const hasPlanoMensal = ultimoAtendimento?.planoAtivo;
      const hasSemanal = ultimoAtendimento?.semanalAtivo;

      // Plano Mensal
      doc.rect(margin, yPos - 3, 4, 4);
      if (hasPlanoMensal) {
        doc.text('✓', margin + 1, yPos);
      }
      doc.text('PLANO MENSAL', margin + 8, yPos);

      // Plano Semanal
      doc.rect(margin + 60, yPos - 3, 4, 4);
      if (hasSemanal) {
        doc.text('✓', margin + 61, yPos);
      }
      doc.text('PLANO SEMANAL', margin + 68, yPos);
      yPos += 20;

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
      doc.setDrawColor(150, 150, 150);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25);
      
      // Texto dos detalhes se existir
      if (ultimoAtendimento?.detalhes) {
        const detalhesLines = doc.splitTextToSize(ultimoAtendimento.detalhes, pageWidth - 2 * margin - 4);
        doc.text(detalhesLines.slice(0, 3), margin + 2, yPos + 5);
      }
      yPos += 30;

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
      doc.rect(margin, yPos, pageWidth - 2 * margin, 20);
      
      if (ultimoAtendimento?.tratamento) {
        const tratamentoLines = doc.splitTextToSize(ultimoAtendimento.tratamento, pageWidth - 2 * margin - 4);
        doc.text(tratamentoLines.slice(0, 2), margin + 2, yPos + 5);
      }
      yPos += 25;

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
      doc.rect(margin, yPos, pageWidth - 2 * margin, 20);
      
      if (ultimoAtendimento?.indicacao) {
        const indicacaoLines = doc.splitTextToSize(ultimoAtendimento.indicacao, pageWidth - 2 * margin - 4);
        doc.text(indicacaoLines.slice(0, 2), margin + 2, yPos + 5);
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
