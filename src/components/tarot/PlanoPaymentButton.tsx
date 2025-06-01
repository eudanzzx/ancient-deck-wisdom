
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const { getPlanos } = useUserDataService();
  const navigate = useNavigate();

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

  const handleClick = () => {
    // Redirecionar para a página de marcar pagamentos
    // Você pode ajustar a rota conforme necessário
    navigate(`/marcar-pagamentos/${analysisId}`);
  };

  return (
    <div className="mt-4">
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200 flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        <span className="font-medium">{paidMonths}/{totalMonths}</span>
        <ChevronDown className="h-3 w-3 transition-transform duration-200" />
      </Button>
    </div>
  );
};

export default PlanoPaymentButton;
