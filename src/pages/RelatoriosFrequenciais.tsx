import React, { useState, useEffect } from "react";
import useUserDataService from "@/services/userDataService";

interface AnaliseFrequencial {
  id: string;
  nomeCliente: string;
  dataInicio: string;
  preco: string;
  finalizado: boolean;
  dataNascimento: string;
  signo: string;
  tipoServico: string;
  analiseAntes: string;
  analiseDepois: string;
  lembretes: any[];
  atencaoFlag: boolean;
}

const RelatoriosFrequenciais = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  
  const [analises, setAnalises] = useState<AnaliseFrequencial[]>([]);
  const [atendimentosFinalizados, setAtendimentosFinalizados] = useState(0);
  const [atendimentosEmAndamento, setAtendimentosEmAndamento] = useState(0);
  const [atendimentosComAtencao, setAtendimentosComAtencao] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);

  useEffect(() => {
    const analisesTarot = getAllTarotAnalyses();
    const analisesFormatadas = analisesTarot.map(analise => ({
      id: analise.id,
      nomeCliente: analise.nomeCliente || analise.clientName || "",
      dataInicio: analise.dataInicio || analise.analysisDate || "",
      preco: analise.preco || analise.value || "",
      finalizado: analise.finalizado ?? false,
      dataNascimento: analise.dataNascimento || analise.clientBirthdate || "",
      signo: analise.signo || analise.clientSign || "",
      tipoServico: analise.tipoServico || analise.analysisType || "",
      analiseAntes: analise.analiseAntes || "",
      analiseDepois: analise.analiseDepois || "",
      lembretes: typeof analise.lembretes === 'string' ? [] : (analise.lembretes || []),
      atencaoFlag: analise.atencaoFlag || analise.attentionFlag || false
    }));
    
    setAnalises(analisesFormatadas);

    setAtendimentosFinalizados(analisesFormatadas.filter(a => a.finalizado).length);
    setAtendimentosEmAndamento(analisesFormatadas.filter(a => !a.finalizado).length);
    setTotalServicos(analisesFormatadas.length);
    setAtendimentosComAtencao(analisesFormatadas.filter(a => a.atencaoFlag).length);
  }, [getAllTarotAnalyses]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatórios Frequenciais</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Total de Atendimentos</h2>
          <p className="text-3xl font-bold text-blue-500">{totalServicos}</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Atendimentos Finalizados</h2>
          <p className="text-3xl font-bold text-green-500">{atendimentosFinalizados}</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Atendimentos Em Andamento</h2>
          <p className="text-3xl font-bold text-yellow-500">{atendimentosEmAndamento}</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Atendimentos Com Atenção</h2>
          <p className="text-3xl font-bold text-red-500">{atendimentosComAtencao}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Lista de Atendimentos</h2>
        {analises.length > 0 ? (
          <table className="min-w-full leading-normal">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data Início
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {analises.map(analise => (
                <tr key={analise.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {analise.nomeCliente}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {analise.dataInicio}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {analise.preco}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {analise.finalizado ? 'Finalizado' : 'Em Andamento'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum atendimento encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default RelatoriosFrequenciais;
