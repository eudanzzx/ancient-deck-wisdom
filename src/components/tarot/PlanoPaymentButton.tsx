
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

  // Calcular quantas parcelas foram pagas
  const getPaidCount = () => {
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

  const paidCount = getPaidCount();
  const totalMonths = parseInt(planoData.meses);

  return (
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {paidCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-[#6B21A8]/10 text-[#6B21A8] border-[#6B21A8]/20 text-xs px-2 py-0.5"
              >
                {paidCount}/{totalMonths}
              </Badge>
            )}
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <PlanoPaymentControl
            analysisId={analysisId}
            clientName={clientName}
            planoData={planoData}
            startDate={startDate}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PlanoPaymentButton;
