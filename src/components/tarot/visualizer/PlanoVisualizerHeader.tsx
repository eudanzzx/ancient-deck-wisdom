
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface PlanoVisualizerHeaderProps {
  planoData: {
    meses: string;
    valorMensal: string;
  };
}

const PlanoVisualizerHeader: React.FC<PlanoVisualizerHeaderProps> = ({
  planoData,
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-[#0EA5E9]/5 to-[#0EA5E9]/10">
      <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
        <CreditCard className="h-5 w-5" />
        Controle de Pagamentos do Plano
      </CardTitle>
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>Total: {planoData.meses} meses</span>
        <span>Valor mensal: R$ {parseFloat(planoData.valorMensal).toFixed(2)}</span>
        <span className="text-orange-600 font-medium">Vencimento: Todo dia 30</span>
      </div>
    </CardHeader>
  );
};

export default PlanoVisualizerHeader;
