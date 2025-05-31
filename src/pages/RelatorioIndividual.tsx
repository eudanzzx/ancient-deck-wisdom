
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  Download,
  Calendar,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DetailedClientReportGenerator from "@/components/reports/DetailedClientReportGenerator";

const RelatorioIndividual = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [atendimentos, setAtendimentos] = useState([]);
  const [filteredAtendimentos, setFilteredAtendimentos] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const { getAtendimentos } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAtendimentos();
  }, []);

  useEffect(() => {
    const filtered = atendimentos.filter(atendimento =>
      atendimento.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAtendimentos(filtered);
  }, [searchTerm, atendimentos]);

  const loadAtendimentos = () => {
    const data = getAtendimentos();
    console.log('RelatorioIndividual - Dados carregados:', data);
    setAtendimentos(data);
    setFilteredAtendimentos(data);
  };

  const clientesUnicos = useMemo(() => {
    const clientesMap = new Map();
    
    filteredAtendimentos.forEach(atendimento => {
      const cliente = atendimento.nomeCliente;
      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, {
          nome: cliente,
          atendimentos: [],
          totalConsultas: 0,
          valorTotal: 0,
          ultimaConsulta: null
        });
      }
      
      const clienteData = clientesMap.get(cliente);
      clienteData.atendimentos.push(atendimento);
      clienteData.totalConsultas += 1;
      
      // Fix: Ensure proper number parsing for arithmetic operations
      const precoValue = atendimento.preco || atendimento.valor || "0";
      const precoNumber = parseFloat(precoValue.toString());
      clienteData.valorTotal += isNaN(precoNumber) ? 0 : precoNumber;
      
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      if (!clienteData.ultimaConsulta || dataAtendimento > new Date(clienteData.ultimaConsulta)) {
        clienteData.ultimaConsulta = atendimento.dataAtendimento;
      }
    });
    
    return Array.from(clientesMap.values()).sort((a, b) => 
      new Date(b.ultimaConsulta) - new Date(a.ultimaConsulta)
    );
  }, [filteredAtendimentos]);

  const getTotalValue = () => {
    return atendimentos.reduce((acc: number, curr) => {
      const precoValue = curr.preco || curr.valor || "0";
      const precoNumber = parseFloat(precoValue.toString());
      const validNumber = isNaN(precoNumber) ? 0 : precoNumber;
      return acc + validNumber;
    }, 0).toFixed(2);
  };

  const handleDownloadIndividual = (cliente) => {
    setSelectedClient(cliente);
  };

  const handleDownloadConsolidated = () => {
    toast({
      title: "Gerando relatório consolidado",
      description: "O relatório de todos os clientes está sendo gerado.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <DashboardHeader />

      <main className="pt-20 p-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transform hover:scale-110 transition-all duration-300">
              <Logo height={50} width={50} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Relatórios Individuais
              </h1>
              <p className="text-blue-600/80 mt-1">Relatórios detalhados por cliente</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Total Arrecadado" 
            value={`R$ ${getTotalValue()}`} 
            icon={<DollarSign className="h-8 w-8 text-blue-600" />} 
          />
          <DashboardCard 
            title="Total Consultas" 
            value={atendimentos.length.toString()} 
            icon={<BarChart3 className="h-8 w-8 text-blue-600" />} 
          />
          <DashboardCard 
            title="Clientes Únicos" 
            value={clientesUnicos.length.toString()} 
            icon={<Users className="h-8 w-8 text-blue-600" />} 
          />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-200/50 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Clientes para Relatório
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-600/10 text-blue-600 border-blue-600/20">
                  {clientesUnicos.length} clientes
                </Badge>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    className="pr-10 bg-white/90 border-white/30 focus:border-blue-600 focus:ring-blue-600/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <Button
                  onClick={handleDownloadConsolidated}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Relatório Consolidado
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {clientesUnicos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mt-2">
                  {searchTerm 
                    ? "Tente ajustar sua busca ou limpar o filtro" 
                    : "Nenhum atendimento registrado ainda"
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {clientesUnicos.map((cliente, index) => (
                  <Card 
                    key={`${cliente.nome}-${index}`} 
                    className="bg-white/80 border border-white/30 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {cliente.nome}
                            </h3>
                            <Badge 
                              variant="secondary"
                              className="bg-blue-100 text-blue-700 border-blue-200"
                            >
                              {cliente.totalConsultas} consulta{cliente.totalConsultas !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>
                                Última: {cliente.ultimaConsulta 
                                  ? new Date(cliente.ultimaConsulta).toLocaleDateString('pt-BR')
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-emerald-600">
                                Total: R$ {cliente.valorTotal.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <span>
                                Média: R$ {(cliente.valorTotal / cliente.totalConsultas).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleDownloadIndividual(cliente)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Relatório Individual
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedClient && (
          <DetailedClientReportGenerator
            atendimentos={selectedClient.atendimentos}
            clients={[{ name: selectedClient.nome, count: selectedClient.totalConsultas }]}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </main>
    </div>
  );
};

const DashboardCard = ({ title, value, icon }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-blue-600/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatorioIndividual;
