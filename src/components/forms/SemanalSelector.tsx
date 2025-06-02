
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface SemanalSelectorProps {
  semanalAtivo: boolean;
  semanalData: {
    semanas: string;
    valorSemanal: string;
  };
  onSemanalAtivoChange: (value: boolean) => void;
  onSemanalDataChange: (field: string, value: string) => void;
}

const SemanalSelector: React.FC<SemanalSelectorProps> = ({
  semanalAtivo,
  semanalData,
  onSemanalAtivoChange,
  onSemanalDataChange,
}) => {
  return (
    <div className="space-y-2 flex flex-col">
      <div className="flex items-center justify-between">
        <Label htmlFor="semanal" className="text-slate-700 font-medium flex items-center">
          <Calendar className={`mr-2 h-4 w-4 ${semanalAtivo ? "text-[#0EA5E9]" : "text-slate-400"}`} />
          SEMANAL
        </Label>
        <Switch 
          checked={semanalAtivo} 
          onCheckedChange={onSemanalAtivoChange} 
          className="data-[state=checked]:bg-[#0EA5E9]"
        />
      </div>
      
      {semanalAtivo && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="space-y-1">
            <Label className="text-sm text-slate-600">Semanas</Label>
            <Select onValueChange={(value) => onSemanalDataChange("semanas", value)}>
              <SelectTrigger className="bg-[#0EA5E9]/10 border-[#0EA5E9]/30 focus:border-[#0EA5E9]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(52)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} {i === 0 ? 'semana' : 'semanas'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-slate-600">Valor Semanal (R$)</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={semanalData.valorSemanal}
              onChange={(e) => onSemanalDataChange("valorSemanal", e.target.value)}
              className="bg-[#0EA5E9]/10 border-[#0EA5E9]/30 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SemanalSelector;
