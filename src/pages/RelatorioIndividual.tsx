
import React, { useState } from 'react';
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DetailedClientReportGenerator from "@/components/reports/DetailedClientReportGenerator";
import RelatorioIndividualStats from "@/components/relatorio-individual/RelatorioIndividualStats";
import ClientesLista from "@/components/relatorio-individual/ClientesLista";
import { useRelatorioIndividual } from "@/hooks/useRelatorioIndividual";

const RelatorioIndividual = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const { toast } = useToast();
  
  const {
    searchTerm,
    setSearchTerm,
    atendimentos,
    clientesUnicos,
    getTotalValue
  } = useRelatorioIndividual();

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

        <RelatorioIndividualStats
          totalValue={getTotalValue()}
          totalConsultas={atendimentos.length}
          totalClientes={clientesUnicos.length}
        />

        <ClientesLista
          clientesUnicos={clientesUnicos}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onDownloadIndividual={handleDownloadIndividual}
          onDownloadConsolidated={handleDownloadConsolidated}
        />

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

export default RelatorioIndividual;
