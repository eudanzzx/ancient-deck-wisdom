
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, CreditCard } from "lucide-react";

interface PlanoPaymentTrackerProps {
  clientName: string;
  totalMonths: number;
  monthlyValue: string;
  startDate: string;
  onPaymentUpdate?: (payments: boolean[]) => void;
}

const PlanoPaymentTracker: React.FC<PlanoPaymentTrackerProps> = ({
  clientName,
  totalMonths,
  monthlyValue,
  startDate,
  onPaymentUpdate
}) => {
  const [payments, setPayments] = useState<boolean[]>(new Array(totalMonths).fill(false));

  const togglePayment = (monthIndex: number) => {
    const newPayments = [...payments];
    newPayments[monthIndex] = !newPayments[monthIndex];
    setPayments(newPayments);
    onPaymentUpdate?.(newPayments);
  };

  const getMonthDate = (monthIndex: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthIndex + 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const paidCount = payments.filter(p => p).length;

  return (
    <Card className="mt-4 bg-white/90 backdrop-blur-sm border border-[#0EA5E9]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
          <CreditCard className="h-5 w-5" />
          Controle de Pagamentos - {clientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Informações do Plano */}
        <div className="mb-8">
          <h4 className="font-bold text-slate-800 mb-4">Plano Contratado</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex items-center">
              <span className="font-bold text-slate-700 w-32">Total de Meses:</span>
              <span className="text-slate-600 ml-3">{totalMonths} meses</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-slate-700 w-32">Valor Mensal:</span>
              <span className="text-slate-600 ml-3">R$ {parseFloat(monthlyValue).toFixed(2)}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-slate-700 w-32">Pagamentos:</span>
              <Badge variant="secondary" className="bg-[#0EA5E9]/10 text-[#0EA5E9] ml-3">
                {paidCount}/{totalMonths} pagos
              </Badge>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-slate-700 w-32">Total Pago:</span>
              <span className="text-emerald-600 font-medium ml-3">R$ {(paidCount * parseFloat(monthlyValue)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Controle de Pagamentos */}
        <div className="mb-6">
          <h4 className="font-bold text-slate-800 mb-4">Controle de Pagamentos</h4>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {Array.from({ length: totalMonths }, (_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePayment(index)}
                  className={`w-12 h-12 p-0 border-2 transition-colors ${
                    payments[index]
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-rose-100 border-rose-500 text-rose-700 hover:bg-rose-200'
                  }`}
                >
                  {payments[index] ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-xs mt-1 text-center font-medium">
                  Mês {index + 1}
                </span>
                <span className="text-xs text-slate-500 text-center">
                  {getMonthDate(index)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Legenda */}
        <div className="flex items-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-sm text-slate-600">Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded"></div>
            <span className="text-sm text-slate-600">Pendente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanoPaymentTracker;
