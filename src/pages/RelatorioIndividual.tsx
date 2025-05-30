
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  Users, 
  Activity, 
  FileText,
  ChevronDown,
  ChevronRight,
  User
} from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const RelatorioIndividual = () => {
  const { getAtendimentos } = useUserDataService();
  const [atendimentos] = useState(getAtendimentos().filter(atendimento => 
    atendimento.tipoServico !== "tarot-frequencial"
  ));
  const [searchTerm, setSearchTerm] = useState('');
  const [clientsData, setClientsData] = useState([]);
  const [openClients, setOpenClients] = useState(new Set());

  useEffect(() => {
    processClientsData();
  }, []);

  const processClientsData = () => {
    const clientsMap = new Map();

    atendimentos.forEach(atendimento => {
      const clientName = atendimento.nome;
      if (clientsMap.has(clientName)) {
        clientsMap.get(clientName).push(atendimento);
      } else {
        clientsMap.set(clientName, [atendimento]);
      }
    });

    const processedClients = Array.from(clientsMap.entries()).map(([name, consultations]) => ({
      name,
      consultations: consultations.sort((a, b) => new Date(b.dataAtendimento).getTime() - new Date(a.dataAtendimento).getTime()),
      totalConsultations: consultations.length,
      totalValue: consultations.reduce((acc, curr) => {
        const price = parseFloat(curr.valor || "0");
        return acc + price;
      }, 0)
    }));

    setClientsData(processedClients.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const filteredClients = clientsData.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClient = (clientName) => {
    const newOpenClients = new Set(openClients);
    if (newOpenClients.has(clientName)) {
      newOpenClients.delete(clientName);
    } else {
      newOpenClients.add(clientName);
    }
    setOpenClients(newOpenClients);
  };

  const downloadIndividualReport = (atendimento) => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text('Relatório Individual - Atendimento', 105, 20, { align: 'center' });
      
      let yPos = 40;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(`Cliente: ${atendimento.nome}`, 14, yPos);
      yPos += 10;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Data do Atendimento: ${format(new Date(atendimento.dataAtendimento), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Tipo de Serviço: ${atendimento.tipoServico}`, 14, yPos);
      yPos += 8;
      
      if (atendimento.dataNascimento) {
        doc.text(`Data de Nascimento: ${format(new Date(atendimento.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
        yPos += 8;
      }
      
      if (atendimento.signo) {
        doc.text(`Signo: ${atendimento.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Valor: R$ ${parseFloat(atendimento.valor || "0").toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Status Pagamento: ${atendimento.statusPagamento || 'Não informado'}`, 14, yPos);
      yPos += 15;
      
      if (atendimento.detalhes) {
        doc.setFont(undefined, 'bold');
        doc.text('Detalhes:', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        const detalhesLines = doc.splitTextToSize(atendimento.detalhes, 180);
        doc.text(detalhesLines, 14, yPos);
        yPos += detalhesLines.length * 6 + 10;
      }
      
      if (atendimento.tratamento) {
        doc.setFont(undefined, 'bold');
        doc.text('Tratamento:', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        const tratamentoLines = doc.splitTextToSize(atendimento.tratamento, 180);
        doc.text(tratamentoLines, 14, yPos);
        yPos += tratamentoLines.length * 6 + 10;
      }
      
      if (atendimento.indicacao) {
        doc.setFont(undefined, 'bold');
        doc.text('Indicação:', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        const indicacaoLines = doc.splitTextToSize(atendimento.indicacao, 180);
        doc.text(indicacaoLines, 14, yPos);
        yPos += indicacaoLines.length * 6 + 10;
      }
      
      const fileName = `Atendimento_Individual_${atendimento.nome.replace(/ /g, '_')}_${format(new Date(atendimento.dataAtendimento), 'dd-MM-yyyy')}.pdf`;
      doc.save(fileName);
      
      toast.success(`Relatório individual gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const downloadAllClientReports = (client) => {
    try {
      const doc = new jsPDF();
      
      // Header do relatório
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text('Relatório Consolidado do Cliente', 105, 20, { align: 'center' });
      
      let yPos = 40;
      
      // Informações do cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(`Nome do Cliente: ${client.name}`, 14, yPos);
      yPos += 15;
      
      // Resumo financeiro
      doc.setFont(undefined, 'bold');
      doc.text('RESUMO FINANCEIRO', 14, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      doc.text(`Total de Atendimentos Realizados: ${client.totalConsultations}`, 14, yPos);
      yPos += 8;
      doc.text(`Valor Total Investido: R$ ${client.totalValue.toFixed(2)}`, 14, yPos);
      yPos += 8;
      doc.text(`Valor Médio por Atendimento: R$ ${(client.totalValue / client.totalConsultations).toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      const firstAtendimento = client.consultations[client.consultations.length - 1];
      const lastAtendimento = client.consultations[0];
      
      if (firstAtendimento.dataAtendimento) {
        doc.text(`Primeiro Atendimento: ${format(new Date(firstAtendimento.dataAtendimento), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
        yPos += 8;
      }
      
      if (lastAtendimento.dataAtendimento) {
        doc.text(`Último Atendimento: ${format(new Date(lastAtendimento.dataAtendimento), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
        yPos += 15;
      }
      
      // Informações pessoais do cliente (baseado no primeiro atendimento)
      if (firstAtendimento.dataNascimento || firstAtendimento.signo) {
        doc.setFont(undefined, 'bold');
        doc.text('INFORMAÇÕES PESSOAIS', 14, yPos);
        yPos += 10;
        doc.setFont(undefined, 'normal');
        
        if (firstAtendimento.dataNascimento) {
          doc.text(`Data de Nascimento: ${format(new Date(firstAtendimento.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
          yPos += 8;
        }
        
        if (firstAtendimento.signo) {
          doc.text(`Signo: ${firstAtendimento.signo}`, 14, yPos);
          yPos += 15;
        }
      }
      
      // Histórico detalhado dos atendimentos
      doc.setFont(undefined, 'bold');
      doc.text('HISTÓRICO DETALHADO DOS ATENDIMENTOS', 14, yPos);
      yPos += 15;
      
      client.consultations.forEach((atendimento, index) => {
        // Verificar se precisa de nova página
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`Atendimento ${index + 1} - ${format(new Date(atendimento.dataAtendimento), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Tipo de Serviço: ${atendimento.tipoServico}`, 14, yPos);
        yPos += 8;
        doc.text(`Valor: R$ ${parseFloat(atendimento.valor || "0").toFixed(2)}`, 14, yPos);
        yPos += 8;
        doc.text(`Status Pagamento: ${atendimento.statusPagamento || 'Não informado'}`, 14, yPos);
        yPos += 10;
        
        if (atendimento.detalhes) {
          doc.setFont(undefined, 'bold');
          doc.text('Detalhes:', 14, yPos);
          yPos += 6;
          doc.setFont(undefined, 'normal');
          const detalhesLines = doc.splitTextToSize(atendimento.detalhes, 180);
          doc.text(detalhesLines, 14, yPos);
          yPos += detalhesLines.length * 5 + 8;
        }
        
        if (atendimento.tratamento) {
          doc.setFont(undefined, 'bold');
          doc.text('Tratamento:', 14, yPos);
          yPos += 6;
          doc.setFont(undefined, 'normal');
          const tratamentoLines = doc.splitTextToSize(atendimento.tratamento, 180);
          doc.text(tratamentoLines, 14, yPos);
          yPos += tratamentoLines.length * 5 + 8;
        }
        
        if (atendimento.indicacao) {
          doc.setFont(undefined, 'bold');
          doc.text('Indicação:', 14, yPos);
          yPos += 6;
          doc.setFont(undefined, 'normal');
          const indicacaoLines = doc.splitTextToSize(atendimento.indicacao, 180);
          doc.text(indicacaoLines, 14, yPos);
          yPos += indicacaoLines.length * 5 + 3;
        }
        
        yPos += 15;
        
        // Linha separadora entre atendimentos
        if (index < client.consultations.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(14, yPos - 5, 196, yPos - 5);
          yPos += 5;
        }
      });
      
      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Relatório Consolidado - ${client.name} - Gerado em ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })} - Página ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      const fileName = `Relatorio_Consolidado_${client.name.replace(/ /g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      doc.save(fileName);
      
      toast.success(`Relatório consolidado de ${client.name} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar relatório consolidado:", error);
      toast.error("Erro ao gerar relatório consolidado");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="h-12 w-12 text-[#1E40AF]" />
            <div>
              <h1 className="text-3xl font-bold text-[#1E40AF]">
                Relatórios Individuais - Atendimentos
              </h1>
              <p className="text-[#1E40AF] mt-1 opacity-80">Relatórios detalhados por cliente</p>
            </div>
          </div>
          
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="pr-10 bg-white/90 border-white/30 focus:border-[#1E40AF] focus:ring-[#1E40AF]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total de Clientes" 
            value={clientsData.length.toString()} 
            icon={<Users className="h-8 w-8 text-[#1E40AF]" />} 
          />
          <StatCard 
            title="Total de Atendimentos" 
            value={atendimentos.length.toString()} 
            icon={<FileText className="h-8 w-8 text-[#1E40AF]" />} 
          />
          <StatCard 
            title="Receita Total" 
            value={`R$ ${clientsData.reduce((acc, client) => acc + client.totalValue, 0).toFixed(2)}`} 
            icon={<Activity className="h-8 w-8 text-[#1E40AF]" />} 
          />
        </div>

        <Card className="bg-white/90 border border-white/30">
          <CardHeader>
            <CardTitle className="text-[#1E40AF]">Clientes e Atendimentos</CardTitle>
            <CardDescription>Relatórios individuais organizados por cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mt-2">
                  {searchTerm 
                    ? "Tente ajustar sua busca" 
                    : "Não há atendimentos registrados ainda"
                  }
                </p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.name} className="bg-white/80 border border-white/30">
                  <Collapsible 
                    open={openClients.has(client.name)} 
                    onOpenChange={() => toggleClient(client.name)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-[#1E40AF]/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {openClients.has(client.name) ? 
                              <ChevronDown className="h-5 w-5 text-[#1E40AF]" /> : 
                              <ChevronRight className="h-5 w-5 text-[#1E40AF]" />
                            }
                            <div>
                              <CardTitle className="text-lg text-[#1E40AF]">{client.name}</CardTitle>
                              <CardDescription>
                                {client.totalConsultations} atendimento{client.totalConsultations !== 1 ? 's' : ''} • 
                                Total: R$ {client.totalValue.toFixed(2)}
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAllClientReports(client);
                            }}
                            className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Todas
                          </Button>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {client.consultations.map((atendimento) => (
                            <div key={atendimento.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-slate-800">
                                    {format(new Date(atendimento.dataAtendimento), 'dd/MM/yyyy', { locale: ptBR })}
                                  </span>
                                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                    {atendimento.tipoServico}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                  Valor: R$ {parseFloat(atendimento.valor || "0").toFixed(2)}
                                  {atendimento.statusPagamento && ` • Status: ${atendimento.statusPagamento}`}
                                </p>
                              </div>
                              <Button
                                onClick={() => downloadIndividualReport(atendimento)}
                                variant="outline"
                                size="sm"
                                className="border-[#1E40AF]/30 text-[#1E40AF] hover:bg-[#1E40AF]/10"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <Card className="bg-white/90 border border-white/30">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#1E40AF]/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatorioIndividual;
