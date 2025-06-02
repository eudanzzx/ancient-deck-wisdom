
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, X, CreditCard, CalendarIcon, ChevronDown } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

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

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    
    const newIsPaid = !month.isPaid;
    
    if (month.planoId) {
      // Atualizar o status do plano existente
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: !newIsPaid } // Se vai ser marcado como pago, plano não fica ativo
          : plano
      );
      savePlanos(updatedPlanos);
    } else if (newIsPaid) {
      // Criar novo registro de plano quando marcar como pago
      const newPlano = {
        id: `${analysisId}-month-${month.month}`,
        clientName: clientName,
        type: 'plano' as const,
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(planoData.meses),
        created: new Date().toISOString(),
        active: false // Não ativo porque foi pago
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
      
      // Atualizar o planoId no estado local
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);
    } else {
      // Atualizar apenas o estado local se está desmarcando um mês que não tinha planoId
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = false;
      setPlanoMonths(updatedMonths);
    }
    
    // Se não criou novo plano, atualizar estado local
    if (month.planoId || !newIsPaid) {
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = newIsPaid;
      setPlanoMonths(updatedMonths);
    }
    
    toast.success(
      newIsPaid 
        ? `Mês ${month.month} marcado como pago` 
        : `Mês ${month.month} marcado como pendente`
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mt-4 border-[#6B21A8]/20 shadow-lg">
        <CollapsibleTrigger asChild>
          <CardHeader className="bg-gradient-to-r from-[#6B21A8]/5 to-[#6B21A8]/10 cursor-pointer hover:from-[#6B21A8]/10 hover:to-[#6B21A8]/15 transition-all duration-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#6B21A8]">
                <CreditCard className="h-5 w-5" />
                Controle de Pagamentos do Plano
                <Badge variant="secondary" className="bg-[#6B21A8]/10 text-[#6B21A8] ml-2">
                  {paidCount}/{planoMonths.length}
                </Badge>
              </CardTitle>
              <ChevronDown className={cn(
                "h-5 w-5 text-[#6B21A8] transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Total: {planoData.meses} meses</span>
              <span>Valor mensal: R$ {parseFloat(planoData.valorMensal).toFixed(2)}</span>
              <span className="font-medium text-emerald-600">
                R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
              </span>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-6">
            {planoMonths.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-32 mx-auto"></div>
                </div>
                <p className="mt-4">Carregando meses do plano...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {planoMonths.map((month, index) => (
                    <Button
                      key={month.month}
                      onClick={() => handlePaymentToggle(index)}
                      variant="outline"
                      className={`
                        relative h-auto min-h-[120px] p-4 flex flex-col items-center justify-center gap-3 
                        transition-all duration-300 hover:scale-105 hover:shadow-xl group
                        border-2 rounded-xl overflow-hidden
                        ${month.isPaid 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400 shadow-emerald-200/50' 
                          : 'bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 border-slate-300 text-slate-700 shadow-slate-200/50 hover:border-[#6B21A8]/50'
                        }
                      `}
                    >
                      {/* Background decoration */}
                      <div className={`
                        absolute inset-0 opacity-10 transition-opacity duration-300
                        ${month.isPaid 
                          ? 'bg-gradient-to-br from-white/20 to-transparent' 
                          : 'bg-gradient-to-br from-[#6B21A8]/10 to-transparent group-hover:opacity-20'
                        }
                      `} />
                      
                      {/* Status icon */}
                      <div className={`
                        absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300
                        ${month.isPaid 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-200 text-slate-500 group-hover:bg-[#6B21A8]/20 group-hover:text-[#6B21A8]'
                        }
                      `}>
                        {month.isPaid ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </div>
                      
                      {/* Month number */}
                      <div className="relative z-10 text-center">
                        <div className={`
                          text-2xl font-bold mb-1 transition-colors duration-300
                          ${month.isPaid ? 'text-white' : 'text-slate-700 group-hover:text-[#6B21A8]'}
                        `}>
                          {month.month}º
                        </div>
                        <div className={`
                          text-xs font-medium uppercase tracking-wider
                          ${month.isPaid ? 'text-white/90' : 'text-slate-500 group-hover:text-[#6B21A8]/80'}
                        `}>
                          Mês
                        </div>
                      </div>
                      
                      {/* Due date */}
                      <div className="relative z-10 text-center">
                        <div className={`
                          text-xs opacity-75 mb-1 transition-colors duration-300
                          ${month.isPaid ? 'text-white/80' : 'text-slate-500'}
                        `}>
                          Vencimento
                        </div>
                        <div className={`
                          text-sm font-medium transition-colors duration-300
                          ${month.isPaid ? 'text-white' : 'text-slate-600 group-hover:text-[#6B21A8]'}
                        `}>
                          {formatDate(month.dueDate)}
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      <Badge 
                        variant="outline"
                        className={`
                          relative z-10 text-xs font-medium border transition-all duration-300
                          ${month.isPaid 
                            ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                            : 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:border-red-300'
                          }
                        `}
                      >
                        {month.isPaid ? 'Pago' : 'Pendente'}
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                {/* Summary section */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
                      <span className="text-sm font-medium text-slate-700">Pago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full shadow-sm"></div>
                      <span className="text-sm font-medium text-slate-700">Pendente</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-[#6B21A8]/10 text-[#6B21A8] border border-[#6B21A8]/20 font-medium px-3 py-1"
                    >
                      {paidCount}/{planoMonths.length} pagos
                    </Badge>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">
                        R$ {paidValue.toFixed(2)}
                      </span>
                      <span className="text-slate-500"> / R$ {totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PlanoPaymentControl;
