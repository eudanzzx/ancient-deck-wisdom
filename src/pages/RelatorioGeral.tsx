import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  User, 
  DollarSign,
  ArrowLeft,
  CheckCircle,
  FileDown,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import ReportManager from "@/components/ReportManager";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    getNumberOfPages: () => number;
  }
}

const RelatorioGeral = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientesUnicos, setClientesUnicos] = useState([]);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const { getAtendimentos } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAtendimentos();
  }, []);

  const loadAtendimentos = async () => {
    const data = getAtendimentos();
    setAtendimentos(data);
  };

  useEffect(() => {
    const nomes = [...new Set(atendimentos.map(item => item.nome))];
    setClientesUnicos(nomes);
  }, [atendimentos]);

  const filteredClientes = clientesUnicos.filter(cliente =>
    cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAtendimentosByClient = (cliente: string) => {
    return atendimentos.filter(a => a.nome === cliente);
  };

  const downloadClienteReport = (cliente) => {
    try {
      const doc = new jsPDF();
      const atendimentosCliente = atendimentos.filter(a => a.nome === cliente);
      
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text(`Relatorio Consolidado: ${cliente}`, 105, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      const firstAtendimento = atendimentosCliente[0];
      if (firstAtendimento.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(firstAtendimento.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (firstAtendimento.signo) {
        doc.text(`Signo: ${firstAtendimento.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Total de Atendimentos: ${atendimentosCliente.length}`, 14, yPos);
      yPos += 8;
      
      const valorTotal = atendimentosCliente.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);
      doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, 14, yPos);
      yPos += 15;
      
      const tableColumn = ["Data", "Tipo", "Valor", "Status", "Observacoes"];
      const tableRows = atendimentosCliente.map(a => [
        a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : '-',
        a.tipoServico ? a.tipoServico.replace('-', ' ') : '-',
        `R$ ${parseFloat(a.valor || "0").toFixed(2)}`,
        a.statusPagamento || 'Pendente',
        a.detalhes ? (a.detalhes.length > 30 ? a.detalhes.substring(0, 30) + '...' : a.detalhes) : '-'
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text('Detalhes dos Atendimentos', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      atendimentosCliente.forEach((a, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Atendimento ${index + 1}: ${a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : '-'}`, 14, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        if (a.detalhes) {
          const detalhesLines = doc.splitTextToSize(`Detalhes: ${a.detalhes}`, 180);
          doc.text(detalhesLines, 14, yPos);
          yPos += detalhesLines.length * 5 + 5;
        }
        
        if (a.tratamento) {
          const tratamentoLines = doc.splitTextToSize(`Tratamento: ${a.tratamento}`, 180);
          doc.text(tratamentoLines, 14, yPos);
          yPos += tratamentoLines.length * 5 + 5;
        }
        
        if (a.indicacao) {
          const indicacaoLines = doc.splitTextToSize(`Indicacao: ${a.indicacao}`, 180);
          doc.text(indicacaoLines, 14, yPos);
          yPos += indicacaoLines.length * 5 + 5;
        }
        
        if (a.atencaoFlag) {
          doc.setTextColor(220, 38, 38);
          doc.text(`ATENCAO: ${a.atencaoNota || 'Este cliente requer atencao especial'}`, 14, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 8;
        }
        
        yPos += 5;
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
      
      doc.save(`Relatorio_${cliente.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Relatorio gerado",
        description: "O relatorio consolidado foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar relatorio",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
      });
    }
  };

  const getTotalValue = () => {
    return atendimentos.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0).toFixed(2);
  };

  const getStatusCounts = () => {
    const pago = atendimentos.filter(a => a.statusPagamento === 'pago').length;
    const pendente = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
    const parcelado = atendimentos.filter(a => a.statusPagamento === 'parcelado').length;
    return { pago, pendente, parcelado };
  };

  const { pago, pendente, parcelado } = getStatusCounts();

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      <BirthdayNotifications />
      
      <main className="container mx-auto px-4 py-6 mt-20">
        <div className="mb-6 flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-[#0EA5E9] hover:bg-white/80 hover:text-[#0EA5E9] transition-all duration-200"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-[#0EA5E9]">
            Relatorios Gerais
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Recebido</p>
                  <p className="text-xl font-bold text-[#0EA5E9]">R$ {getTotalValue()}</p>
                </div>
                <div className="rounded-full p-3 bg-[#0EA5E9]/10">
                  <DollarSign className="h-6 w-6 text-[#0EA5E9]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pagos</p>
                  <p className="text-xl font-bold text-emerald-600">{pago}</p>
                </div>
                <div className="rounded-full p-3 bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Clientes</p>
                  <p className="text-xl font-bold text-[#0EA5E9]">{clientesUnicos.length}</p>
                </div>
                <div className="rounded-full p-3 bg-[#0EA5E9]/10">
                  <User className="h-6 w-6 text-[#0EA5E9]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md mb-6">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-[#0EA5E9]">Relatorios Gerais</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ReportManager variant="home" />
          </CardContent>
        </Card>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-700">Lista de Clientes</h2>
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="pr-10 bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-[#0EA5E9]">Clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredClientes.map(cliente => {
                const atendimentosCliente = getAtendimentosByClient(cliente);
                const isExpanded = expandedClient === cliente;
                
                return (
                  <div key={cliente} className="border-b border-white/10 last:border-0">
                    <div 
                      className="p-4 hover:bg-white/30 cursor-pointer flex justify-between items-center transition-all duration-200"
                      onClick={() => setExpandedClient(isExpanded ? null : cliente)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[#0EA5E9]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#0EA5E9]" />
                        )}
                        <span className="font-medium text-slate-800">{cliente}</span>
                        <span className="text-sm text-slate-500">({atendimentosCliente.length} atendimentos)</span>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-white/20">
                        <div className="p-4">
                          <h4 className="font-medium text-slate-700 mb-3">Atendimentos realizados:</h4>
                          <div className="space-y-2">
                            {atendimentosCliente.map((atendimento, index) => (
                              <div key={atendimento.id} className="bg-white/40 border border-white/20 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-slate-700">
                                      Atendimento {index + 1}
                                    </span>
                                    <span className="text-sm text-slate-600">
                                      Data: {atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A'}
                                    </span>
                                    <span className="text-sm text-slate-600">
                                      Servico: {atendimento.tipoServico ? atendimento.tipoServico.replace('-', ' ') : 'N/A'}
                                    </span>
                                    <span className="text-sm text-emerald-600 font-medium">
                                      Valor: R$ {parseFloat(atendimento.valor || "0").toFixed(2)}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                                      atendimento.statusPagamento === 'pago'
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : atendimento.statusPagamento === 'parcelado'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {atendimento.statusPagamento ? 
                                        atendimento.statusPagamento.charAt(0).toUpperCase() + atendimento.statusPagamento.slice(1) : 
                                        'Pendente'}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-all duration-200"
                                    onClick={() => navigate(`/relatorio-individual/${atendimento.id}`)}
                                  >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredClientes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-600">Nenhum cliente encontrado</h3>
                  <p className="text-slate-500 mt-2">Registre atendimentos para visualizar os relatorios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioGeral;
