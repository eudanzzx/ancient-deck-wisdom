import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, DollarSign, FileText, Users, Star, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import TarotFormPdfGenerator from "@/components/reports/TarotFormPdfGenerator";
import IndividualTarotFormGenerator from "@/components/reports/IndividualTarotFormGenerator";

const RelatorioIndividualTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [analises] = useState(getAllTarotAnalyses());
  const { toast } = useToast();

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

  const totalReceita = useMemo(() => {
    return clientesUnicos.reduce((total, cliente) => {
      return total + calcularTotalCliente(cliente.analises);
    }, 0);
  }, [clientesUnicos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4">
        <div className="mb-8 flex items-center">
          <div className="flex items-center gap-4">
            <Logo height={50} width={50} />
            <div>
              <h1 className="text-3xl font-bold text-[#673193]">
                Relatórios Individuais - Tarot
              </h1>
              <p className="text-[#673193] mt-1 opacity-80">Análises por cliente</p>
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
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold text-[#673193]">
                  Clientes - Tarot
                </CardTitle>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {clientesUnicos.length} clientes
                </Badge>
              </div>
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
              <div className="space-y-2">
                {clientesFiltrados.map((cliente, index) => (
                  <div key={`${cliente.nome}-${index}`} className="border border-white/20 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md">
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-[#673193]" />
                            <span className="font-medium text-slate-800">{cliente.nome}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-[#673193]" />
                              <span>{cliente.analises.length} análise(s)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-emerald-600">
                                R$ {calcularTotalCliente(cliente.analises).toFixed(2)}
                              </span>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              {cliente.analises.length} análise{cliente.analises.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedClient(expandedClient === cliente.nome ? null : cliente.nome)}
                            className="border-purple-600/30 text-purple-600 hover:bg-purple-600/10"
                          >
                            {expandedClient === cliente.nome ? 'Ocultar' : 'Ver'} Detalhes
                          </Button>
                          <TarotFormPdfGenerator cliente={cliente} />
                          
                          {cliente.analises.length > 1 ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Formulários
                                  <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64">
                                {cliente.analises.map((analise: any, idx: number) => (
                                  <IndividualTarotFormGenerator
                                    key={idx}
                                    analise={analise}
                                    clientName={cliente.nome}
                                    className="w-full"
                                  />
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <IndividualTarotFormGenerator
                              analise={cliente.analises[0]}
                              clientName={cliente.nome}
                            />
                          )}
                        </div>
                      </div>

                      {expandedClient === cliente.nome && (
                        <div className="mt-4 border-t border-purple-600/20 pt-4">
                          <h4 className="font-medium text-purple-600 mb-3">Histórico de Análises</h4>
                          <div className="space-y-3">
                            {cliente.analises.map((analise: any, idx: number) => (
                              <div key={idx} className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/30">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm flex-1">
                                    <div>
                                      <span className="font-medium text-purple-600">Data:</span>
                                      <span className="ml-2 text-slate-700">
                                        {analise.dataInicio ? new Date(analise.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-purple-600">Status:</span>
                                      <span className="ml-2 text-slate-700">
                                        {analise.finalizado ? 'Finalizada' : 'Em andamento'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-purple-600">Valor:</span>
                                      <span className="ml-2 text-slate-700">R$ {parseFloat(analise.preco || "150").toFixed(2)}</span>
                                    </div>
                                    
                                    {analise.signo && (
                                      <div>
                                        <span className="font-medium text-purple-600">Signo:</span>
                                        <span className="ml-2 text-slate-700">{analise.signo}</span>
                                      </div>
                                    )}
                                    
                                    {analise.nascimento && (
                                      <div>
                                        <span className="font-medium text-purple-600">Nascimento:</span>
                                        <span className="ml-2 text-slate-700">
                                          {new Date(analise.nascimento).toLocaleDateString('pt-BR')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {analise.telefone && (
                                      <div>
                                        <span className="font-medium text-purple-600">Telefone:</span>
                                        <span className="ml-2 text-slate-700">{analise.telefone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {analise.pergunta && (
                                  <div className="mt-3">
                                    <span className="font-medium text-purple-600">Pergunta:</span>
                                    <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border">{analise.pergunta}</p>
                                  </div>
                                )}

                                {analise.leitura && (
                                  <div className="mt-3">
                                    <span className="font-medium text-purple-600">Leitura:</span>
                                    <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border">{analise.leitura}</p>
                                  </div>
                                )}

                                {analise.orientacao && (
                                  <div className="mt-3">
                                    <span className="font-medium text-purple-600">Orientação:</span>
                                    <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border">{analise.orientacao}</p>
                                  </div>
                                )}
                              </div>
                            ))}
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

export default RelatorioIndividualTarot;
