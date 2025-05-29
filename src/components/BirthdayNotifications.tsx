
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Cake } from 'lucide-react';

interface BirthdayNotificationsProps {
  checkOnMount?: boolean;
}

const BirthdayNotifications: React.FC<BirthdayNotificationsProps> = ({ checkOnMount = true }) => {
  
  const checkBirthdays = () => {
    try {
      // Get data from localStorage instead of service call
      const storedData = localStorage.getItem('atendimentos');
      const atendimentos = storedData ? JSON.parse(storedData) : [];
      
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1;
      
      const birthdaysToday = atendimentos.filter(person => {
        if (!person.dataNascimento) return false;
        
        try {
          const [year, month, day] = person.dataNascimento.split('-').map(Number);
          return day === todayDay && month === todayMonth;
        } catch (error) {
          console.error('Error parsing birth date:', error);
          return false;
        }
      });
      
      return birthdaysToday;
    } catch (error) {
      console.error('Error checking birthdays:', error);
      return [];
    }
  };

  useEffect(() => {
    if (checkOnMount) {
      console.log('Verificando aniversários...');
      const birthdaysToday = checkBirthdays();
      console.log('Aniversários encontrados:', birthdaysToday);
      
      if (birthdaysToday.length > 0) {
        birthdaysToday.forEach(person => {
          const birthDate = new Date(person.dataNascimento);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          
          // Ajustar idade se o aniversário ainda não passou este ano
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          console.log(`Exibindo notificação para ${person.nome}, ${age} anos`);
          
          toast.success(
            `🎉 Hoje é aniversário de ${person.nome}! ${age} anos`,
            {
              duration: 10000,
              icon: <Cake className="h-5 w-5" />,
              description: `Não esqueça de parabenizar!`
            }
          );
        });
      } else {
        console.log('Nenhum aniversário hoje');
      }
    }
  }, [checkOnMount]);

  return null;
};

export default BirthdayNotifications;
