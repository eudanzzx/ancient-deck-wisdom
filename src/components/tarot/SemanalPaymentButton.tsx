
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import SemanalPaymentControl from "./SemanalPaymentControl";

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
  const [isOpen, setIsOpen] = useState(false); // Mudando para false (fechado por padrão)

  return (
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981] transition-colors duration-200 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Pagamentos Semanais
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SemanalPaymentControl
            analysisId={analysisId}
            clientName={clientName}
            semanalData={semanalData}
            startDate={startDate}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SemanalPaymentButton;
