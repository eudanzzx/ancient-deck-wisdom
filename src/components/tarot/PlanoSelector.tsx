
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";

interface PlanoSelectorProps {
  planoAtivo: boolean;
  planoData: {
    meses: string;
    valorMensal: string;
  };
  onPlanoAtivoChange: (value: boolean) => void;
  onPlanoDataChange: (field: string, value: string) => void;
}

const PlanoSelector: React.FC<PlanoSelectorProps> = ({
  planoAtivo,
  planoData,
  onPlanoAtivoChange,
  onPlanoDataChange,
}) => {
  return (
    <div className="space-y-2 flex flex-col">
      <div className="flex items-center justify-between">
        <Label htmlFor="plano" className="text-slate-700 font-medium flex items-center">
          <CreditCard className={`mr-2 h-4 w-4 ${planoAtivo ? "text-[#6B21A8]" : "text-slate-400"}`} />
          PLANO
        </Label>
        <Switch 
          checked={planoAtivo} 
          onCheckedChange={onPlanoAtivoChange} 
          className="data-[state=checked]:bg-[#6B21A8]"
        />
      </div>
      
      {planoAtivo && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="space-y-1">
            <Label className="text-sm text-slate-600">Meses</Label>
            <Select onValueChange={(value) => onPlanoDataChange("meses", value)}>
              <SelectTrigger className="bg-[#6B21A8]/10 border-[#6B21A8]/30 focus:border-[#6B21A8]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(24)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} {i === 0 ? 'mês' : 'meses'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-slate-600">Valor Mensal (R$)</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={planoData.valorMensal}
              onChange={(e) => onPlanoDataChange("valorMensal", e.target.value)}
              className="bg-[#6B21A8]/10 border-[#6B21A8]/30 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanoSelector;
