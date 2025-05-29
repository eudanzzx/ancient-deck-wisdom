
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PeriodSelectorProps {
  periodoVisualizacao: string;
  setPeriodoVisualizacao: (value: string) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  periodoVisualizacao, 
  setPeriodoVisualizacao 
}) => {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="text-center mb-4">
        <p className="text-slate-600 text-base mb-4">Visão geral dos atendimentos</p>
      </div>
      
      <ToggleGroup 
        type="single" 
        value={periodoVisualizacao} 
        onValueChange={(value: string) => {
          if (value) setPeriodoVisualizacao(value);
        }}
        className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-1"
      >
        <ToggleGroupItem 
          value="dia" 
          className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white text-slate-600 transition-all duration-200 px-3 py-1 text-sm rounded-md"
        >
          Dia
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="semana" 
          className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white text-slate-600 transition-all duration-200 px-3 py-1 text-sm rounded-md"
        >
          Semana
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="mes" 
          className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white text-slate-600 transition-all duration-200 px-3 py-1 text-sm rounded-md"
        >
          Mês
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="ano" 
          className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white text-slate-600 transition-all duration-200 px-3 py-1 text-sm rounded-md"
        >
          Ano
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default PeriodSelector;
