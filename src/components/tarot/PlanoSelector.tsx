
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

interface PlanoSelectorProps {
  planoAtivo: boolean;
  planoMeses: string;
  planoValorMensal: string;
  onPlanoAtivoChange: (ativo: boolean) => void;
  onPlanoMesesChange: (meses: string) => void;
  onPlanoValorMensalChange: (valor: string) => void;
}

const predefinedPlans = [
  { meses: "3", valor: "100" },
  { meses: "6", valor: "90" },
  { meses: "12", valor: "80" },
];

const PlanoSelector: React.FC<PlanoSelectorProps> = ({
  planoAtivo,
  planoMeses,
  planoValorMensal,
  onPlanoAtivoChange,
  onPlanoMesesChange,
  onPlanoValorMensalChange,
}) => {
  const handlePlanSelect = (meses: string, valor: string) => {
    onPlanoMesesChange(meses);
    onPlanoValorMensalChange(valor);
    if (!planoAtivo) {
      onPlanoAtivoChange(true);
    }
  };

  const isSelected = (meses: string, valor: string) => {
    return planoAtivo && planoMeses === meses && planoValorMensal === valor;
  };

  return (
    <div className="space-y-4 p-4 border border-[#6B21A8]/20 rounded-lg bg-[#6B21A8]/5">
      <h3 className="text-lg font-medium text-[#6B21A8]">Plano de Pagamento</h3>
      
      <div className="flex items-center justify-between rounded-lg border p-3 bg-white/50">
        <div className="space-y-0.5">
          <Label className="text-base">Ativar Plano</Label>
          <div className="text-sm text-muted-foreground">
            Habilita o sistema de pagamento parcelado
          </div>
        </div>
        <Switch
          checked={planoAtivo}
          onCheckedChange={onPlanoAtivoChange}
        />
      </div>

      {planoAtivo && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {predefinedPlans.map((plan) => (
              <Card
                key={`${plan.meses}-${plan.valor}`}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected(plan.meses, plan.valor)
                    ? "border-[#6B21A8] bg-[#6B21A8]/10 shadow-md"
                    : "border-gray-200 bg-white/70 hover:border-[#6B21A8]/50"
                }`}
                onClick={() => handlePlanSelect(plan.meses, plan.valor)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{plan.meses} meses</span>
                    {isSelected(plan.meses, plan.valor) && (
                      <Check className="h-4 w-4 text-[#6B21A8]" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-[#6B21A8]">
                    R$ {plan.valor}/mês
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: R$ {(parseInt(plan.meses) * parseFloat(plan.valor)).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planoMeses">Quantidade de Meses</Label>
              <Input
                id="planoMeses"
                type="number"
                placeholder="Ex: 12"
                value={planoMeses}
                onChange={(e) => onPlanoMesesChange(e.target.value)}
                className="bg-white/50 border-[#6B21A8]/20 focus:border-[#6B21A8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planoValorMensal">Valor Mensal (R$)</Label>
              <Input
                id="planoValorMensal"
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                value={planoValorMensal}
                onChange={(e) => onPlanoValorMensalChange(e.target.value)}
                className="bg-white/50 border-[#6B21A8]/20 focus:border-[#6B21A8]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanoSelector;
