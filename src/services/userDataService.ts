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
  finalizado?: boolean;
  valor?: string;
  tipoServico?: string;
  cartasEscolhidas?: string[];
  significados?: string[];
  observacoes?: string;
  dataAtualizacao?: string;
}

interface Plano {
  id: string;
  clientName: string;
  type: 'plano';
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
    if (!initialized) return [];
    try {
      const data = localStorage.getItem("atendimentos");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao carregar atendimentos:", error);
      return [];
    }
  };

  const saveAtendimentos = (atendimentos: Atendimento[]): void => {
    try {
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
    } catch (error) {
      console.error("Erro ao salvar atendimentos:", error);
    }
  };

  // Tarot Analysis functions
  const getTarotAnalyses = (): TarotAnalysis[] => {
    if (!initialized) return [];
    try {
      const data = localStorage.getItem("analises");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao carregar análises:", error);
      return [];
    }
  };

  const saveTarotAnalyses = (analyses: TarotAnalysis[]): void => {
    try {
      localStorage.setItem("analises", JSON.stringify(analyses));
    } catch (error) {
      console.error("Erro ao salvar análises:", error);
    }
  };

  // Legacy functions for backward compatibility
  const getAllTarotAnalyses = getTarotAnalyses;
  const saveAllTarotAnalyses = saveTarotAnalyses;
  
  const deleteTarotAnalysis = (id: string): void => {
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
    if (!initialized) return [];
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
