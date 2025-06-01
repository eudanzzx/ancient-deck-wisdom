
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, CreditCard } from "lucide-react";
import PlanoPaymentControl from "./PlanoPaymentControl";
import useUserDataService from "@/services/userDataService";

interface PlanoPaymentButtonProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
  };
  startDate: string;
}

const PlanoPaymentButton: React.FC<PlanoPaymentButtonProps> = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getPlanos } = useUserDataService();

  // Calcular quantos meses foram pagos
  const calculatePaidMonths = () => {
    const planos = getPlanos();
    const totalMonths = parseInt(planoData.meses);
    let paidCount = 0;
    
    for (let i = 1; i <= totalMonths; i++) {
      const planoForMonth = planos.find(plano => 
        plano.id.startsWith(`${analysisId}-month-${i}`)
      );
      
      if (planoForMonth && !planoForMonth.active) {
        paidCount++;
      }
    }
    
    return paidCount;
  };

  const paidMonths = calculatePaidMonths();
  const totalMonths = parseInt(planoData.meses);

  return (
    <div className="mt-4">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200 flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        <span className="font-medium">{paidMonths}/{totalMonths}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <PlanoPaymentControl
          analysisId={analysisId}
          clientName={clientName}
          planoData={planoData}
          startDate={startDate}
        />
      )}
    </div>
  );
};

export default PlanoPaymentButton;
