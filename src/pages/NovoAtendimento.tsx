import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AtendimentoForm from "@/components/forms/AtendimentoForm";
import useAtendimentoForm from "@/hooks/useAtendimentoForm";
import SemanalPaymentNotifications from "@/components/SemanalPaymentNotifications";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

const NovoAtendimento = () => {
  const navigate = useNavigate();
  const { getAtendimentos, saveAtendimentos, savePlanos, getPlanos } = useUserDataService();
  
  const {
    formData,
    dataNascimento,
    signo,
    atencao,
    planoAtivo,
    semanalAtivo,
    planoData,
    semanalData,
    handleInputChange,
    handleSelectChange,
    handlePlanoDataChange,
    handleSemanalDataChange,
    handleDataNascimentoChange,
    setAtencao,
    setPlanoAtivo,
    setSemanalAtivo,
  } = useAtendimentoForm();

  const getNextFridays = (totalWeeks: number): Date[] => {
    const fridays: Date[] = [];
    const today = new Date();
    
    // Encontrar a próxima sexta-feira
    let nextFriday = new Date(today);
    const currentDay = today.getDay(); // 0 = domingo, 1 = segunda, ..., 5 = sexta, 6 = sábado
    
    console.log('Hoje é dia:', currentDay, 'Data:', today.toDateString());
    
    // Calcular quantos dias adicionar para chegar na próxima sexta-feira
    let daysToAdd;
    if (currentDay === 5) {
      // Se hoje é sexta-feira, a próxima é em 7 dias
      daysToAdd = 7;
    } else if (currentDay < 5) {
      // Se é antes de sexta-feira (domingo=0 a quinta=4)
      daysToAdd = 5 - currentDay;
    } else {
      // Se é sábado (6)
      daysToAdd = 6; // 6 dias depois do sábado é sexta
    }
    
    console.log('Dias para adicionar:', daysToAdd);
    
    nextFriday.setDate(today.getDate() + daysToAdd);
    console.log('Primeira sexta-feira:', nextFriday.toDateString(), 'Dia da semana:', nextFriday.getDay());
    
    // Gerar as próximas sextas-feiras
    for (let i = 0; i < totalWeeks; i++) {
      const friday = new Date(nextFriday);
      friday.setDate(nextFriday.getDate() + (i * 7));
      console.log(`Sexta-feira ${i + 1}:`, friday.toDateString(), 'Dia da semana:', friday.getDay());
      fridays.push(friday);
    }
    
    return fridays;
  };

  const createPlanoNotifications = (nomeCliente: string, meses: string, valorMensal: string, dataInicio: string) => {
    const notifications: PlanoMensal[] = [];
    const startDate = new Date(dataInicio);
    
    for (let i = 1; i <= parseInt(meses); i++) {
      const notificationDate = new Date(startDate);
      notificationDate.setMonth(notificationDate.getMonth() + i);
      
      notifications.push({
        id: `plano-${Date.now()}-${i}`,
        clientName: nomeCliente,
        type: 'plano',
        amount: parseFloat(valorMensal),
        dueDate: notificationDate.toISOString().split('T')[0],
        month: i,
        totalMonths: parseInt(meses),
        created: new Date().toISOString(),
        active: true
      });
    }
    
    return notifications;
  };

  const createSemanalNotifications = (nomeCliente: string, semanas: string, valorSemanal: string, dataInicio: string) => {
    const notifications: PlanoSemanal[] = [];
    const totalWeeks = parseInt(semanas);
    const fridays = getNextFridays(totalWeeks);
    
    fridays.forEach((friday, index) => {
      notifications.push({
        id: `semanal-${Date.now()}-${index + 1}`,
        clientName: nomeCliente,
        type: 'semanal',
        amount: parseFloat(valorSemanal),
        dueDate: friday.toISOString().split('T')[0],
        week: index + 1,
        totalWeeks: totalWeeks,
        created: new Date().toISOString(),
        active: true
      });
    });
    
    return notifications;
  };

  const handleSaveAndFinish = () => {
    const existingAtendimentos = getAtendimentos();
    
    const novoAtendimento = {
      id: Date.now().toString(),
      ...formData,
      statusPagamento: formData.statusPagamento as 'pago' | 'pendente' | 'parcelado',
      signo,
      atencaoFlag: atencao,
      data: new Date().toISOString(),
      planoAtivo,
      planoData: planoAtivo ? planoData : null,
      semanalAtivo,
      semanalData: semanalAtivo ? semanalData : null,
    };
    
    existingAtendimentos.push(novoAtendimento);
    saveAtendimentos(existingAtendimentos);
    
    // Criar notificações de plano se ativo
    if (planoAtivo && planoData.meses && planoData.valorMensal && formData.dataAtendimento) {
      const notifications = createPlanoNotifications(
        formData.nome,
        planoData.meses,
        planoData.valorMensal,
        formData.dataAtendimento
      );
      
      const existingPlanos = getPlanos() || [];
      const updatedPlanos = [...existingPlanos, ...notifications];
      savePlanos(updatedPlanos);
      
      toast.success(`Atendimento salvo! Plano de ${planoData.meses} meses criado com sucesso.`);
    }
    
    // Criar notificações semanais se ativo
    if (semanalAtivo && semanalData.semanas && semanalData.valorSemanal && formData.dataAtendimento) {
      const notifications = createSemanalNotifications(
        formData.nome,
        semanalData.semanas,
        semanalData.valorSemanal,
        formData.dataAtendimento
      );
      
      const existingPlanos = getPlanos() || [];
      const updatedPlanos = [...existingPlanos, ...notifications];
      savePlanos(updatedPlanos);
      
      if (!planoAtivo) {
        toast.success(`Atendimento salvo! Plano semanal de ${semanalData.semanas} semanas criado com sucesso. Vencimentos toda sexta-feira.`);
      }
    }
    
    // Se nenhum plano foi criado
    if (!planoAtivo && !semanalAtivo) {
      toast.success("Atendimento salvo com sucesso!");
    }
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      <BirthdayNotifications checkOnMount={false} />
      <SemanalPaymentNotifications />
      
      <div className="container mx-auto px-4 py-6 mt-20">
        <div className="mb-6 flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-[#0EA5E9] hover:bg-white/80 hover:text-[#0EA5E9] transition-all duration-200" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-[#0EA5E9]">
            Novo Atendimento
          </h1>
        </div>

        <ClientBirthdayAlert 
          clientName={formData.nome}
          birthDate={formData.dataNascimento}
          context="atendimento"
        />

        <AtendimentoForm
          formData={formData}
          dataNascimento={dataNascimento}
          signo={signo}
          atencao={atencao}
          planoAtivo={planoAtivo}
          semanalAtivo={semanalAtivo}
          planoData={planoData}
          semanalData={semanalData}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onDataNascimentoChange={handleDataNascimentoChange}
          onAtencaoChange={setAtencao}
          onPlanoAtivoChange={setPlanoAtivo}
          onSemanalAtivoChange={setSemanalAtivo}
          onPlanoDataChange={handlePlanoDataChange}
          onSemanalDataChange={handleSemanalDataChange}
        />

        <CardFooter className="flex justify-end gap-3 border-t border-white/10 px-0 py-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="border-white/20 text-slate-600 hover:bg-white/50"
          >
            Cancelar
          </Button>
          <Button 
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
            onClick={handleSaveAndFinish}
          >
            <Save className="h-4 w-4 mr-2" />
            Finalizar Atendimento
          </Button>
        </CardFooter>
      </div>
    </div>
  );
};

export default NovoAtendimento;
