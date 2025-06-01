
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import DetailedClientReportGenerator from './DetailedClientReportGenerator';
import GeneralReportGenerator from './GeneralReportGenerator';

interface ClientReportButtonsProps {
  clientName: string;
  analises: any[];
  allAnalises?: any[];
}

const ClientReportButtons: React.FC<ClientReportButtonsProps> = ({
  clientName,
  analises,
  allAnalises = []
}) => {
  const detailedReportGenerator = DetailedClientReportGenerator({
    clientName,
    analises,
    onGenerate: () => console.log('Relatório detalhado gerado')
  });

  const generalReportGenerator = GeneralReportGenerator({
    analises: allAnalises,
    onGenerate: () => console.log('Relatório geral gerado')
  });

  return (
    <div className="flex gap-2">
      <Button 
        onClick={detailedReportGenerator.generateDetailedReport}
        className="bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Relatório Individual
      </Button>
      
      {allAnalises.length > 0 && (
        <Button 
          onClick={generalReportGenerator.generateGeneralReport}
          variant="outline"
          size="sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Relatório Geral
        </Button>
      )}
    </div>
  );
};

export default ClientReportButtons;
