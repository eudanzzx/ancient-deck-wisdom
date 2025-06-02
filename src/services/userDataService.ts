import { Plano } from "@/types/payment";

interface AtendimentoData {
  id: string;
  nome: string;
  dataNascimento?: string;
  signo?: string;
  tipoServico: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
  destino?: string;
  ano?: string;
  atencaoNota?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  data?: string;
  dataUltimaEdicao?: string;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
  } | null;
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
  } | null;
}

interface TarotAnalysis {
  id: string;
  clientName: string;
  clientBirthdate?: string;
  clientSign?: string;
  analysisDate: string;
  analysisType: string;
  paymentStatus: 'pago' | 'pendente' | 'parcelado';
  value: string;
  destination?: string;
  year?: string;
  attentionNote?: string;
  details?: string;
  treatment?: string;
  indication?: string;
  attentionFlag?: boolean;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
  } | null;
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
  } | null;
  counter1Hours?: number;
  counter2Hours?: number;
  counter3Hours?: number;
  counter1StartDate?: string;
  counter2StartDate?: string;
  counter3StartDate?: string;
  counter1Active?: boolean;
  counter2Active?: boolean;
  counter3Active?: boolean;
  data?: string;
  dataUltimaEdicao?: string;
  // Legacy fields for backward compatibility
  nomeCliente?: string;
  dataNascimento?: string;
  signo?: string;
  atencao?: boolean;
  dataInicio?: string;
  preco?: string;
  analiseAntes?: string;
  analiseDepois?: string;
  lembretes?: any;
  finalizado?: boolean;
  tipoServico?: string;
  valor?: string;
  pergunta?: string;
  resposta?: string;
  dataAnalise?: string;
  dataCriacao?: string;
  status?: string;
  dataAtendimento?: string;
}

const useUserDataService = () => {
  console.log('useUserDataService - Inicializando serviço');

  const getAtendimentos = (): AtendimentoData[] => {
    try {
      const data = localStorage.getItem("atendimentos");
      const atendimentos = data ? JSON.parse(data) : [];
      console.log('getAtendimentos - Retornando:', atendimentos.length, 'atendimentos');
      return atendimentos;
    } catch (error) {
      console.error('getAtendimentos - Erro ao buscar atendimentos:', error);
      return [];
    }
  };

  const saveAtendimentos = (atendimentos: AtendimentoData[]) => {
    try {
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
      console.log('saveAtendimentos - Salvos:', atendimentos.length, 'atendimentos');
    } catch (error) {
      console.error('saveAtendimentos - Erro ao salvar atendimentos:', error);
    }
  };

  const getTarotAnalyses = (): TarotAnalysis[] => {
    try {
      const data = localStorage.getItem("analises");
      const analyses = data ? JSON.parse(data) : [];
      console.log('getTarotAnalyses - Retornando:', analyses.length, 'análises');
      return analyses;
    } catch (error) {
      console.error('getTarotAnalyses - Erro ao buscar análises:', error);
      return [];
    }
  };

  const saveTarotAnalyses = (analyses: TarotAnalysis[]) => {
    try {
      localStorage.setItem("analises", JSON.stringify(analyses));
      console.log('saveTarotAnalyses - Salvos:', analyses.length, 'análises');
    } catch (error) {
      console.error('saveTarotAnalyses - Erro ao salvar análises:', error);
    }
  };

  const getPlanos = (): Plano[] => {
    try {
      const data = localStorage.getItem("planos");
      const planos = data ? JSON.parse(data) : [];
      console.log('getPlanos - Retornando:', planos.length, 'planos');
      return planos;
    } catch (error) {
      console.error('getPlanos - Erro ao buscar planos:', error);
      return [];
    }
  };

  const savePlanos = (planos: Plano[]) => {
    try {
      localStorage.setItem("planos", JSON.stringify(planos));
      console.log('savePlanos - Salvos:', planos.length, 'planos');
    } catch (error) {
      console.error('savePlanos - Erro ao salvar planos:', error);
    }
  };

  // Legacy methods for backward compatibility
  const getAllTarotAnalyses = () => getTarotAnalyses();
  const saveAllTarotAnalyses = (analyses: TarotAnalysis[]) => saveTarotAnalyses(analyses);
  const deleteTarotAnalysis = (id: string) => {
    const analyses = getTarotAnalyses();
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    saveTarotAnalyses(updatedAnalyses);
  };

  const getClientsWithConsultations = () => {
    const atendimentos = getAtendimentos();
    return atendimentos.map(a => ({
      id: a.id,
      nome: a.nome,
      consultations: [a]
    }));
  };

  const checkClientBirthday = (birthDate: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
  };

  const saveTarotAnalysisWithPlan = (analysis: TarotAnalysis) => {
    const analyses = getTarotAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    saveTarotAnalyses(analyses);
  };

  return {
    getAtendimentos,
    saveAtendimentos,
    getTarotAnalyses,
    saveTarotAnalyses,
    getPlanos,
    savePlanos,
    // Legacy methods
    getAllTarotAnalyses,
    saveAllTarotAnalyses,
    deleteTarotAnalysis,
    getClientsWithConsultations,
    checkClientBirthday,
    saveTarotAnalysisWithPlan,
  };
};

export default useUserDataService;
