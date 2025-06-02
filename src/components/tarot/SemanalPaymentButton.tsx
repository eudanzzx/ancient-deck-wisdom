
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SemanalPaymentControl from "./SemanalPaymentControl";
import useUserDataService from "@/services/userDataService";

interface SemanalPaymentButtonProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
  };
  startDate: string;
}

const SemanalPaymentButton: React.FC<SemanalPaymentButtonProps> = ({
  analysisId,
  clientName,
  semanalData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getSemanalPayments } = useUserDataService();

  // Calcular quantas semanas foram pagas
  const calculatePaidWeeks = () => {
    const payments = getSemanalPayments(analysisId);
    if (!payments || payments.length === 0) return 0;
    
    const paidCount = payments.filter(paid => paid).length;
    const totalWeeks = parseInt(semanalData.semanas);
    return Math.min(paidCount, totalWeeks);
  };

  const paidWeeks = calculatePaidWeeks();
  const totalWeeks = parseInt(semanalData.semanas);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4">
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className="border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9] transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
      >
        <Calendar className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        <Badge 
          variant="secondary" 
          className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20 text-xs px-2 py-0.5"
        >
          {paidWeeks}/{totalWeeks}
        </Badge>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="transform transition-all duration-300 animate-fade-in">
          <SemanalPaymentControl
            analysisId={analysisId}
            clientName={clientName}
            semanalData={semanalData}
            startDate={startDate}
          />
        </div>
      )}
    </div>
  );
};

export default SemanalPaymentButton;
