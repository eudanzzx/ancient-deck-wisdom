
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  Users, 
  Sparkles, 
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

const RelatorioIndividualTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [analises] = useState(getAllTarotAnalyses());
  const [searchTerm, setSearchTerm] = useState('');
  const [clientsData, setClientsData] = useState([]);
  const [openClients, setOpenClients] = useState(new Set());

  useEffect(() => {
    processClientsData();
  }, []);

  const processClientsData = () => {
    const clientsMap = new Map();

    analises.forEach(analise => {
      const clientName = analise.nomeCliente;
      if (clientsMap.has(clientName)) {
        clientsMap.get(clientName).push(analise);
      } else {
        clientsMap.set(clientName, [analise]);
      }
    });

    const processedClients = Array.from(clientsMap.entries()).map(([name, consultations]) => ({
      name,
      consultations: consultations.sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio)),
      totalConsultations: consultations.length,
      totalValue: consultations.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0)
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

  const downloadIndividualReport = (analise) => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(107, 33, 168);
      doc.text('Relatório Individual - Análise de Tarot', 105, 20, { align: 'center' });
      
      let yPos = 40;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(`Cliente: ${analise.nomeCliente}`, 14, yPos);
      yPos += 10;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Data da Análise: ${format(new Date(analise.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
      yPos += 8;
      
      if (analise.dataNascimento) {
        doc.text(`Data de Nascimento: ${format(new Date(analise.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}`, 14, yPos);
        yPos += 8;
      }
      
      if (analise.signo) {
        doc.text(`Signo: ${analise.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Valor: R$ ${parseFloat(analise.preco || "150").toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Status: ${analise.finalizado ? 'Finalizada' : 'Em andamento'}`, 14, yPos);
      yPos += 15;
      
      if (analise.analiseAntes) {
        doc.setFont(undefined, 'bold');
        doc.text('Análise - Antes:', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        const antesLines = doc.splitTextToSize(analise.analiseAntes, 180);
        doc.text(antesLines, 14, yPos);
        yPos += antesLines.length * 6 + 10;
      }
      
      if (analise.analiseDepois) {
        doc.setFont(undefined, 'bold');
        doc.text('Análise - Depois:', 14, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        const depoisLines = doc.splitTextToSize(analise.analiseDepois, 180);
        doc.text(depoisLines, 14, yPos);
        yPos += depoisLines.length * 6 + 10;
      }
      
      if (analise.lembretes && analise.lembretes.length > 0) {
        const tratamentos = analise.lembretes.filter(l => l.texto?.trim());
        if (tratamentos.length > 0) {
          doc.setFont(undefined, 'bold');
          doc.text('Tratamento/Lembretes:', 14, yPos);
          yPos += 8;
          doc.setFont(undefined, 'normal');
          tratamentos.forEach(lembrete => {
            const tratamentoLines = doc.splitTextToSize(lembrete.texto, 180);
            doc.text(tratamentoLines, 14, yPos);
            yPos += tratamentoLines.length * 6 + 5;
          });
        }
      }
      
      const fileName = `Analise_Individual_${analise.nomeCliente.replace(/ /g, '_')}_${format(new Date(analise.dataInicio), 'dd-MM-yyyy')}.pdf`;
      doc.save(fileName);
      
      toast.success(`Relatório individual gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const downloadAllClientReports = (client) => {
    try {
      client.consultations.forEach((analise, index) => {
        setTimeout(() => {
          downloadIndividualReport(analise);
        }, index * 1000);
      });
      
      toast.success(`Gerando ${client.consultations.length} relatórios de ${client.name}...`);
    } catch (error) {
      console.error("Erro ao gerar relatórios:", error);
      toast.error("Erro ao gerar relatórios");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <Sparkles className="h-12 w-12 text-[#6B21A8]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#6B21A8] bg-gradient-to-r from-[#6B21A8] to-purple-600 bg-clip-text text-transparent">
                Relatórios Individuais - Tarot
              </h1>
              <p className="text-[#6B21A8] mt-1 opacity-80">Relatórios detalhados por cliente</p>
            </div>
          </div>
          
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="pr-10 bg-white/90 border-white/30 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-300"
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
            icon={<Users className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Total de Análises" 
            value={analises.length.toString()} 
            icon={<FileText className="h-8 w-8 text-[#6B21A8]" />} 
          />
          <StatCard 
            title="Receita Total" 
            value={`R$ ${clientsData.reduce((acc, client) => acc + client.totalValue, 0).toFixed(2)}`} 
            icon={<Sparkles className="h-8 w-8 text-[#6B21A8]" />} 
          />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#6B21A8]">Clientes e Análises</CardTitle>
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
                    : "Não há análises registradas ainda"
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
                      <CardHeader className="cursor-pointer hover:bg-[#6B21A8]/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {openClients.has(client.name) ? 
                              <ChevronDown className="h-5 w-5 text-[#6B21A8]" /> : 
                              <ChevronRight className="h-5 w-5 text-[#6B21A8]" />
                            }
                            <div>
                              <CardTitle className="text-lg text-[#6B21A8]">{client.name}</CardTitle>
                              <CardDescription>
                                {client.totalConsultations} análise{client.totalConsultations !== 1 ? 's' : ''} • 
                                Total: R$ {client.totalValue.toFixed(2)}
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAllClientReports(client);
                            }}
                            className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white"
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
                          {client.consultations.map((analise) => (
                            <div key={analise.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-slate-800">
                                    {format(new Date(analise.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    analise.finalizado 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {analise.finalizado ? 'Finalizada' : 'Em andamento'}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                  Valor: R$ {parseFloat(analise.preco || "150").toFixed(2)}
                                  {analise.signo && ` • Signo: ${analise.signo}`}
                                </p>
                              </div>
                              <Button
                                onClick={() => downloadIndividualReport(analise)}
                                variant="outline"
                                size="sm"
                                className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10"
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
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatorioIndividualTarot;
