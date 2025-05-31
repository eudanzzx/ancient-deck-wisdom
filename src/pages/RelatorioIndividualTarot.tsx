
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Search, Calendar, DollarSign, FileText, Users, Star } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Logo from "@/components/Logo";

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const RelatorioIndividualTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [searchTerm, setSearchTerm] = useState('');
  const [analises] = useState(getAllTarotAnalyses());

  const clientesUnicos = useMemo(() => {
    const clientesMap = new Map();
    
    analises.forEach(analise => {
      const clienteKey = analise.nomeCliente.toLowerCase();
      if (!clientesMap.has(clienteKey)) {
        clientesMap.set(clienteKey, {
          nome: analise.nomeCliente,
          analises: []
        });
      }
      clientesMap.get(clienteKey).analises.push(analise);
    });

    return Array.from(clientesMap.values());
  }, [analises]);

  const clientesFiltrados = useMemo(() => {
    return clientesUnicos.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientesUnicos, searchTerm]);

  const calcularTotalCliente = (analises: any[]) => {
    return analises.reduce((total, analise) => {
      const preco = parseFloat(analise.preco || "150");
      return total + preco;
    }, 0);
  };

  const gerarRelatorioIndividual = useCallback((cliente: any) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(103, 49, 147);
    doc.text('Relatório Individual - Tarot Frequencial', 20, 30);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${cliente.nome}`, 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 65);
    
    const totalGasto = calcularTotalCliente(cliente.analises);
    doc.text(`Total gasto: R$ ${totalGasto.toFixed(2)}`, 20, 80);
    doc.text(`Número de análises: ${cliente.analises.length}`, 20, 95);

    const tableData = cliente.analises.map((analise: any) => [
      format(new Date(analise.dataInicio), 'dd/MM/yyyy'),
      analise.signo || 'Não informado',
      `R$ ${parseFloat(analise.preco || "150").toFixed(2)}`,
      analise.finalizado ? 'Finalizada' : 'Em andamento'
    ]);

    doc.autoTable({
      head: [['Data Início', 'Signo', 'Valor', 'Status']],
      body: tableData,
      startY: 110,
      styles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [103, 49, 147],
        textColor: [255, 255, 255],
      },
    });

    doc.save(`relatorio-tarot-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }, []);

  const gerarRelatorioConsolidado = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(103, 49, 147);
    doc.text('Relatório Consolidado - Tarot Frequencial', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 45);
    
    const totalGeral = clientesUnicos.reduce((total, cliente) => {
      return total + calcularTotalCliente(cliente.analises);
    }, 0);
    
    doc.text(`Total de clientes: ${clientesUnicos.length}`, 20, 65);
    doc.text(`Receita total: R$ ${totalGeral.toFixed(2)}`, 20, 80);

    const tableData = clientesUnicos.map(cliente => [
      cliente.nome,
      cliente.analises.length.toString(),
      `R$ ${calcularTotalCliente(cliente.analises).toFixed(2)}`
    ]);

    doc.autoTable({
      head: [['Cliente', 'Análises', 'Total Gasto']],
      body: tableData,
      startY: 95,
      styles: {
        fontSize: 10,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [103, 49, 147],
        textColor: [255, 255, 255],
      },
    });

    doc.save('relatorio-consolidado-tarot.pdf');
  }, [clientesUnicos]);

  const totalReceita = useMemo(() => {
    return clientesUnicos.reduce((total, cliente) => {
      return total + calcularTotalCliente(cliente.analises);
    }, 0);
  }, [clientesUnicos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo height={50} width={50} />
            <div>
              <h1 className="text-3xl font-bold text-[#673193]">
                Relatórios Individuais - Tarot
              </h1>
              <p className="text-[#673193] mt-1 opacity-80">Análises por cliente</p>
            </div>
          </div>
          
          <Button 
            onClick={gerarRelatorioConsolidado}
            className="bg-[#673193] hover:bg-[#673193]/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Relatório Consolidado
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-slate-800">{clientesUnicos.length}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#673193]/10">
                  <Users className="h-8 w-8 text-[#673193]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Análises</p>
                  <p className="text-3xl font-bold text-slate-800">{analises.length}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#673193]/10">
                  <FileText className="h-8 w-8 text-[#673193]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Receita Total</p>
                  <p className="text-3xl font-bold text-slate-800">R$ {totalReceita.toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#673193]/10">
                  <DollarSign className="h-8 w-8 text-[#673193]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Ticket Médio</p>
                  <p className="text-3xl font-bold text-slate-800">
                    R$ {clientesUnicos.length > 0 ? (totalReceita / clientesUnicos.length).toFixed(2) : "0.00"}
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-[#673193]/10">
                  <Calendar className="h-8 w-8 text-[#673193]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
          <CardHeader className="border-b border-slate-200/50 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-[#673193]">
                Clientes - Tarot
              </CardTitle>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pr-10 bg-white/90 border-white/30 focus:border-[#673193]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {clientesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mt-2">
                  {searchTerm 
                    ? "Tente ajustar sua busca" 
                    : "Nenhuma análise foi registrada ainda"
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {clientesFiltrados.map((cliente, index) => (
                  <Card 
                    key={index} 
                    className="bg-white/80 border border-white/30 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {cliente.nome}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#673193]" />
                              <span>{cliente.analises.length} análise(s)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-emerald-600">
                                R$ {calcularTotalCliente(cliente.analises).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span>
                                {cliente.analises[0]?.signo || 'Signo não informado'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10"
                          onClick={() => gerarRelatorioIndividual(cliente)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Relatório
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioIndividualTarot;
