
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Cake, X } from 'lucide-react';

interface ClientBirthdayAlertProps {
  clientName?: string;
  birthDate?: string;
  context: 'atendimento' | 'tarot';
}

const ClientBirthdayAlert: React.FC<ClientBirthdayAlertProps> = ({ 
  clientName, 
  birthDate, 
  context 
}) => {
  const [isBirthday, setIsBirthday] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    console.log('ClientBirthdayAlert - Verificando aniversário para:', { clientName, birthDate, context });
    
    if (clientName && birthDate) {
      try {
        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
        
        // Parse da data de nascimento no formato YYYY-MM-DD
        const [year, month, day] = birthDate.split('-').map(Number);
        
        console.log('ClientBirthdayAlert - Comparação:', {
          clientName,
          birthDate,
          parsedDay: day,
          parsedMonth: month,
          todayDay,
          todayMonth,
          context
        });
        
        const isSameDay = day === todayDay;
        const isSameMonth = month === todayMonth;
        const isToday = isSameDay && isSameMonth;
        
        // Calcular idade
        if (isToday) {
          const currentYear = today.getFullYear();
          const calculatedAge = currentYear - year;
          setAge(calculatedAge);
        }
        
        console.log('ClientBirthdayAlert - Resultado:', {
          isSameDay,
          isSameMonth,
          isToday,
          age: isToday ? today.getFullYear() - year : null,
          context
        });
        
        setIsBirthday(isToday);
        
      } catch (error) {
        console.error('ClientBirthdayAlert - Erro ao processar data:', error);
        setIsBirthday(false);
        setAge(null);
      }
    } else {
      console.log('ClientBirthdayAlert - Nome ou data não fornecidos:', { clientName, birthDate, context });
      setIsBirthday(false);
      setAge(null);
    }
  }, [clientName, birthDate, context]);

  // Debug log para verificar se o componente está sendo renderizado
  console.log('ClientBirthdayAlert - Renderizando:', { 
    isBirthday, 
    clientName, 
    birthDate, 
    context,
    age,
    isVisible,
    shouldShow: isBirthday && clientName && isVisible
  });

  // Se não é aniversário, não tem nome ou foi fechado, não mostra nada
  if (!isBirthday || !clientName || !isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const getMessage = () => {
    const ageText = age ? ` está fazendo ${age} anos e` : '';
    
    if (context === 'atendimento') {
      return `Atenção! ${clientName}${ageText} hoje é seu aniversário. Considere parabenizá-lo durante o atendimento.`;
    } else if (context === 'tarot') {
      return `🎉 Hoje é um dia especial para ${clientName}!${ageText ? ` Ele(a) está fazendo ${age} anos e` : ''} é seu aniversário. As energias estão especialmente favoráveis para esta leitura de tarot frequencial.`;
    }
    return '';
  };

  return (
    <Alert className={`mb-4 border-2 relative ${context === 'tarot' ? 'border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 shadow-lg' : 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg'}`}>
      <Cake className={`h-6 w-6 ${context === 'tarot' ? 'text-purple-600' : 'text-amber-600'}`} />
      <AlertTitle className={`font-bold text-lg pr-10 ${context === 'tarot' ? 'text-purple-800' : 'text-amber-800'}`}>
        🎂 Aniversário Especial! {age && `${age} anos`} 🎉
      </AlertTitle>
      <AlertDescription className={`text-base pr-10 ${context === 'tarot' ? 'text-purple-700' : 'text-amber-700'}`}>
        {getMessage()}
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className={`absolute top-3 right-3 h-8 w-8 p-0 flex items-center justify-center ${context === 'tarot' ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-200' : 'text-amber-600 hover:text-amber-800 hover:bg-amber-200'}`}
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};

export default ClientBirthdayAlert;
