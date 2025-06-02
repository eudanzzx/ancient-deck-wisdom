
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PlanoSemanalPaymentControl from "./PlanoSemanalPaymentControl";
import useUserDataService from "@/services/userDataService";

interface PlanoSemanalPaymentButtonProps {
  analysisId: string;
  clientName: string;
  planoSemanalData: {
    semanas: string;
    valorSemanal: string;
  };
  startDate: string;
}

const PlanoSemanalPaymentButton: React.FC<PlanoSemanalPaymentButtonProps> = ({
  analysisId,
  clientName,
  planoSemanalData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getPlanos } = useUserDataService();

  // Calcular quantas semanas foram pagas
  const getPaidCount = () => {
    const planos = getPlanos();
    const totalWeeks = parseInt(planoSemanalData.semanas);
    let paidCount = 0;
    
    for (let i = 1; i <= totalWeeks; i++) {
      const planoForWeek = planos.find(plano => 
        plano.id.startsWith(`${analysisId}-week-${i}`)
      );
      
      if (planoForWeek && !planoForWeek.active) {
        paidCount++;
      }
    }
    
    return paidCount;
  };

  const paidCount = getPaidCount();
  const totalWeeks = parseInt(planoSemanalData.semanas);

  return (
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9] transition-colors duration-200 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {paidCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20 text-xs px-2 py-0.5"
              >
                {paidCount}/{totalWeeks}
              </Badge>
            )}
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <PlanoSemanalPaymentControl
            analysisId={analysisId}
            clientName={clientName}
            planoSemanalData={planoSemanalData}
            startDate={startDate}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PlanoSemanalPaymentButton;
