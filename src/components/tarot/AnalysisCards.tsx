
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AnalysisCardsProps {
  analiseAntes: string;
  analiseDepois: string;
  onAnaliseAntesChange: (value: string) => void;
  onAnaliseDepoisChange: (value: string) => void;
}

const AnalysisCards: React.FC<AnalysisCardsProps> = memo(({
  analiseAntes,
  analiseDepois,
  onAnaliseAntesChange,
  onAnaliseDepoisChange
}) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white/50 border-slate-200/50">
        <CardHeader className="bg-slate-50/80 py-3">
          <CardTitle className="text-lg text-[#6B21A8]">ANÁLISE - ANTES</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea 
            placeholder="Descreva a situação antes do tratamento..." 
            className="min-h-[150px] bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
            value={analiseAntes}
            onChange={(e) => onAnaliseAntesChange(e.target.value)}
          />
        </CardContent>
      </Card>
      
      <Card className="bg-white/50 border-slate-200/50">
        <CardHeader className="bg-slate-50/80 py-3">
          <CardTitle className="text-lg text-[#6B21A8]">ANÁLISE - DEPOIS</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea 
            placeholder="Descreva os resultados após o tratamento..." 
            className="min-h-[150px] bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
            value={analiseDepois}
            onChange={(e) => onAnaliseDepoisChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
});

AnalysisCards.displayName = 'AnalysisCards';

export default AnalysisCards;
