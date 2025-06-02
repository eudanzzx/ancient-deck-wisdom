
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    if (!planos || planos.length === 0) return 0;
    
    const totalMonths = parseInt(planoData.meses);
    const planRecords = planos.filter(p => 
      p.id.startsWith(`${analysisId}-month-`) && 
      p.type === 'plano'
    );
    
    // Count paid months (active: false means paid)
    const paidCount = planRecords.filter(p => !p.active).length;
    return Math.min(paidCount, totalMonths);
  };

  const paidMonths = calculatePaidMonths();
  const totalMonths = parseInt(planoData.meses);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4">
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
      >
        <CreditCard className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        <Badge 
          variant="secondary" 
          className="bg-[#6B21A8]/10 text-[#6B21A8] border-[#6B21A8]/20 text-xs px-2 py-0.5"
        >
          {paidMonths}/{totalMonths}
        </Badge>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="transform transition-all duration-300 animate-fade-in">
          <PlanoPaymentControl
            analysisId={analysisId}
            clientName={clientName}
            planoData={planoData}
            startDate={startDate}
          />
        </div>
      )}
    </div>
  );
};

export default PlanoPaymentButton;
