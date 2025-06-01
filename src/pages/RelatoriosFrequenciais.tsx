import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Users, DollarSign, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUserDataService from "@/services/userDataService";
import Logo from "@/components/Logo";

interface AnaliseFrequencial {
  id: string;
  nomeCliente: string;
  dataInicio: string;
  preco: string;
  finalizado: boolean;
  dataNascimento?: string;
  signo?: string;
  tipoServico?: string;
  analiseAntes?: string;
  analiseDepois?: string;
  lembretes?: Array<{
    id: number;
    texto: string;
    dias: number;
  }>;
  atencaoFlag?: boolean;
}

const RelatoriosFrequenciais = () => {
  const navigate = useNavigate();
  const { getAllTarotAnalyses } = useUserDataService();
  
  const rawAnalises = getAllTarotAnalyses();
  
  // Convert to the expected interface format
  const [analises] = useState<AnaliseFrequencial[]>(
    rawAnalises.map(analise => ({
      id: analise.id,
      nomeCliente: analise.nomeCliente,
      dataInicio: analise.dataInicio,
      preco: analise.preco,
      finalizado: analise.finalizado ?? false,
      dataNascimento: analise.dataNascimento,
      signo: analise.signo,
      tipoServico: analise.tipoServico || 'tarot',
      analiseAntes: analise.analiseAntes,
      analiseDepois: analise.analiseDepois,
      lembretes: analise.lembretes,
      atencaoFlag: analise.atencaoFlag
    }))
  );

  const totalAnalises = analises.length;
  const totalClientes = useMemo(() => new Set(analises.map(a => a.nomeCliente)).size, [analises]);
  const receitaTotal = useMemo(() => analises.reduce((acc, a) => acc + parseFloat(a.preco || '0'), 0), [analises]);

  const dataMaisRecente = useMemo(() => {
    if (analises.length === 0) return 'N/A';
    const datas = analises.map(a => new Date(a.dataInicio).getTime());
    const maisRecente = new Date(Math.max(...datas));
    return maisRecente.toLocaleDateString('pt-BR');
  }, [analises]);

  return (
    <div className="min-h-screen bg-[#F1F7FF] py-6 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-colors duration-200" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#6B21A8]">
              Relatórios Frequenciais
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-[#6B21A8]/20 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#6B21A8] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Total de Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{totalAnalises}</div>
              <p className="text-sm text-gray-500">Análises realizadas</p>
            </CardContent>
          </Card>

          <Card className="border-[#6B21A8]/20 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#6B21A8] flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{totalClientes}</div>
              <p className="text-sm text-gray-500">Clientes atendidos</p>
            </CardContent>
          </Card>

          <Card className="border-[#6B21A8]/20 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#6B21A8] flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">R$ {receitaTotal.toFixed(2)}</div>
              <p className="text-sm text-gray-500">Valor total recebido</p>
            </CardContent>
          </Card>

          <Card className="border-[#6B21A8]/20 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#6B21A8] flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Data Mais Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{dataMaisRecente}</div>
              <p className="text-sm text-gray-500">Última análise realizada</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#6B21A8] mb-4">Análises Recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Data de Início
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {analises.slice(0, 5).map(analise => (
                  <tr key={analise.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{analise.nomeCliente}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{new Date(analise.dataInicio).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">R$ {parseFloat(analise.preco || '0').toFixed(2)}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <Badge className={analise.finalizado ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                        {analise.finalizado ? 'Finalizado' : 'Em Andamento'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosFrequenciais;
