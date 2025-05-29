import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, BellRing } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import useUserDataService from "@/services/userDataService";

const AnaliseFrequencial = () => {
  const navigate = useNavigate();
  const [nomeCliente, setNomeCliente] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [signo, setSigno] = useState("");
  const [atencao, setAtencao] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [preco, setPreco] = useState("");
  const [analiseAntes, setAnaliseAntes] = useState("");
  const [analiseDepois, setAnaliseDepois] = useState("");
  const [lembretes, setLembretes] = useState([
    { id: 1, texto: "", dias: 7 }
  ]);
  
  const { checkClientBirthday } = useUserDataService();
  
  // Verificar notificações ao carregar a página
  useEffect(() => {
    checkNotifications();
  }, []);

  // Verificar aniversário do cliente quando nome e data de nascimento são preenchidos
  useEffect(() => {
    console.log('AnaliseFrequencial - Verificando aniversário para:', { nomeCliente, dataNascimento });
    
    if (nomeCliente && dataNascimento) {
      const isBirthday = checkClientBirthday(nomeCliente, dataNascimento);
      console.log('AnaliseFrequencial - É aniversário:', isBirthday);
      
      // Força uma nova verificação para garantir que o componente seja atualizado
      if (isBirthday) {
        console.log('AnaliseFrequencial - Aniversário detectado! Forçando re-render...');
      }
    }
  }, [nomeCliente, dataNascimento, checkClientBirthday]);

  const handleDataNascimentoChange = (e) => {
    const value = e.target.value;
    setDataNascimento(value);
    
    // Lógica para determinar o signo baseado na data de nascimento
    if (value) {
      const date = new Date(value);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      let signoCalculado = "";
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) signoCalculado = "Áries";
      else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) signoCalculado = "Touro";
      else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) signoCalculado = "Gêmeos";
      else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) signoCalculado = "Câncer";
      else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) signoCalculado = "Leão";
      else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) signoCalculado = "Virgem";
      else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) signoCalculado = "Libra";
      else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) signoCalculado = "Escorpião";
      else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) signoCalculado = "Sagitário";
      else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) signoCalculado = "Capricórnio";
      else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) signoCalculado = "Aquário";
      else signoCalculado = "Peixes";
      
      setSigno(signoCalculado);
    } else {
      setSigno("");
    }
  };

  // Verifica se existem tratamentos que atingiram o prazo
  const checkNotifications = () => {
    const hoje = new Date();
    const analises = JSON.parse(localStorage.getItem("analises") || "[]");
    
    analises.forEach(analise => {
      if (analise.lembretes) {
        analise.lembretes.forEach(lembrete => {
          if (!lembrete.texto) return;
          
          const dataInicio = new Date(analise.dataInicio);
          
          // Calcular quando o lembrete vai expirar
          const dataExpiracao = new Date(dataInicio);
          dataExpiracao.setDate(dataExpiracao.getDate() + lembrete.dias);
          
          // Calcular diferença em dias
          const diffTime = dataExpiracao.getTime() - hoje.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
          
          // Se falta 1 dia ou menos para expirar
          if (diffDays <= 1 && diffDays > 0) {
            toast.warning(`Tratamento "${lembrete.texto}" para ${analise.nomeCliente} expira em ${diffDays} dia! (${diffHours} horas restantes)`, {
              duration: 10000,
            });
          } 
          // Se expirou hoje
          else if (diffDays === 0 && diffHours > 0) {
            toast.warning(`Tratamento "${lembrete.texto}" para ${analise.nomeCliente} expira em ${diffHours} horas!`, {
              duration: 10000,
            });
          }
          // Se já expirou
          else if (diffDays <= 0) {
            toast.error(`O tratamento "${lembrete.texto}" para ${analise.nomeCliente} expirou!`, {
              duration: 10000,
            });
          }
        });
      }
    });
  };

  const adicionarLembrete = () => {
    const novoId = lembretes.length > 0 
      ? Math.max(...lembretes.map(l => l.id)) + 1 
      : 1;
    
    setLembretes([
      ...lembretes, 
      { id: novoId, texto: "", dias: 7 }
    ]);
  };

  const removerLembrete = (id) => {
    setLembretes(lembretes.filter(item => item.id !== id));
  };

  const atualizarLembrete = (id, campo, valor) => {
    setLembretes(lembretes.map(l => 
      l.id === id ? { ...l, [campo]: valor } : l
    ));
  };

  const handleSalvarAnalise = () => {
    // Validar campos obrigatórios
    if (!nomeCliente || !dataInicio) {
      toast.error("Preencha o nome do cliente e a data de início");
      return;
    }

    // Preparar dados da análise
    const novaAnalise = {
      id: Date.now().toString(),
      nomeCliente,
      dataNascimento,
      signo,
      atencaoFlag: atencao,
      dataInicio,
      preco,
      analiseAntes,
      analiseDepois,
      lembretes: [...lembretes],
      dataCriacao: new Date().toISOString(),
      finalizado: false // Inicialmente, a análise não está finalizada
    };

    // Recuperar análises existentes
    const analises = JSON.parse(localStorage.getItem("analises") || "[]");
    
    // Adicionar nova análise
    analises.push(novaAnalise);
    
    // Salvar no localStorage
    localStorage.setItem("analises", JSON.stringify(analises));
    
    // Notificar usuário
    toast.success("Análise frequencial salva com sucesso!");
    
    // Configurar lembretes automáticos
    const lembretesStorage = JSON.parse(localStorage.getItem("lembretes") || "[]");
    
    lembretes.forEach(lembrete => {
      if (lembrete.texto && lembrete.dias > 0) {
        const novoLembrete = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          texto: lembrete.texto,
          dataAlvo: new Date(Date.now() + lembrete.dias * 24 * 60 * 60 * 1000).toISOString(),
          clienteId: novaAnalise.id,
          clienteNome: nomeCliente
        };
        
        lembretesStorage.push(novoLembrete);
      }
    });
    
    localStorage.setItem("lembretes", JSON.stringify(lembretesStorage));
    
    // Voltar para a página de listagem
    navigate("/listagem-tarot");
  };

  return (
    <div className="min-h-screen bg-[#F1F7FF] py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-all duration-200" 
            onClick={() => navigate("/listagem-tarot")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#6B21A8]">
              Tarot Frequencial
            </h1>
          </div>
        </div>

        {/* Alert de aniversário do cliente - renderizado sempre que há nome e data */}
        {nomeCliente && dataNascimento && (
          <ClientBirthdayAlert 
            clientName={nomeCliente}
            birthDate={dataNascimento}
            context="tarot"
          />
        )}

        <Card className="border-[#6B21A8]/20 shadow-sm mb-6 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#6B21A8]">Tarot Frequencial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700">Nome do Cliente</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome completo" 
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-slate-700">Data de Nascimento</Label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  value={dataNascimento}
                  onChange={handleDataNascimentoChange}
                  className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signo" className="text-slate-700">Signo</Label>
                <Input 
                  id="signo" 
                  value={signo} 
                  readOnly 
                  className="bg-slate-50 border-slate-200" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-inicio" className="text-slate-700">Data de Início</Label>
                <Input 
                  id="data-inicio" 
                  type="date" 
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preco" className="text-slate-700">Preço (R$)</Label>
                <Input 
                  id="preco" 
                  type="number" 
                  placeholder="0.00" 
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="atencao" className="text-base text-slate-700">ATENÇÃO</Label>
                  <Switch 
                    checked={atencao} 
                    onCheckedChange={setAtencao} 
                    className="data-[state=checked]:bg-[#6B21A8]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/50 border-slate-200/50">
                <CardHeader className="bg-slate-50/80 py-3">
                  <CardTitle className="text-lg text-[#6B21A8]">ANÁLISE - ANTES</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea 
                    placeholder="Descreva a situação antes do tratamento..." 
                    className="min-h-[150px] bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                    value={analiseAntes}
                    onChange={(e) => setAnaliseAntes(e.target.value)}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white/50 border-slate-200/50">
                <CardHeader className="bg-slate-50/80 py-3">
                  <CardTitle className="text-lg text-[#6B21A8]">ANÁLISE - DEPOIS</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea 
                    placeholder="Descreva os resultados após o tratamento..." 
                    className="min-h-[150px] bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                    value={analiseDepois}
                    onChange={(e) => setAnaliseDepois(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#6B21A8]">Tratamento</h3>
                <Button 
                  variant="outline" 
                  className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-all duration-200"
                  onClick={adicionarLembrete}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-4">
                {lembretes.map((lembrete) => (
                  <div 
                    key={lembrete.id}
                    className="flex flex-col gap-3 p-3 border border-slate-200 rounded-md bg-white/50 hover:bg-white/70 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-[#6B21A8]" />
                      <span className="font-medium text-[#6B21A8]">Contador {lembrete.id}</span>
                      <div className="flex-grow"></div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        onClick={() => removerLembrete(lembrete.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Textarea 
                          placeholder="Descrição do tratamento..." 
                          value={lembrete.texto}
                          onChange={(e) => atualizarLembrete(lembrete.id, 'texto', e.target.value)}
                          className="min-h-[80px] bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-slate-600">Avisar daqui a</span>
                        <Input 
                          type="number" 
                          className="w-20 bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-all duration-200" 
                          value={lembrete.dias}
                          onChange={(e) => atualizarLembrete(lembrete.id, 'dias', parseInt(e.target.value) || 0)}
                        />
                        <span className="whitespace-nowrap text-slate-600">dias</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white transition-all duration-200 hover:shadow-md"
              onClick={handleSalvarAnalise}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Análise
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AnaliseFrequencial;
