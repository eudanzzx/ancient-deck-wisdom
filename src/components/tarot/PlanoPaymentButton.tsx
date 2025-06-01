
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
          >
            <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">Controle de Pagamentos</span>
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-300",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-fade-in">
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
