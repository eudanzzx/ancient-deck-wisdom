import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  ArrowLeft,
  Clock,
  Tag,
  MessageSquare,
  Pencil,
  FileDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Separator } from '@/components/ui/separator';
import { jsPDF } from 'jspdf';

const RelatorioIndividual = () => {
  const navigate = useNavigate();
  const { id } = useParams<{id: string}>();
  const { getAtendimentos } = useUserDataService();
  const [atendimento, setAtendimento] = useState<any>(null);
  const [atendimentosCliente, setAtendimentosCliente] = useState<any[]>([]);
  
  useEffect(() => {
    const loadedAtendimentos = getAtendimentos();
    const found = loadedAtendimentos.find(item => item.id === id);
    
    if (found) {
      setAtendimento(found);
      
      const mesmoCliente = loadedAtendimentos.filter(
        item => item.nome === found.nome && item.id !== found.id
      );
      setAtendimentosCliente(mesmoCliente);
    }
  }, [id, getAtendimentos]);
  
  const handleDownloadReport = () => {
    if (!atendimento) return;
    
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text('🔹 Relatório Individual do Cliente', 105, 15, { align: 'center' });
      
      let yPos = 30;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      doc.setFont(undefined, 'bold');
      doc.text(`Nome do Cliente: ${atendimento.nome}`, 14, yPos);
      yPos += 8;
      
      if (atendimento.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(atendimento.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (atendimento.signo) {
        doc.text(`Signo: ${atendimento.signo}`, 14, yPos);
        yPos += 8;
      }
      
      if (atendimento.email) {
        doc.text(`Email: ${atendimento.email}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Total de 1 Atendimento`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor Total Gasto: R$ ${parseFloat(atendimento.valor || 0).toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Média por Atendimento: R$ ${parseFloat(atendimento.valor || 0).toFixed(2)}`, 14, yPos);
      yPos += 10;
      
      doc.setFont(undefined, 'normal');
      
      const appointmentNumber = `1️⃣`;
      const dataFormatada = atendimento.dataAtendimento ? 
        new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A';
      const servicoFormatado = atendimento.tipoServico ? 
        atendimento.tipoServico.replace('-', ' ').replace('tarot', 'Tarot').replace('terapia', 'Terapia').replace('mesa radionica', 'Mesa Radiônica') :
        'N/A';
      const statusFormatado = atendimento.statusPagamento || 'Não especificado';
      
      doc.setFont(undefined, 'bold');
      doc.text(`${appointmentNumber} Data: ${dataFormatada} — 💼 Serviço: ${servicoFormatado} — 💳 Status: ${statusFormatado}`, 14, yPos);
      yPos += 6;
      
      doc.setFont(undefined, 'normal');
      
      if (atendimento.destino) {
        doc.text(`Destino: ${atendimento.destino}`, 14, yPos);
        yPos += 5;
      }
      
      if (atendimento.ano) {
        doc.text(`Ano: ${atendimento.ano}`, 14, yPos);
        yPos += 5;
      }
      
      if (atendimento.detalhes) {
        const detalhesLines = doc.splitTextToSize(`Detalhes da Sessão: ${atendimento.detalhes}`, 180);
        doc.text(detalhesLines, 14, yPos);
        yPos += detalhesLines.length * 5;
      }
      
      if (atendimento.tratamento) {
        const tratamentoLines = doc.splitTextToSize(`Tratamento: ${atendimento.tratamento}`, 180);
        doc.text(tratamentoLines, 14, yPos);
        yPos += tratamentoLines.length * 5;
      }
      
      if (atendimento.indicacao) {
        const indicacaoLines = doc.splitTextToSize(`Indicação: ${atendimento.indicacao}`, 180);
        doc.text(indicacaoLines, 14, yPos);
        yPos += indicacaoLines.length * 5;
      }
      
      if (atendimento.atencaoFlag) {
        doc.setTextColor(220, 38, 38);
        doc.text(`ATENÇÃO: ${atendimento.atencaoNota || 'Este cliente requer atenção especial'}`, 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;
      }
      
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
      
      doc.save(`Relatorio_Individual_${atendimento.nome.replace(/ /g, '_')}_${dataFormatada.replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório gerado", {
        description: "O relatório desta consulta foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao baixar relatório", {
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
      });
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-emerald-500';
      case 'pendente':
        return 'bg-amber-500';
      case 'parcelado':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  if (!atendimento) {
    return (
      <div className="min-h-screen bg-[#F1F7FF] flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">Atendimento não encontrado</h3>
            <p className="text-slate-500 mt-2">O atendimento solicitado não existe ou foi removido</p>
            <Button 
              className="mt-6 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
              onClick={() => navigate('/relatorio-geral')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const formattedDate = atendimento.dataAtendimento 
    ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')
    : '-';
    
  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-[#0EA5E9] hover:bg-white/80 hover:text-[#0EA5E9] transition-all duration-200"
              onClick={() => navigate('/relatorio-geral')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-[#0EA5E9]">Detalhes do Atendimento</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-all duration-200"
              onClick={() => navigate(`/editar-atendimento/${atendimento.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button 
              onClick={handleDownloadReport}
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
            >
              <FileDown className="mr-2 h-4 w-4" /> Baixar PDF
            </Button>
          </div>
        </div>
        
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Nome do Cliente</span>
                <span className="text-lg font-medium text-slate-800">{atendimento.nome}</span>
              </div>
              {atendimento.dataNascimento && (
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Data de Nascimento</span>
                  <span className="text-lg font-medium text-slate-800">
                    {new Date(atendimento.dataNascimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {atendimento.signo && (
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Signo</span>
                  <span className="text-lg font-medium text-slate-800">{atendimento.signo}</span>
                </div>
              )}
              {atendimento.email && (
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Email</span>
                  <span className="text-lg font-medium text-slate-800">{atendimento.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalhes do Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Data do Atendimento</span>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-[#0EA5E9]" />
                  <span className="text-lg font-medium text-slate-800">{formattedDate}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Tipo de Serviço</span>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="h-4 w-4 text-[#0EA5E9]" />
                  <span className="text-lg font-medium text-slate-800 capitalize">
                    {atendimento.tipoServico.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Valor Cobrado</span>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-lg font-medium text-emerald-600">
                    R$ {parseFloat(atendimento.valor || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Status de Pagamento</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-3 w-3 rounded-full ${getStatusClass(atendimento.statusPagamento || 'pendente')}`}></div>
                  <span className="text-lg font-medium text-slate-800 capitalize">{atendimento.statusPagamento || 'Pendente'}</span>
                </div>
              </div>
            </div>
            
            {atendimento.atencaoFlag && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-md">
                <h4 className="font-semibold text-rose-600 flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                  Atenção Especial
                </h4>
                <p className="text-rose-700">
                  Este cliente requer atenção especial
                </p>
              </div>
            )}
            
            {atendimento.detalhes && (
              <div className="mb-6">
                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#0EA5E9]" />
                  Detalhes da Sessão
                </h4>
                <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
                  <p className="text-slate-700">{atendimento.detalhes}</p>
                </div>
              </div>
            )}
            
            {atendimento.tratamento && (
              <div className="mb-6">
                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#0EA5E9]" />
                  Tratamento
                </h4>
                <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
                  <p className="text-slate-700">{atendimento.tratamento}</p>
                </div>
              </div>
            )}
            
            {atendimento.indicacao && (
              <div className="mb-6">
                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#0EA5E9]" />
                  Indicação
                </h4>
                <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
                  <p className="text-slate-700">{atendimento.indicacao}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-[#0EA5E9]">Histórico de Atendimentos do Cliente</CardTitle>
            <CardDescription className="text-slate-600">Outros atendimentos realizados para {atendimento.nome}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {atendimentosCliente.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-4 text-[#0EA5E9]">Data</th>
                      <th className="text-left py-2 px-4 text-[#0EA5E9]">Serviço</th>
                      <th className="text-right py-2 px-4 text-[#0EA5E9]">Valor</th>
                      <th className="text-center py-2 px-4 text-[#0EA5E9]">Status</th>
                      <th className="text-center py-2 px-4 text-[#0EA5E9]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atendimentosCliente.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-white/50">
                        <td className="py-3 px-4 text-slate-700">
                          {item.dataAtendimento ? new Date(item.dataAtendimento).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-700">{item.tipoServico.replace('-', ' ')}</td>
                        <td className="py-3 px-4 text-right text-slate-700">R$ {parseFloat(item.valor || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium 
                            ${item.statusPagamento === 'pago' ? 'bg-emerald-100 text-emerald-700' : 
                              item.statusPagamento === 'parcelado' ? 'bg-rose-100 text-rose-700' : 
                              'bg-amber-100 text-amber-700'}`}>
                            {(item.statusPagamento || 'pendente').charAt(0).toUpperCase() + 
                             (item.statusPagamento || 'pendente').slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9]"
                              onClick={() => navigate(`/relatorio-individual/${item.id}`)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9]"
                              onClick={() => navigate(`/editar-atendimento/${item.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">Não há outros atendimentos para este cliente.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-all duration-200"
                  onClick={() => navigate('/novo-atendimento')}
                >
                  Registrar Novo Atendimento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioIndividual;
