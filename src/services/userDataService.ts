
import { useAuth } from "@/contexts/AuthContext";

// Service to handle user-specific data
const useUserDataService = () => {
  const { currentUser } = useAuth();
  
  const getUserId = () => {
    const userId = currentUser?.id || 'guest';
    console.log('UserDataService - getUserId retornando:', userId);
    return userId;
  };
  
  // Save atendimentos with user ID
  const saveAtendimentos = (atendimentos: any[]) => {
    const userId = getUserId();
    console.log('UserDataService - Salvando atendimentos para usuário:', userId);
    console.log('UserDataService - Quantidade de atendimentos a salvar:', atendimentos.length);
    
    // Get all user data
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update this user's data
    allUserData[userId] = {
      ...allUserData[userId],
      atendimentos,
    };
    
    // Save back to localStorage
    localStorage.setItem('userData', JSON.stringify(allUserData));
    console.log('UserDataService - Dados salvos com sucesso');
  };
  
  // Get atendimentos for current user
  const getAtendimentos = () => {
    const userId = getUserId();
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const atendimentos = (allUserData[userId]?.atendimentos || []);
    
    console.log('UserDataService - Carregando atendimentos para usuário:', userId);
    console.log('UserDataService - Atendimentos encontrados:', atendimentos.length);
    console.log('UserDataService - Dados completos:', atendimentos);
    
    return atendimentos;
  };
  
  // Save tarot analyses with user ID
  const saveTarotAnalyses = (analyses: any[]) => {
    const userId = getUserId();
    
    // Get all user data
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update this user's data
    allUserData[userId] = {
      ...allUserData[userId],
      tarotAnalyses: analyses,
    };
    
    // Save back to localStorage
    localStorage.setItem('userData', JSON.stringify(allUserData));
  };
  
  // Get tarot analyses for current user
  const getTarotAnalyses = () => {
    const userId = getUserId();
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    return (allUserData[userId]?.tarotAnalyses || []);
  };

  // Get all analyses from localStorage (for reports)
  const getAllTarotAnalyses = () => {
    return JSON.parse(localStorage.getItem('analises') || '[]');
  };
  
  // Save all analyses to localStorage (for reports)
  const saveAllTarotAnalyses = (analyses: any[]) => {
    localStorage.setItem('analises', JSON.stringify(analyses));
  };

  // Delete tarot analysis and remove birthday notifications
  const deleteTarotAnalysis = (id: string) => {
    // Get the analysis to be deleted first to check for birthday
    const allAnalyses = getAllTarotAnalyses();
    const analysisToDelete = allAnalyses.find((analysis: any) => analysis.id === id);
    
    // Delete from global localStorage (for reports)
    const updatedAnalyses = allAnalyses.filter((analysis: any) => analysis.id !== id);
    saveAllTarotAnalyses(updatedAnalyses);

    // Delete from user-specific data
    const userAnalyses = getTarotAnalyses();
    const updatedUserAnalyses = userAnalyses.filter((analysis: any) => analysis.id !== id);
    saveTarotAnalyses(updatedUserAnalyses);

    // If the deleted analysis had a birthday today, trigger a refresh of birthday notifications
    if (analysisToDelete && analysisToDelete.dataNascimento) {
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1;
      
      try {
        const [year, month, day] = analysisToDelete.dataNascimento.split('-').map(Number);
        const isBirthdayToday = day === todayDay && month === todayMonth;
        
        if (isBirthdayToday) {
          console.log('UserDataService - Removendo notificação de aniversário para:', analysisToDelete.nomeCliente);
          
          // Trigger a custom event to notify components about the birthday notification removal
          const event = new CustomEvent('birthdayNotificationRemoved', {
            detail: { 
              clientName: analysisToDelete.nomeCliente,
              analysisType: 'tarot'
            }
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('UserDataService - Erro ao processar data de aniversário:', error);
      }
    }
  };

  // Check for birthdays today
  const checkBirthdays = () => {
    const atendimentos = getAtendimentos();
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
    
    console.log('UserDataService - Verificando aniversários para data:', `${todayDay}/${todayMonth}`);
    console.log('UserDataService - Total de atendimentos:', atendimentos.length);
    
    const birthdaysToday = atendimentos.filter(atendimento => {
      if (atendimento.dataNascimento) {
        try {
          // Parse da data de nascimento no formato YYYY-MM-DD
          const [year, month, day] = atendimento.dataNascimento.split('-').map(Number);
          
          const isSameDay = day === todayDay;
          const isSameMonth = month === todayMonth;
          
          console.log(`UserDataService - Cliente: ${atendimento.nome}, Data: ${atendimento.dataNascimento}, Parsed: ${day}/${month}, Hoje: ${todayDay}/${todayMonth}, É aniversário: ${isSameDay && isSameMonth}`);
          
          return isSameDay && isSameMonth;
        } catch (error) {
          console.error(`UserDataService - Erro ao processar data de nascimento de ${atendimento.nome}:`, error);
          return false;
        }
      }
      return false;
    });

    console.log('UserDataService - Aniversários encontrados:', birthdaysToday.map(b => b.nome));
    return birthdaysToday;
  };

  // Check if specific client has birthday today
  const checkClientBirthday = (clientName: string, birthDate?: string) => {
    if (!birthDate) return false;
    
    try {
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
      
      // Parse da data de nascimento no formato YYYY-MM-DD
      const [year, month, day] = birthDate.split('-').map(Number);
      
      const isSameDay = day === todayDay;
      const isSameMonth = month === todayMonth;
      
      return isSameDay && isSameMonth;
    } catch (error) {
      console.error(`UserDataService - Erro ao verificar aniversário de ${clientName}:`, error);
      return false;
    }
  };

  // Get clients with their consultation count
  const getClientsWithConsultations = () => {
    const atendimentos = getAtendimentos();
    const clientsMap = new Map();

    atendimentos.forEach(atendimento => {
      const clientName = atendimento.nome;
      if (clientsMap.has(clientName)) {
        clientsMap.get(clientName).count++;
        clientsMap.get(clientName).consultations.push(atendimento);
      } else {
        clientsMap.set(clientName, {
          name: clientName,
          count: 1,
          consultations: [atendimento]
        });
      }
    });

    return Array.from(clientsMap.values());
  };
  
  return {
    saveAtendimentos,
    getAtendimentos,
    saveTarotAnalyses,
    getTarotAnalyses,
    getAllTarotAnalyses,
    saveAllTarotAnalyses,
    deleteTarotAnalysis,
    checkBirthdays,
    checkClientBirthday,
    getClientsWithConsultations
  };
};

export default useUserDataService;
