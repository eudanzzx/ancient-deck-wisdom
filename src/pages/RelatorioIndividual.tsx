
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, FileText, Users, User } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Logo from "@/components/Logo";
import ClientFormPdfGenerator from "@/components/reports/ClientFormPdfGenerator";

const RelatorioIndividual = () => {
  const { getAtendimentos } = useUserDataService();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [analises] = useState(getAtendimentos());

  // Função para formatar data de forma segura
  const formatarDataSegura = (data: string) => {
    if (!data || data.trim() === '') {
      return 'Data não informada';
    }
    
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        return 'Data não informada';
      }
      return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data não informada';
    }
  };

  const clientesUnicos = useMemo(() => {
    const clientesMap = new Map();
    
    analises.forEach(analise => {
      const clienteKey = analise.nome.toLowerCase();
      if (!clientesMap.has(clienteKey)) {
        clientesMap.set(clienteKey, {
          nome: analise.nome,
          atendimentos: []
        });
      }
      clientesMap.get(clienteKey).atendimentos.push(analise);
    });

    return Array.from(clientesMap.values());
  }, [analises]);

  const clientesFiltrados = useMemo(() => {
    return clientesUnicos.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientesUnicos, searchTerm]);

  const calcularTotalCliente = (atendimentos: any[]) => {
    return atendimentos.reduce((total, atendimento) => {
      const valor = parseFloat(atendimento.valor || "0");
      return total + valor;
    }, 0);
  };

  const calcularTotalGeral = () => {
    return clientesUnicos.reduce((total, cliente) => {
      return total + calcularTotalCliente(cliente.atendimentos);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Logo height={50} width={50} />
            <div>
              <h1 className="text-3xl font-bold text-[#2563EB]">
                Formulários de Atendimento
              </h1>
              <p className="text-[#2563EB] mt-1 opacity-80">Documentos para clientes</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-slate-800">{clientesUnicos.length}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <Users className="h-8 w-8 text-[#2563EB]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Atendimentos</p>
                  <p className="text-3xl font-bold text-slate-800">{analises.length}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <FileText className="h-8 w-8 text-[#2563EB]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Receita Total</p>
                  <p className="text-3xl font-bold text-slate-800">R$ {calcularTotalGeral().toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <DollarSign className="h-8 w-8 text-[#2563EB]" />
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
                    R$ {clientesUnicos.length > 0 ? (calcularTotalGeral() / clientesUnicos.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-[#2563EB]/10">
                  <DollarSign className="h-8 w-8 text-[#2563EB]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
          <CardHeader className="border-b border-slate-200/50 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold text-[#2563EB]">
                  Clientes
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {clientesUnicos.length} clientes
                </Badge>
              </div>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pr-10 bg-white/90 border-white/30 focus:border-[#2563EB]"
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
                    : "Nenhum atendimento foi registrado ainda"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientesFiltrados.map((cliente, index) => (
                  <div key={`${cliente.nome}-${index}`} className="border border-white/20 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md">
                    <div className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <User className="h-6 w-6 text-[#2563EB]" />
                            <span className="font-semibold text-slate-800 text-lg">{cliente.nome}</span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#2563EB]" />
                              <span>{cliente.atendimentos.length} atendimento(s)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-emerald-600">
                                R$ {calcularTotalCliente(cliente.atendimentos).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ClientFormPdfGenerator cliente={cliente} />
                      </div>

                      {/* Informações do último atendimento em grid lado a lado */}
                      {cliente.atendimentos.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-blue-600/20">
                          <h4 className="font-medium text-blue-600 mb-4">Último Atendimento</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Data</span>
                              <span className="text-sm text-slate-700">
                                {formatarDataSegura(cliente.atendimentos[cliente.atendimentos.length - 1]?.dataAtendimento)}
                              </span>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Serviço</span>
                              <span className="text-sm text-slate-700">
                                {cliente.atendimentos[cliente.atendimentos.length - 1]?.tipoServico || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Valor</span>
                              <span className="text-sm text-slate-700">
                                R$ {parseFloat(cliente.atendimentos[cliente.atendimentos.length - 1]?.valor || "0").toFixed(2)}
                              </span>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Status</span>
                              <span className="text-sm text-slate-700">
                                {cliente.atendimentos[cliente.atendimentos.length - 1]?.statusPagamento || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Destino</span>
                              <span className="text-sm text-slate-700">
                                {cliente.atendimentos[cliente.atendimentos.length - 1]?.destino || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Ano</span>
                              <span className="text-sm text-slate-700">
                                {cliente.atendimentos[cliente.atendimentos.length - 1]?.ano || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Tratamento</span>
                              <span className="text-sm text-slate-700">
                                {cliente.atendimentos[cliente.atendimentos.length - 1]?.tratamento || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3">
                              <span className="text-xs font-medium text-blue-600 block mb-1">Indicação</span>
                              <span className="text-sm text-slate-700">
                                {cliente.atendimentos[cliente.atendimentos.length - 1]?.indicacao || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioIndividual;
