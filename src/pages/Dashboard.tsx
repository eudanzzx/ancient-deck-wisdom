
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
  const { getAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState([]);

  useEffect(() => {
    const fetchAtendimentos = () => {
      const data = getAtendimentos();
      setAtendimentos(data);
    };

    fetchAtendimentos();
  }, [getAtendimentos]);

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      <BirthdayNotifications />
      <TarotCounterNotifications />
      <TarotCounterPriorityNotifications />
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

        <DashboardStats />
        <AtendimentosTable />

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
