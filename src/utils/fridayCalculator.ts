
export const getNextFridays = (totalWeeks: number, startDate?: Date): Date[] => {
  const fridays: Date[] = [];
  const today = startDate || new Date();
  
  // Encontrar a próxima sexta-feira
  let nextFriday = new Date(today);
  const currentDay = today.getDay(); // 0 = domingo, 1 = segunda, ..., 5 = sexta, 6 = sábado
  
  console.log('FridayCalculator - Hoje é dia:', currentDay, 'Data:', today.toDateString());
  
  // Calcular quantos dias adicionar para chegar na próxima sexta-feira
  let daysToAdd;
  if (currentDay === 5) {
    // Se hoje é sexta-feira, usar lógica de 8 dias para a próxima
    daysToAdd = 8;
  } else if (currentDay < 5) {
    // Se é antes de sexta-feira (domingo=0 a quinta=4)
    daysToAdd = 5 - currentDay;
  } else {
    // Se é sábado (6)
    daysToAdd = 6; // 6 dias depois do sábado é sexta
  }
  
  console.log('FridayCalculator - Dias para adicionar:', daysToAdd);
  
  nextFriday.setDate(today.getDate() + daysToAdd);
  console.log('FridayCalculator - Primeira sexta-feira:', nextFriday.toDateString(), 'Dia da semana:', nextFriday.getDay());
  
  // Gerar as próximas sextas-feiras (sempre com intervalo de 7 dias após a primeira)
  for (let i = 0; i < totalWeeks; i++) {
    const friday = new Date(nextFriday);
    friday.setDate(nextFriday.getDate() + (i * 7));
    fridays.push(friday);
  }
  
  return fridays;
};
