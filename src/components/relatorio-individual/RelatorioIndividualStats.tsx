
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, BarChart3, Users } from 'lucide-react';

interface RelatorioIndividualStatsProps {
  totalValue: string;
  totalConsultas: number;
  totalClientes: number;
}

const DashboardCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-blue-600/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const RelatorioIndividualStats: React.FC<RelatorioIndividualStatsProps> = ({
  totalValue,
  totalConsultas,
  totalClientes
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <DashboardCard 
        title="Total Arrecadado" 
        value={`R$ ${totalValue}`} 
        icon={<DollarSign className="h-8 w-8 text-blue-600" />} 
      />
      <DashboardCard 
        title="Total Consultas" 
        value={totalConsultas.toString()} 
        icon={<BarChart3 className="h-8 w-8 text-blue-600" />} 
      />
      <DashboardCard 
        title="Clientes Únicos" 
        value={totalClientes.toString()} 
        icon={<Users className="h-8 w-8 text-blue-600" />} 
      />
    </div>
  );
};

export default RelatorioIndividualStats;
