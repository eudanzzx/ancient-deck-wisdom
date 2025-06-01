
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar } from "lucide-react";

interface PlanoPaymentHeaderProps {
  paidCount: number;
  totalMonths: number;
  planoData: {
    meses: string;
    valorMensal: string;
  };
}

const PlanoPaymentHeader: React.FC<PlanoPaymentHeaderProps> = ({
  paidCount,
  totalMonths,
  planoData,
}) => {
  const totalValue = totalMonths * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <CardHeader className="bg-gradient-to-r from-[#6B21A8]/5 to-[#6B21A8]/10">
      <CardTitle className="flex items-center gap-2 text-[#6B21A8]">
        <CreditCard className="h-5 w-5" />
        Controle de Pagamentos do Plano
        <Badge variant="secondary" className="bg-[#6B21A8]/10 text-[#6B21A8] ml-2">
          {paidCount}/{totalMonths}
        </Badge>
      </CardTitle>
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>Total: {planoData.meses} meses</span>
        <span>Valor mensal: R$ {parseFloat(planoData.valorMensal).toFixed(2)}</span>
        <span className="font-medium text-emerald-600">
          R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
        </span>
        <div className="flex items-center gap-1 text-orange-600 font-medium">
          <Calendar className="h-4 w-4" />
          <span>Vencimento: Dia 30</span>
        </div>
      </div>
    </CardHeader>
  );
};

export default PlanoPaymentHeader;
