
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, TrendingUp, Activity } from "lucide-react";

interface TarotStatsCardsProps {
  stats: {
    receitaTotal: number;
    receitaMesAtual: number;
    ticketMedio: number;
    analisesFinalizadas: number;
    analisesPendentes: number;
  };
}

const StatCard = memo(({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow duration-300 group">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-colors duration-300">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

const TarotStatsCards: React.FC<TarotStatsCardsProps> = memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Receita Total" 
        value={`R$ ${stats.receitaTotal.toFixed(2)}`} 
        icon={<DollarSign className="h-8 w-8 text-[#6B21A8]" />} 
      />
      <StatCard 
        title="Receita Mês Atual" 
        value={`R$ ${stats.receitaMesAtual.toFixed(2)}`}
        icon={<Calendar className="h-8 w-8 text-[#6B21A8]" />} 
      />
      <StatCard 
        title="Ticket Médio"
        value={`R$ ${stats.ticketMedio.toFixed(2)}`} 
        icon={<TrendingUp className="h-8 w-8 text-[#6B21A8]" />} 
      />
      <StatCard 
        title="Finalizadas/Pendentes" 
        value={`${stats.analisesFinalizadas}/${stats.analisesPendentes}`} 
        icon={<Activity className="h-8 w-8 text-[#6B21A8]" />} 
      />
    </div>
  );
});

TarotStatsCards.displayName = 'TarotStatsCards';

export default TarotStatsCards;
