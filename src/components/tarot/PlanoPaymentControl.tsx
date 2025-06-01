
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X, CreditCard, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import useUserDataService from "@/services/userDataService";

interface PlanoPaymentControlProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
  };
  startDate: string;
}

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

const PlanoPaymentControl: React.FC<PlanoPaymentControlProps> = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoMonths, setPlanoMonths] = useState<PlanoMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    initializePlanoMonths();
  }, [analysisId, planoData, startDate]);

  const initializePlanoMonths = () => {
    const totalMonths = parseInt(planoData.meses);
    const baseDate = new Date(startDate);
    const planos = getPlanos();
    
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Verificar se este mês já foi pago
      const planoForMonth = planos.find(plano => 
        plano.id.startsWith(`${analysisId}-month-${i}`)
      );
      
      months.push({
        month: i,
        isPaid: planoForMonth ? !planoForMonth.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentDate: planoForMonth?.created ? new Date(planoForMonth.created).toISOString().split('T')[0] : undefined,
        planoId: planoForMonth?.id
      });
    }
    
    setPlanoMonths(months);
  };

  const handleSelectMonth = (monthNumber: number) => {
    setSelectedMonth(monthNumber);
    const month = planoMonths.find(m => m.month === monthNumber);
    if (month?.paymentDate) {
      setPaymentDate(new Date(month.paymentDate));
    } else {
      setPaymentDate(new Date());
    }
  };

  const handleMarkPayment = () => {
    if (selectedMonth === null || !paymentDate) return;

    const monthIndex = selectedMonth - 1;
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    
    if (month.planoId) {
      // Atualizar plano existente
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: false, created: paymentDate.toISOString() }
          : plano
      );
      savePlanos(updatedPlanos);
    } else {
      // Criar novo registro de plano
      const newPlano = {
        id: `${analysisId}-month-${selectedMonth}`,
        clientName: clientName,
        type: 'plano' as const,
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        month: selectedMonth,
        totalMonths: parseInt(planoData.meses),
        created: paymentDate.toISOString(),
        active: false // Não ativo porque foi pago
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
    }
    
    // Atualizar estado local
    const updatedMonths = [...planoMonths];
    updatedMonths[monthIndex] = {
      ...updatedMonths[monthIndex],
      isPaid: true,
      paymentDate: paymentDate.toISOString().split('T')[0]
    };
    setPlanoMonths(updatedMonths);
    
    toast.success(`Pagamento do mês ${selectedMonth} registrado para ${format(paymentDate, 'dd/MM/yyyy')}`);
    setSelectedMonth(null);
    setPaymentDate(undefined);
  };

  const handleUnmarkPayment = (monthNumber: number) => {
    const monthIndex = monthNumber - 1;
    const month = planoMonths[monthIndex];
    
    if (month.planoId) {
      const planos = getPlanos();
      const updatedPlanos = planos.filter(plano => plano.id !== month.planoId);
      savePlanos(updatedPlanos);
      
      // Atualizar estado local
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex] = {
        ...updatedMonths[monthIndex],
        isPaid: false,
        paymentDate: undefined,
        planoId: undefined
      };
      setPlanoMonths(updatedMonths);
      
      toast.success(`Pagamento do mês ${monthNumber} removido`);
    }
  };

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <Card className="mt-4 border-[#6B21A8]/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#6B21A8]/5 to-[#6B21A8]/10">
        <CardTitle className="flex items-center gap-2 text-[#6B21A8]">
          <CreditCard className="h-5 w-5" />
          Controle de Pagamentos - {clientName}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Total: {planoData.meses} meses</span>
          <span>Valor mensal: R$ {parseFloat(planoData.valorMensal).toFixed(2)}</span>
          <Badge variant="secondary" className="bg-[#6B21A8]/10 text-[#6B21A8]">
            {paidCount}/{planoMonths.length} pagos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lista de meses */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Selecione o mês para marcar pagamento:</h4>
            <div className="grid grid-cols-3 gap-2">
              {planoMonths.map((month) => (
                <Button
                  key={month.month}
                  variant={selectedMonth === month.month ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectMonth(month.month)}
                  className={cn(
                    "relative h-16 flex flex-col items-center justify-center",
                    month.isPaid && "bg-emerald-100 border-emerald-300 text-emerald-700",
                    selectedMonth === month.month && "bg-[#6B21A8] text-white"
                  )}
                >
                  {month.isPaid && (
                    <Check className="absolute top-1 right-1 h-3 w-3 text-emerald-600" />
                  )}
                  <span className="text-sm font-medium">Mês {month.month}</span>
                  {month.isPaid && month.paymentDate && (
                    <span className="text-xs opacity-75">
                      {format(new Date(month.paymentDate), 'dd/MM')}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Seletor de data e ações */}
          <div className="space-y-4">
            {selectedMonth && (
              <>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Data do pagamento - Mês {selectedMonth}:
                  </h4>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !paymentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {paymentDate ? format(paymentDate, "dd/MM/yyyy") : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={setPaymentDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleMarkPayment}
                    disabled={!paymentDate}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Marcar como Pago
                  </Button>
                  
                  {planoMonths[selectedMonth - 1]?.isPaid && (
                    <Button
                      onClick={() => handleUnmarkPayment(selectedMonth)}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Desmarcar
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-sm text-slate-600">Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-300 rounded"></div>
              <span className="text-sm text-slate-600">Pendente</span>
            </div>
          </div>
          
          <div className="text-sm text-slate-600">
            <span className="font-medium">R$ {paidValue.toFixed(2)}</span>
            <span className="text-slate-500"> / R$ {totalValue.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanoPaymentControl;
