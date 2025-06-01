
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, User, Calendar, DollarSign, Clock, FileText, Star } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RelatorioIndividualTarot = () => {
  const { getAnalises } = useUserDataService();
  const [analises, setAnalises] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [clienteAnalises, setClienteAnalises] = useState<any[]>([]);

  useEffect(() => {
    const data = getAnalises();
    console.log('Análises carregadas:', data);
    setAnalises(data);
  }, []);

  const clientes = [...new Set(analises.map(analise => analise.nomeCliente))].sort();

  useEffect(() => {
    if (selectedCliente) {
      const analises_cliente = analises.filter(analise => analise.nomeCliente === selectedCliente);
      setClienteAnalises(analises_cliente);
    } else {
      setClienteAnalises([]);
    }
  }, [selectedCliente, analises]);

  const calcularEstatisticas = () => {
    const total = clienteAnalises.length;
    const finalizados = clienteAnalises.filter(a => a.finalizado).length;
    const emAndamento = total - finalizados;
    const valorTotal = clienteAnalises.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0);
    
    return { total, finalizados, emAndamento, valorTotal };
  };

  const gerarRelatorioPDF = () => {
    const doc = new jsPDF();
    const stats = calcularEstatisticas();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório Individual - Tarot', 14, 22);
    
    // Informações do cliente
    doc.setFontSize(14);
    doc.text(`Cliente: ${selectedCliente}`, 14, 35);
    doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`, 14, 45);
    
    // Estatísticas
    doc.setFontSize(12);
    doc.text('Resumo:', 14, 60);
    doc.text(`Total de análises: ${stats.total}`, 20, 70);
    doc.text(`Finalizadas: ${stats.finalizados}`, 20, 80);
    doc.text(`Em andamento: ${stats.emAndamento}`, 20, 90);
    doc.text(`Valor total: R$ ${stats.valorTotal.toFixed(2)}`, 20, 100);
    
    // Tabela de análises
    const tableData = clienteAnalises.map(analise => [
      new Date(analise.dataInicio).toLocaleDateString('pt-BR'),
      analise.tipoConsulta || 'Não informado',
      `R$ ${parseFloat(analise.valor || 0).toFixed(2)}`,
      analise.finalizado ? 'Finalizada' : 'Em andamento',
      analise.observacoes || 'Sem observações'
    ]);

    autoTable(doc, {
      head: [['Data', 'Tipo', 'Valor', 'Status', 'Observações']],
      body: tableData,
      startY: 110,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`relatorio-${selectedCliente.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const stats = calcularEstatisticas();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-purple-800">Relatório Individual - Tarot</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seleção de Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCliente} onValueChange={setSelectedCliente}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente} value={cliente}>
                  {cliente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCliente && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total de Análises</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.finalizados}</p>
                    <p className="text-sm text-gray-600">Finalizadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.emAndamento}</p>
                    <p className="text-sm text-gray-600">Em Andamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">R$ {stats.valorTotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Valor Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Análises de {selectedCliente}</CardTitle>
              <Button onClick={gerarRelatorioPDF} className="bg-purple-600 hover:bg-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clienteAnalises.map((analise, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(analise.dataInicio).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <Badge variant={analise.finalizado ? "default" : "secondary"}>
                        {analise.finalizado ? "Finalizada" : "Em andamento"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Tipo de Consulta</p>
                        <p className="text-sm">{analise.tipoConsulta || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Valor</p>
                        <p className="text-sm">R$ {parseFloat(analise.valor || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Observações</p>
                        <p className="text-sm">{analise.observacoes || 'Sem observações'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {clienteAnalises.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma análise encontrada para este cliente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RelatorioIndividualTarot;
