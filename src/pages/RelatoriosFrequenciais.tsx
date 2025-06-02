
import React, { useState, useEffect } from "react";
import useUserDataService from "@/services/userDataService";

const RelatoriosFrequenciais = () => {
  const { getTarotAnalyses } = useUserDataService();
  const [analyses, setAnalyses] = useState([]);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [completedAnalyses, setCompletedAnalyses] = useState(0);
  const [pendingAnalyses, setPendingAnalyses] = useState(0);
  const [attentionAnalyses, setAttentionAnalyses] = useState(0);

  useEffect(() => {
    const allAnalyses = getTarotAnalyses();
    setAnalyses(allAnalyses);
    setTotalAnalyses(allAnalyses.length);
    setCompletedAnalyses(allAnalyses.filter(analysis => analysis.finalizado).length);
    setPendingAnalyses(allAnalyses.filter(analysis => !analysis.finalizado).length);
    setAttentionAnalyses(allAnalyses.filter(analysis => 
      analysis.attentionFlag || analysis.atencaoFlag || analysis.atencao
    ).length);
  }, [getTarotAnalyses]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Relatórios Frequenciais</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total de Análises</h3>
          <p className="text-3xl font-bold text-blue-600">{totalAnalyses}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Concluídas</h3>
          <p className="text-3xl font-bold text-green-600">{completedAnalyses}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingAnalyses}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Requerem Atenção</h3>
          <p className="text-3xl font-bold text-red-600">{attentionAnalyses}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Análises</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Atenção</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((analysis) => (
                  <tr key={analysis.id} className="border-b">
                    <td className="px-4 py-2">{analysis.clientName || analysis.nomeCliente || 'N/A'}</td>
                    <td className="px-4 py-2">{analysis.analysisDate || analysis.dataInicio || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        analysis.finalizado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {analysis.finalizado ? 'Concluída' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {(analysis.attentionFlag || analysis.atencaoFlag || analysis.atencao) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                          Atenção
                        </span>
                      )}
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
