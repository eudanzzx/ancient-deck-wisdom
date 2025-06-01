
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import PlanoPaymentControl from "./PlanoPaymentControl";

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

  return (
    <div className="mt-4">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Controle de Pagamentos do Plano
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2" />
        )}
      </Button>

      {isOpen && (
        <div className="mt-2">
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
