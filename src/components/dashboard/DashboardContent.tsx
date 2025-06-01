
import React from "react";
import DashboardBirthdayNotifications from "@/components/DashboardBirthdayNotifications";
import TarotPlanoNotifications from "@/components/TarotPlanoNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import TratamentoCountdown from "@/components/TratamentoCountdown";
import PlanoPaymentReminders from "@/components/PlanoPaymentReminders";

interface DashboardContentProps {
  aniversarianteHoje: {nome: string, dataNascimento: string} | null;
  atendimentos: any[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  aniversarianteHoje,
  atendimentos,
}) => {
  return (
    <>
      <PlanoPaymentReminders />
      <DashboardBirthdayNotifications />
      <TarotPlanoNotifications />
      
      {aniversarianteHoje && (
        <ClientBirthdayAlert 
          clientName={aniversarianteHoje.nome}
          birthDate={aniversarianteHoje.dataNascimento}
          context="tarot"
        />
      )}

      <div className="transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1">
        <TratamentoCountdown analises={atendimentos} />
      </div>
    </>
  );
};

export default DashboardContent;
