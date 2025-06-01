
import useUserDataService from "@/services/userDataService";

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
}

// Function to save a new atendimento
export const saveNewAtendimento = (atendimento: AtendimentoData, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  
  // Add the new one
  const updatedAtendimentos = [...currentAtendimentos, atendimento];
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  return atendimento;
};

// Function to update an existing atendimento
export const updateAtendimento = (id: string, updatedData: Partial<AtendimentoData>, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  console.log('updateAtendimento - ID:', id);
  console.log('updateAtendimento - Dados recebidos:', updatedData);
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  console.log('updateAtendimento - Atendimentos atuais:', currentAtendimentos.length);
  
  // Find the existing atendimento
  const existingAtendimento = currentAtendimentos.find(atendimento => atendimento.id === id);
  
  if (!existingAtendimento) {
    console.error('updateAtendimento - Atendimento não encontrado com ID:', id);
    return null;
  }
  
  console.log('updateAtendimento - Atendimento existente:', existingAtendimento);
  
  // Create the updated atendimento with all fields preserved
  const updatedAtendimento = {
    ...existingAtendimento,
    ...updatedData,
    id, // Ensure ID is preserved
    dataUltimaEdicao: new Date().toISOString()
  };
  
  console.log('updateAtendimento - Atendimento atualizado:', updatedAtendimento);
  
  // Update the list
  const updatedAtendimentos = currentAtendimentos.map(atendimento => 
    atendimento.id === id ? updatedAtendimento : atendimento
  );
  
  console.log('updateAtendimento - Lista final:', updatedAtendimentos);
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  console.log('updateAtendimento - Dados salvos com sucesso');
  
  return updatedAtendimento;
};

// Function to save a new tarot analysis
export const saveNewTarotAnalysis = (analysis: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Add the new one
  const updatedAnalyses = [...currentAnalyses, analysis];
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  return analysis;
};

// Function to update an existing tarot analysis
export const updateTarotAnalysis = (id: string, updatedAnalysis: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Find and update the specific one
  const updatedAnalyses = currentAnalyses.map(analysis => 
    analysis.id === id ? { 
      ...analysis, 
      ...updatedAnalysis, 
      dataAtualizacao: new Date().toISOString() 
    } : analysis
  );
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  return updatedAnalysis;
};

// Function to update localStorage for analyses (fallback)
export const updateAnalysisInLocalStorage = (id: string, updatedData: any) => {
  try {
    const analises = JSON.parse(localStorage.getItem("analises") || "[]");
    const updatedAnalises = analises.map((analise: any) => 
      analise.id === id ? { 
        ...analise, 
        ...updatedData, 
        dataAtualizacao: new Date().toISOString() 
      } : analise
    );
    localStorage.setItem("analises", JSON.stringify(updatedAnalises));
    return true;
  } catch (error) {
    console.error("Erro ao atualizar análise no localStorage:", error);
    return false;
  }
};
