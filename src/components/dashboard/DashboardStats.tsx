
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  totalAtendimentos: number;
  atendimentosSemana: number;
  totalRecebido: number;
  periodoLabel: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalAtendimentos,
  atendimentosSemana,
  totalRecebido,
  periodoLabel
}) => {
  const stats = [
    {
      title: `Recebido (${periodoLabel})`,
      value: `R$ ${totalRecebido.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total de Atendimentos',
      value: totalAtendimentos.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Atendimentos (Semana)',
      value: atendimentosSemana.toString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Meta Mensal',
      value: 'R$ 5.000',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className={`${stat.bgColor} ${stat.borderColor} border-2 shadow-sm hover:shadow-md transition-all duration-200`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
