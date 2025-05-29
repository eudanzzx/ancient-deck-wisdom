
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Cake, X } from 'lucide-react';

const DashboardBirthdayNotifications = () => {
  const [aniversariantes, setAniversariantes] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkBirthdays = async () => {
      console.log('DashboardBirthdayNotifications - Verificando aniversários do dashboard');
      
      try {
        // Get data from localStorage instead of service call
        const storedData = localStorage.getItem('atendimentos');
        const atendimentos = storedData ? JSON.parse(storedData) : [];
        
        console.log('DashboardBirthdayNotifications - Total de atendimentos:', atendimentos.length);
        
        const hoje = new Date();
        const todayDay = hoje.getDate();
        const todayMonth = hoje.getMonth() + 1;
        
        console.log('DashboardBirthdayNotifications - Data de hoje (dia/mês):', `${todayDay}/${todayMonth}`);
        
        const aniversariantesHoje = [];
        
        atendimentos.forEach(atendimento => {
          console.log('DashboardBirthdayNotifications - Cliente:', atendimento.nome);
          console.log('DashboardBirthdayNotifications - Data nascimento original:', atendimento.dataNascimento);
          
          if (!atendimento.dataNascimento) return;
          
          try {
            const [year, month, day] = atendimento.dataNascimento.split('-').map(Number);
            console.log('DashboardBirthdayNotifications - Parsed: dia=' + day + ', mês=' + month);
            console.log('DashboardBirthdayNotifications - Hoje: dia=' + todayDay + ', mês=' + todayMonth);
            
            const isToday = day === todayDay && month === todayMonth;
            console.log('DashboardBirthdayNotifications - É aniversário:', isToday);
            
            if (isToday) {
              const currentYear = hoje.getFullYear();
              const age = currentYear - year;
              aniversariantesHoje.push({
                nome: atendimento.nome,
                idade: age
              });
            }
          } catch (error) {
            console.error('DashboardBirthdayNotifications - Erro ao processar data:', error);
          }
        });
        
        // Remove duplicatas por nome
        const aniversariantesUnicos = aniversariantesHoje.filter((aniversariante, index, self) =>
          index === self.findIndex(a => a.nome === aniversariante.nome)
        );
        
        console.log('DashboardBirthdayNotifications - Aniversários encontrados:', aniversariantesUnicos.map(a => `${a.nome} (${a.idade} anos)`));
        setAniversariantes(aniversariantesUnicos);
        
      } catch (error) {
        console.error('DashboardBirthdayNotifications - Erro ao carregar atendimentos:', error);
      }
    };

    checkBirthdays();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Se não há aniversariantes ou a notificação foi fechada, não mostra nada
  if (aniversariantes.length === 0 || !isVisible) {
    return null;
  }

  const formatarAniversariantes = () => {
    if (aniversariantes.length === 1) {
      return `${aniversariantes[0].nome} (${aniversariantes[0].idade} anos)`;
    } else if (aniversariantes.length === 2) {
      return `${aniversariantes[0].nome} (${aniversariantes[0].idade} anos) e ${aniversariantes[1].nome} (${aniversariantes[1].idade} anos)`;
    } else {
      const ultimoIndex = aniversariantes.length - 1;
      const primeiros = aniversariantes.slice(0, ultimoIndex).map(a => `${a.nome} (${a.idade} anos)`).join(', ');
      const ultimo = `${aniversariantes[ultimoIndex].nome} (${aniversariantes[ultimoIndex].idade} anos)`;
      return `${primeiros} e ${ultimo}`;
    }
  };

  return (
    <Alert className="mb-4 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg relative">
      <Cake className="h-6 w-6 text-amber-600" />
      <AlertTitle className="font-bold text-lg text-amber-800 pr-8">
        🎉 Aniversariantes de Hoje!
      </AlertTitle>
      <AlertDescription className="text-base text-amber-700 pr-8">
        Hoje é aniversário de <strong>{formatarAniversariantes()}</strong>. Não esqueça de enviar uma mensagem especial.
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-200"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};

export default DashboardBirthdayNotifications;
