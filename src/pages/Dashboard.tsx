
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
import PlanoNotifications from "@/components/PlanoNotifications";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import TarotCounterNotifications from "@/components/TarotCounterNotifications";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import TarotPlanoNotifications from "@/components/TarotPlanoNotifications";
import PlanoPaymentControl from "@/components/tarot/PlanoPaymentControl";
import SemanalPaymentControl from "@/components/forms/SemanalPaymentControl";
import useUserDataService from "@/services/userDataService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { getAtendimentos, deleteAtendimento, getAnalises } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState([]);
  const [analises, setAnalises] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const atendimentosData = getAtendimentos();
      const analisesData = getAnalises();
      setAtendimentos(atendimentosData);
      setAnalises(analisesData);
    };

    fetchData();
  }, [getAtendimentos, getAnalises]);

  const handleDeleteAtendimento = (id: string) => {
    deleteAtendimento(id);
    const updatedAtendimentos = getAtendimentos();
    setAtendimentos(updatedAtendimentos);
  };

  // Calculate stats
  const calculateStats = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const thisMonth = atendimentos.filter((atendimento: any) => {
      const date = new Date(atendimento.dataAtendimento || atendimento.data);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const thisWeek = atendimentos.filter((atendimento: any) => {
      const date = new Date(atendimento.dataAtendimento || atendimento.data);
      return date >= startOfWeek;
    });

    const totalRecebido = thisMonth.reduce((sum: number, atendimento: any) => {
      return sum + parseFloat(atendimento.valor || '0');
    }, 0);

    return {
      totalAtendimentos: atendimentos.length,
      atendimentosSemana: thisWeek.length,
      totalRecebido,
      periodoLabel: "Mês Atual"
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      <BirthdayNotifications />
      <TarotCounterNotifications analises={analises} />
      <TarotCounterPriorityNotifications analises={analises} />
      <TarotPlanoNotifications />
      <PlanoNotifications />
      
      <div className="container mx-auto px-4 py-6 mt-20">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0EA5E9]">
            Dashboard de Atendimentos
          </h1>
          <div className="flex gap-3">
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
              onClick={() => navigate("/novo-atendimento")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Atendimento
            </Button>
            <Button 
              variant="outline"
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
              onClick={() => navigate("/analise-frequencial")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Análise Tarot
            </Button>
          </div>
        </div>

        <DashboardStats 
          totalAtendimentos={stats.totalAtendimentos}
          atendimentosSemana={stats.atendimentosSemana}
          totalRecebido={stats.totalRecebido}
          periodoLabel={stats.periodoLabel}
        />
        <AtendimentosTable 
          atendimentos={atendimentos}
          onDeleteAtendimento={handleDeleteAtendimento}
        />

        {/* Controles de Pagamento para Atendimentos com Planos */}
        {atendimentos.map((atendimento: any) => {
          if (atendimento.planoAtivo && atendimento.planoData) {
            return (
              <PlanoPaymentControl
                key={`plano-${atendimento.id}`}
                analysisId={atendimento.id}
                clientName={atendimento.nome}
                planoData={atendimento.planoData}
                startDate={atendimento.dataAtendimento || atendimento.data}
              />
            );
          }
          return null;
        })}

        {/* Controles de Pagamento para Atendimentos com Recorrência Semanal */}
        {atendimentos.map((atendimento: any) => {
          if (atendimento.semanalAtivo && atendimento.semanalData) {
            return (
              <SemanalPaymentControl
                key={`semanal-${atendimento.id}`}
                atendimentoId={atendimento.id}
                clientName={atendimento.nome}
                semanalData={atendimento.semanalData}
                startDate={atendimento.dataAtendimento || atendimento.data}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Dashboard;
