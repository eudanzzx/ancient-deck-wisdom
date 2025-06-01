
import React from 'react';
import useUserDataService from '@/services/userDataService';
import ClientReportButtons from './reports/ClientReportButtons';

interface ReportManagerProps {
  variant?: 'home' | 'tarot';
}

const ReportManager: React.FC<ReportManagerProps> = ({ variant = 'home' }) => {
  const { getAtendimentos, getClientsWithConsultations, getTarotAnalyses } = useUserDataService();
  
  // Para tarot, usamos dados específicos
  if (variant === 'tarot') {
    const analises = getTarotAnalyses();
    const clientsMap = new Map();

    analises.forEach(analise => {
      const clientName = analise.nomeCliente;
      if (clientsMap.has(clientName)) {
        clientsMap.get(clientName).count++;
        clientsMap.get(clientName).consultations.push(analise);
      } else {
        clientsMap.set(clientName, {
          name: clientName,
          count: 1,
          consultations: [analise]
        });
      }
    });

    const tarotClients = Array.from(clientsMap.values());

    return (
      <div className="space-y-4">
        <ClientReportButtons 
          clientName=""
          analises={analises}
          allAnalises={analises}
        />
      </div>
    );
  }

  // Para home, usamos atendimentos normais
  const atendimentos = getAtendimentos();
  const clients = getClientsWithConsultations();

  return (
    <div className="space-y-4">
      <ClientReportButtons 
        clientName=""
        analises={atendimentos}
        allAnalises={atendimentos}
      />
    </div>
  );
};

export default ReportManager;
