
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
import SemanalPaymentButton from "@/components/tarot/SemanalPaymentButton";
import useUserDataService from "@/services/userDataService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { getAtendimentos, saveAtendimentos, getTarotAnalyses } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState([]);
  const [analises, setAnalises] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const atendimentosData = getAtendimentos();
      const analisesData = getTarotAnalyses();
      setAtendimentos(atendimentosData);
      setAnalises(analisesData);
    };

    fetchData();
  }, [getAtendimentos, getTarotAnalyses]);

  const handleDeleteAtendimento = (id: string) => {
    // Implement delete logic manually since there's no deleteAtendimento function
    const currentAtendimentos = getAtendimentos();
    const updatedAtendimentos = currentAtendimentos.filter(atendimento => atendimento.id !== id);
    saveAtendimentos(updatedAtendimentos);
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

  // Debug - Log atendimentos data
  console.log('Atendimentos no Dashboard:', atendimentos);

  // Debug específico para dados semanais
  console.log('=== DEBUG SEMANAL DETALHADO ===');
  atendimentos.forEach((atendimento: any, index: number) => {
    console.log(`Atendimento ${index + 1} (${atendimento.nome}):`, {
      id: atendimento.id,
      statusPagamento: atendimento.statusPagamento,
      semanalAtivo: atendimento.semanalAtivo,
      semanalData: atendimento.semanalData,
      allFields: Object.keys(atendimento)
    });
    
    // Verificar diferentes possíveis estruturas de dados semanais
    const hasSemanalData = !!(
      atendimento.semanalData || 
      atendimento.semanal || 
      atendimento.pagamentoSemanal ||
      (atendimento.semanas && atendimento.valorSemanal)
    );
    
    console.log(`-> Tem dados semanais: ${hasSemanalData}`);
    if (hasSemanalData) {
      console.log('-> Dados encontrados:', {
        semanalData: atendimento.semanalData,
        semanal: atendimento.semanal,
        pagamentoSemanal: atendimento.pagamentoSemanal,
        semanas: atendimento.semanas,
        valorSemanal: atendimento.valorSemanal
      });
    }
  });

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

        {/* Botões de Controle de Pagamento Semanal */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#0EA5E9] mb-4">Controles de Pagamento Semanal</h2>
          {atendimentos.map((atendimento: any) => {
            // Verificar múltiplas possíveis estruturas de dados semanais
            const semanalData = atendimento.semanalData || 
                               atendimento.semanal || 
                               atendimento.pagamentoSemanal ||
                               (atendimento.semanas && atendimento.valorSemanal ? {
                                 semanas: atendimento.semanas,
                                 valorSemanal: atendimento.valorSemanal
                               } : null);

            const hasValidSemanalData = !!(semanalData && 
              (semanalData.semanas || semanalData.numeroSemanas) && 
              (semanalData.valorSemanal || semanalData.valor));
            
            // Condições mais abrangentes para mostrar o controle semanal
            const shouldShow = !!(
              hasValidSemanalData ||
              atendimento.semanalAtivo ||
              atendimento.statusPagamento === 'parcelado'
            );

            console.log(`Verificando ${atendimento.nome}:`, {
              shouldShow,
              hasValidSemanalData,
              semanalData,
              statusPagamento: atendimento.statusPagamento,
              semanalAtivo: atendimento.semanalAtivo
            });

            if (shouldShow && hasValidSemanalData) {
              console.log('✅ Renderizando SemanalPaymentButton para:', atendimento.nome);
              
              // Normalizar os dados semanais
              const normalizedSemanalData = {
                semanas: semanalData.semanas || semanalData.numeroSemanas || '4',
                valorSemanal: semanalData.valorSemanal || semanalData.valor || '100'
              };

              return (
                <SemanalPaymentButton
                  key={`semanal-${atendimento.id}`}
                  analysisId={atendimento.id}
                  clientName={atendimento.nome}
                  semanalData={normalizedSemanalData}
                  startDate={atendimento.dataAtendimento || atendimento.data}
                />
              );
            } else {
              console.log('❌ NÃO renderizando para:', atendimento.nome, { shouldShow, hasValidSemanalData });
            }
            return null;
          })}
          
          {/* Exibir mensagem se não houver controles semanais */}
          {atendimentos.length > 0 && !atendimentos.some((atendimento: any) => {
            const semanalData = atendimento.semanalData || 
                               atendimento.semanal || 
                               atendimento.pagamentoSemanal ||
                               (atendimento.semanas && atendimento.valorSemanal ? {
                                 semanas: atendimento.semanas,
                                 valorSemanal: atendimento.valorSemanal
                               } : null);
            return !!(semanalData && (semanalData.semanas || semanalData.numeroSemanas) && (semanalData.valorSemanal || semanalData.valor));
          }) && (
            <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">Nenhum atendimento com pagamento semanal encontrado.</p>
              <p className="text-sm text-slate-500 mt-2">
                Para adicionar pagamentos semanais, edite um atendimento e configure o pagamento parcelado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
