
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Calendar } from "lucide-react";
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
        className="border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9] transition-colors duration-200 flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{paidWeeks}/{totalWeeks}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <SemanalPaymentControl
          analysisId={analysisId}
          clientName={clientName}
          semanalData={semanalData}
          startDate={startDate}
        />
      )}
    </div>
  );
};

export default SemanalPaymentButton;
