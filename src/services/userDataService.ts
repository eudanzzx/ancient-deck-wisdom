
import { useState, useEffect } from "react";

interface Atendimento {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataNascimento?: string;
  signo?: string;
  destino?: string;
  ano?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  atencaoNota?: string;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
  } | null;
}

interface TarotAnalysis {
  id: string;
  nomeCliente: string;
  dataNascimento: string;
  signo: string;
  atencao: boolean;
  dataInicio: string;
  preco: string;
  pergunta: string;
  resposta: string;
  escolha1?: string;
  resposta1?: string;
  escolha2?: string;
  resposta2?: string;
  escolha3?: string;
  resposta3?: string;
  escolha4?: string;
  resposta4?: string;
  escolha5?: string;
  resposta5?: string;
  detalhesAdicionais?: string;
  dataAnalise: string;
  status?: 'ativo' | 'concluido';
  finalizado: boolean;
  valor?: string;
  tipoServico?: string;
  cartasEscolhidas?: string[];
  significados?: string[];
  observacoes?: string;
  dataAtualizacao?: string;
  // Additional fields for compatibility
  orientacoes?: string;
  pontosPotenciais?: string;
  alertas?: string;
  analiseAntes?: string;
  analiseDepois?: string;
  lembretes?: Array<{
    id: number;
    texto: string;
    dias: number;
  }>;
  atencaoFlag?: boolean;
  // Plan fields
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
  } | null;
  // Weekly plan fields
  planoSemanalAtivo?: boolean;
  planoSemanalData?: {
    semanas: string;
    valorSemanal: string;
  } | null;
  dataAtendimento?: string;
  data?: string;
}

interface Plano {
  id: string;
  clientName: string;
  type: 'plano' | 'planoSemanal';
  amount: number;
  dueDate: string;
  month: number;
  totalMonths: number;
  created: string;
  active: boolean;
}

const useUserDataService = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  // Atendimentos functions
  const getAtendimentos = (): Atendimento[] => {
    try {
      const data = localStorage.getItem("atendimentos");
      const result = data ? JSON.parse(data) : [];
      console.log('getAtendimentos - Retornando:', result.length, 'atendimentos');
      return result;
    } catch (error) {
      console.error("Erro ao carregar atendimentos:", error);
      return [];
    }
  };

  const saveAtendimentos = (atendimentos: Atendimento[]): void => {
    try {
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
      console.log('saveAtendimentos - Salvou:', atendimentos.length, 'atendimentos');
    } catch (error) {
      console.error("Erro ao salvar atendimentos:", error);
    }
  };

  // Tarot Analysis functions - improved with better error handling and logging
  const getTarotAnalyses = (): TarotAnalysis[] => {
    try {
      const data = localStorage.getItem("analises");
      const result = data ? JSON.parse(data) : [];
      console.log('getTarotAnalyses - Carregou:', result.length, 'análises do localStorage');
      return result;
    } catch (error) {
      console.error("Erro ao carregar análises:", error);
      return [];
    }
  };

  const saveTarotAnalyses = (analyses: TarotAnalysis[]): void => {
    try {
      console.log('saveTarotAnalyses - Salvando:', analyses.length, 'análises');
      localStorage.setItem("analises", JSON.stringify(analyses));
      
      // Verificar se foi salvo corretamente
      const verificacao = localStorage.getItem("analises");
      const analisesVerificacao = verificacao ? JSON.parse(verificacao) : [];
      console.log('saveTarotAnalyses - Verificação após salvar:', analisesVerificacao.length, 'análises');
      
      if (analisesVerificacao.length !== analyses.length) {
        console.error('saveTarotAnalyses - ERRO: Quantidade não confere após salvar!');
      }
    } catch (error) {
      console.error("Erro ao salvar análises:", error);
    }
  };

  // Enhanced tarot analysis functions with plan support
  const saveTarotAnalysisWithPlan = (analysis: TarotAnalysis): void => {
    try {
      console.log('saveTarotAnalysisWithPlan - Salvando análise:', analysis.id);
      
      // Save the analysis
      const analyses = getTarotAnalyses();
      const updatedAnalyses = [...analyses, analysis];
      saveTarotAnalyses(updatedAnalyses);

      // If analysis has an active plan, create plan records
      if (analysis.planoAtivo && analysis.planoData) {
        const planos = getPlanos();
        const totalMonths = parseInt(analysis.planoData.meses);
        const monthlyValue = parseFloat(analysis.planoData.valorMensal);
        
        // Use analysis start date or current date
        const startDate = new Date(analysis.dataInicio || analysis.dataAtendimento || new Date());
        
        for (let i = 1; i <= totalMonths; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          
          const plano: Plano = {
            id: `${analysis.id}-month-${i}`,
            clientName: analysis.nomeCliente,
            type: 'plano',
            amount: monthlyValue,
            dueDate: dueDate.toISOString().split('T')[0],
            month: i,
            totalMonths: totalMonths,
            created: new Date().toISOString(),
            active: true // Start as active (unpaid)
          };
          
          planos.push(plano);
        }
        
        savePlanos(planos);
        console.log('saveTarotAnalysisWithPlan - Plano criado com', totalMonths, 'meses');
      }
    } catch (error) {
      console.error("Erro ao salvar análise com plano:", error);
    }
  };

  const updateTarotAnalysisWithPlan = (id: string, analysis: TarotAnalysis): void => {
    try {
      // Update the analysis
      const analyses = getTarotAnalyses();
      const updatedAnalyses = analyses.map(a => 
        a.id === id ? { ...a, ...analysis, dataAtualizacao: new Date().toISOString() } : a
      );
      saveTarotAnalyses(updatedAnalyses);

      // Update plan records if plan is active
      const planos = getPlanos();
      
      // Remove existing plan records for this analysis
      const filteredPlanos = planos.filter(p => !p.id.startsWith(`${id}-month-`));
      
      if (analysis.planoAtivo && analysis.planoData) {
        const totalMonths = parseInt(analysis.planoData.meses);
        const monthlyValue = parseFloat(analysis.planoData.valorMensal);
        
        const startDate = new Date(analysis.dataInicio || analysis.dataAtendimento || new Date());
        
        for (let i = 1; i <= totalMonths; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          
          const plano: Plano = {
            id: `${id}-month-${i}`,
            clientName: analysis.nomeCliente,
            type: 'plano',
            amount: monthlyValue,
            dueDate: dueDate.toISOString().split('T')[0],
            month: i,
            totalMonths: totalMonths,
            created: new Date().toISOString(),
            active: true
          };
          
          filteredPlanos.push(plano);
        }
      }
      
      savePlanos(filteredPlanos);
    } catch (error) {
      console.error("Erro ao atualizar análise com plano:", error);
    }
  };

  // Legacy functions for backward compatibility - now properly synced
  const getAllTarotAnalyses = (): TarotAnalysis[] => {
    const result = getTarotAnalyses();
    console.log('getAllTarotAnalyses - Retornando:', result.length, 'análises');
    return result;
  };
  
  const saveAllTarotAnalyses = (analyses: TarotAnalysis[]): void => {
    console.log('saveAllTarotAnalyses - Salvando:', analyses.length, 'análises');
    saveTarotAnalyses(analyses);
  };
  
  const deleteTarotAnalysis = (id: string): void => {
    console.log('deleteTarotAnalysis - Deletando análise:', id);
    const analyses = getTarotAnalyses();
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    saveTarotAnalyses(updatedAnalyses);
  };

  const getClientsWithConsultations = () => {
    const atendimentos = getAtendimentos();
    const clientMap = new Map();
    
    atendimentos.forEach(atendimento => {
      const clientName = atendimento.nome;
      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          nome: clientName,
          consultations: []
        });
      }
      clientMap.get(clientName).consultations.push(atendimento);
    });
    
    return Array.from(clientMap.values());
  };

  const checkClientBirthday = (birthDate: string) => {
    if (!birthDate) return false;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    return (
      birth.getDate() === today.getDate() &&
      birth.getMonth() === today.getMonth()
    );
  };

  // Planos functions
  const getPlanos = (): Plano[] => {
    try {
      const data = localStorage.getItem("planos");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      return [];
    }
  };

  const savePlanos = (planos: Plano[]): void => {
    try {
      localStorage.setItem("planos", JSON.stringify(planos));
    } catch (error) {
      console.error("Erro ao salvar planos:", error);
    }
  };

  // Birthday checking functions
  const checkBirthdays = () => {
    const atendimentos = getAtendimentos();
    const today = new Date();
    
    return atendimentos.filter(atendimento => {
      if (!atendimento.dataNascimento) return false;
      
      const birthDate = new Date(atendimento.dataNascimento);
      return (
        birthDate.getDate() === today.getDate() &&
        birthDate.getMonth() === today.getMonth()
      );
    });
  };

  return {
    // Atendimentos
    getAtendimentos,
    saveAtendimentos,
    // Tarot Analyses
    getTarotAnalyses,
    saveTarotAnalyses,
    getAllTarotAnalyses,
    saveAllTarotAnalyses,
    deleteTarotAnalysis,
    saveTarotAnalysisWithPlan,
    updateTarotAnalysisWithPlan,
    // Client functions
    getClientsWithConsultations,
    checkClientBirthday,
    // Planos
    getPlanos,
    savePlanos,
    // Utilities
    checkBirthdays,
    initialized
  };
};

export default useUserDataService;
