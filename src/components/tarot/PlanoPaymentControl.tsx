
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, CreditCard, CalendarIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
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
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      savePlanos(updatedPlanos);
    } else if (newIsPaid) {
      const newPlano = {
        id: `${analysisId}-month-${month.month}`,
        clientName: clientName,
        type: 'plano' as const,
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(planoData.meses),
        created: new Date().toISOString(),
        active: false
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);
    } else {
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = false;
      setPlanoMonths(updatedMonths);
    }
    
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
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/50 border border-[#6B21A8]/20 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header with gradient background */}
      <CardHeader className="bg-gradient-to-r from-[#6B21A8]/10 via-purple-100/50 to-violet-100/30 border-b border-[#6B21A8]/10 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B21A8]/5 to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-[#6B21A8] mb-3">
            <div className="p-2 bg-[#6B21A8]/10 rounded-xl">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">Controle de Pagamentos</span>
            <Badge variant="secondary" className="bg-[#6B21A8]/10 text-[#6B21A8] border-[#6B21A8]/20 font-medium px-3 py-1">
              {paidCount}/{planoMonths.length}
            </Badge>
          </CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-white/40">
              <CalendarIcon className="h-4 w-4 text-[#6B21A8]" />
              <div>
                <span className="text-slate-500">Total:</span>
                <span className="font-semibold text-slate-700 ml-1">{planoData.meses} meses</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-white/40">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="text-slate-500">Mensal:</span>
                <span className="font-semibold text-emerald-600 ml-1">R$ {parseFloat(planoData.valorMensal).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <span className="text-slate-600 font-medium">
                  R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {planoMonths.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-48 mx-auto"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-32 mx-auto"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium">Carregando meses do plano...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {planoMonths.map((month, index) => (
                <Button
                  key={month.month}
                  onClick={() => handlePaymentToggle(index)}
                  variant="outline"
                  className={`
                    relative h-auto min-h-[140px] p-4 flex flex-col items-center justify-center gap-3 
                    transition-all duration-500 hover:scale-110 hover:shadow-2xl group
                    border-2 rounded-2xl overflow-hidden backdrop-blur-sm
                    ${month.isPaid 
                      ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 text-white border-emerald-300 shadow-emerald-200/50 shadow-xl' 
                      : 'bg-gradient-to-br from-white via-slate-50 to-purple-50/30 hover:from-slate-50 hover:via-purple-50 hover:to-violet-100/50 border-slate-300 text-slate-700 shadow-slate-200/50 hover:border-[#6B21A8]/50 hover:shadow-xl'
                    }
                  `}
                >
                  {/* Decorative background */}
                  <div className={`
                    absolute inset-0 transition-opacity duration-500
                    ${month.isPaid 
                      ? 'bg-gradient-to-br from-white/20 via-transparent to-emerald-300/20' 
                      : 'bg-gradient-to-br from-[#6B21A8]/5 via-transparent to-purple-100/20 group-hover:opacity-100'
                    }
                  `} />
                  
                  {/* Floating sparkles for paid months */}
                  {month.isPaid && (
                    <div className="absolute inset-0 overflow-hidden">
                      <Sparkles className="absolute top-2 right-2 h-3 w-3 text-white/60 animate-pulse" />
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  )}
                  
                  {/* Status icon */}
                  <div className={`
                    absolute top-3 right-3 p-2 rounded-full transition-all duration-500
                    ${month.isPaid 
                      ? 'bg-white/20 text-white backdrop-blur-sm' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-[#6B21A8]/20 group-hover:text-[#6B21A8]'
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
                      text-2xl font-bold mb-1 transition-all duration-500
                      ${month.isPaid ? 'text-white' : 'text-slate-700 group-hover:text-[#6B21A8]'}
                    `}>
                      {month.month}º
                    </div>
                    <div className={`
                      text-xs font-semibold uppercase tracking-wider
                      ${month.isPaid ? 'text-white/90' : 'text-slate-500 group-hover:text-[#6B21A8]/80'}
                    `}>
                      Mês
                    </div>
                  </div>
                  
                  {/* Due date */}
                  <div className="relative z-10 text-center">
                    <div className={`
                      text-xs opacity-75 mb-1 transition-colors duration-500
                      ${month.isPaid ? 'text-white/80' : 'text-slate-500'}
                    `}>
                      Vencimento
                    </div>
                    <div className={`
                      text-sm font-medium transition-colors duration-500
                      ${month.isPaid ? 'text-white' : 'text-slate-600 group-hover:text-[#6B21A8]'}
                    `}>
                      {formatDate(month.dueDate)}
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <Badge 
                    variant="outline"
                    className={`
                      relative z-10 text-xs font-medium border transition-all duration-500
                      ${month.isPaid 
                        ? 'bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm' 
                        : 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:border-red-300'
                      }
                    `}
                  >
                    {month.isPaid ? 'Pago' : 'Pendente'}
                  </Badge>
                </Button>
              ))}
            </div>
            
            {/* Enhanced summary section */}
            <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-[#6B21A8]/20 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-200"></div>
                    <span className="text-sm font-semibold text-slate-700">Pago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full shadow-lg shadow-slate-200"></div>
                    <span className="text-sm font-semibold text-slate-700">Pendente</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-[#6B21A8]/10 to-purple-100/50 text-[#6B21A8] border border-[#6B21A8]/20 font-bold px-4 py-2 shadow-lg"
                  >
                    {paidCount}/{planoMonths.length} pagos
                  </Badge>
                  <div className="text-sm bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-700">
                      R$ {paidValue.toFixed(2)}
                    </span>
                    <span className="text-slate-500"> / R$ {totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanoPaymentControl;
