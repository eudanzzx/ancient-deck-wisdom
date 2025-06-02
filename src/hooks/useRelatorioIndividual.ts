
import { useState, useEffect, useMemo } from 'react';
import useUserDataService from "@/services/userDataService";

export const useRelatorioIndividual = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [atendimentos, setAtendimentos] = useState([]);
  const [filteredAtendimentos, setFilteredAtendimentos] = useState([]);
  const { getAtendimentos } = useUserDataService();

  useEffect(() => {
    loadAtendimentos();
  }, []);

  useEffect(() => {
    const filtered = atendimentos.filter(atendimento =>
      atendimento.nome && 
      atendimento.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAtendimentos(filtered);
  }, [searchTerm, atendimentos]);

  const loadAtendimentos = () => {
    const data = getAtendimentos();
    console.log('RelatorioIndividual - Dados carregados:', data);
    setAtendimentos(data);
    setFilteredAtendimentos(data);
  };

  const clientesUnicos = useMemo(() => {
    const clientesMap = new Map();
    
    filteredAtendimentos.forEach(atendimento => {
      // Verificar se nome existe antes de usar
      if (!atendimento.nome) {
        console.warn('Atendimento sem nome:', atendimento);
        return;
      }
      
      const cliente = atendimento.nome;
      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, {
          nome: cliente,
          atendimentos: [],
          totalConsultas: 0,
          valorTotal: 0,
          ultimaConsulta: null
        });
      }
      
      const clienteData = clientesMap.get(cliente);
      clienteData.atendimentos.push(atendimento);
      clienteData.totalConsultas += 1;
      
      // Fix: Ensure proper number parsing for arithmetic operations
      const precoValue = atendimento.preco || atendimento.valor || "0";
      const precoNumber = parseFloat(precoValue.toString());
      const validNumber = isNaN(precoNumber) ? 0 : precoNumber;
      const currentTotal = typeof clienteData.valorTotal === 'number' ? clienteData.valorTotal : 0;
      clienteData.valorTotal = currentTotal + validNumber;
      
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      if (!clienteData.ultimaConsulta || dataAtendimento > new Date(clienteData.ultimaConsulta)) {
        clienteData.ultimaConsulta = atendimento.dataAtendimento;
      }
    });
    
    return Array.from(clientesMap.values()).sort((a, b) => 
      new Date(b.ultimaConsulta).getTime() - new Date(a.ultimaConsulta).getTime()
    );
  }, [filteredAtendimentos]);

  const getTotalValue = () => {
    const total = atendimentos.reduce((acc, curr) => {
      const precoValue = curr.preco || curr.valor || "0";
      const precoNumber = parseFloat(precoValue.toString());
      const validNumber = isNaN(precoNumber) ? 0 : precoNumber;
      const accNumber = typeof acc === 'number' ? acc : parseFloat(acc.toString()) || 0;
      return accNumber + validNumber;
    }, 0);
    return total.toFixed(2);
  };

  return {
    searchTerm,
    setSearchTerm,
    atendimentos,
    filteredAtendimentos,
    clientesUnicos,
    getTotalValue,
    loadAtendimentos
  };
};
