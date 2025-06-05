import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { ArrowLeft, Save, Plus, Trash2, BellRing, FileText } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import PlanoMonthsVisualizer from "@/components/PlanoMonthsVisualizer";
import useUserDataService from "@/services/userDataService";
import ClientForm from "@/components/tarot/ClientForm";
import AnalysisCards from "@/components/tarot/AnalysisCards";
import PlanoSelector from "@/components/tarot/PlanoSelector";

// Memoized reminder component to prevent unnecessary re-renders
const ReminderCard = memo(({ lembrete, onUpdate, onRemove }: {
  lembrete: any;
  onUpdate: (id: number, campo: string, valor: any) => void;
  onRemove: (id: number) => void;
}) => {
  const handleTextoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(lembrete.id, 'texto', e.target.value);
  }, [lembrete.id, onUpdate]);

  const handleDiasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(lembrete.id, 'dias', parseInt(e.target.value) || 0);
  }, [lembrete.id, onUpdate]);

  const handleRemoveClick = useCallback(() => {
    onRemove(lembrete.id);
  }, [lembrete.id, onRemove]);

  return (
    <div className="flex flex-col gap-3 p-3 border border-slate-200 rounded-md bg-white/50 hover:bg-white/70 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <BellRing className="h-5 w-5 text-[#6B21A8]" />
        <span className="font-medium text-[#6B21A8]">Contador {lembrete.id}</span>
        <div className="flex-grow"></div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
          onClick={handleRemoveClick}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Textarea 
            placeholder="Descrição do tratamento..." 
            value={lembrete.texto}
            onChange={handleTextoChange}
            className="min-h-[80px] bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-slate-600">Avisar daqui a</span>
          <Input 
            type="number" 
            className="w-20 bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200" 
            value={lembrete.dias}
            onChange={handleDiasChange}
          />
          <span className="whitespace-nowrap text-slate-600">dias</span>
        </div>
      </div>
    </div>
  );
});

ReminderCard.displayName = 'ReminderCard';

const EditarAnaliseFrequencial = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nomeCliente, setNomeCliente] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [signo, setSigno] = useState("");
  const [atencao, setAtencao] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [preco, setPreco] = useState("");
  const [analiseAntes, setAnaliseAntes] = useState("");
  const [analiseDepois, setAnaliseDepois] = useState("");
  const [planoAtivo, setPlanoAtivo] = useState(false);
  const [planoData, setPlanoData] = useState({
    meses: "",
    valorMensal: "",
  });
  const [lembretes, setLembretes] = useState([{ id: 1, texto: "", dias: 7 }]);
  const [initialLembretesLoaded, setInitialLembretesLoaded] = useState(false);
  
  const { checkClientBirthday, getTarotAnalyses, saveTarotAnalyses, getPlanos, savePlanos } = useUserDataService();

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = useCallback(() => {
    if (!id) {
      toast.error("ID da análise não fornecido.");
      return;
    }

    const analises = getTarotAnalyses();
    const analise = analises.find((a: any) => a.id === id);

    if (!analise) {
      toast.error("Análise não encontrada.");
      return;
    }

    setNomeCliente(analise.nomeCliente || analise.clientName || "");
    setDataNascimento(analise.dataNascimento || analise.clientBirthdate || "");
    setSigno(analise.signo || analise.clientSign || "");
    setAtencao(analise.atencao || analise.attentionFlag || false);
    setDataInicio(analise.dataInicio || analise.analysisDate || "");
    setPreco(analise.preco || analise.value || "");
    setAnaliseAntes(analise.analiseAntes || "");
    setAnaliseDepois(analise.analiseDepois || "");
    setPlanoAtivo(analise.planoAtivo || false);
    setPlanoData(analise.planoData || { meses: "", valorMensal: "" });

    // Load reminders only once when the component mounts
    if (!initialLembretesLoaded) {
      // Handle both array and string formats for lembretes
      let lembretesToSet = [{ id: 1, texto: "", dias: 7 }];
      if (analise.lembretes) {
        if (Array.isArray(analise.lembretes)) {
          lembretesToSet = analise.lembretes;
        } else if (typeof analise.lembretes === 'string') {
          // Convert string format to array format
          lembretesToSet = [{ id: 1, texto: analise.lembretes, dias: 7 }];
        }
      }
      setLembretes(lembretesToSet);
      setInitialLembretesLoaded(true);
    }
  }, [id, getTarotAnalyses, initialLembretesLoaded]);

  // Verificar notificações ao carregar a página
  useEffect(() => {
    checkNotifications();
  }, []);

  // Verificar aniversário do cliente quando nome e data de nascimento são preenchidos
  useEffect(() => {
    if (nomeCliente && dataNascimento) {
      const isBirthday = checkClientBirthday(dataNascimento);
      if (isBirthday) {
        console.log('Aniversário detectado! Forçando re-render...');
      }
    }
  }, [nomeCliente, dataNascimento, checkClientBirthday]);

  const handleDataNascimentoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const handlePlanoDataChange = useCallback((field: string, value: string) => {
    setPlanoData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Verifica se existem tratamentos que atingiram o prazo
  const checkNotifications = useCallback(() => {
    const hoje = new Date();
    const analises = getTarotAnalyses();
    
    analises.forEach((analise: any) => {
      if (analise.lembretes) {
        analise.lembretes.forEach((lembrete: any) => {
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
  }, [getTarotAnalyses]);

  const adicionarLembrete = useCallback(() => {
    const novoId = lembretes.length > 0 
      ? Math.max(...lembretes.map(l => l.id)) + 1 
      : 1;
    
    setLembretes(prev => [
      ...prev, 
      { id: novoId, texto: "", dias: 7 }
    ]);
  }, [lembretes]);

  const removerLembrete = useCallback((id: number) => {
    setLembretes(prev => prev.filter(item => item.id !== id));
  }, []);

  const atualizarLembrete = useCallback((id: number, campo: string, valor: any) => {
    setLembretes(prev => prev.map(l => 
      l.id === id ? { ...l, [campo]: valor } : l
    ));
  }, []);

  const createPlanoNotifications = useCallback((nomeCliente: string, meses: string, valorMensal: string, dataInicio: string) => {
    const notifications = [];
    const startDate = new Date(dataInicio);
    
    for (let i = 1; i <= parseInt(meses); i++) {
      const notificationDate = new Date(startDate);
      notificationDate.setMonth(notificationDate.getMonth() + i);
      
      notifications.push({
        id: `plano-${Date.now()}-${i}`,
        clientName: nomeCliente,
        type: 'plano',
        amount: parseFloat(valorMensal),
        dueDate: notificationDate.toISOString().split('T')[0],
        month: i,
        totalMonths: parseInt(meses),
        created: new Date().toISOString(),
        active: true
      });
    }
    
    return notifications;
  }, []);

  const handleSalvarAnalise = useCallback(() => {
    // Validar campos obrigatórios
    if (!nomeCliente || !dataInicio) {
      toast.error("Preencha o nome do cliente e a data de início");
      return;
    }

    // Preparar dados da análise no formato TarotAnalysis
    const updatedAnalise = {
      id: id,
      // Required TarotAnalysis properties
      clientName: nomeCliente,
      analysisDate: dataInicio,
      analysisType: "Análise Frequencial",
      paymentStatus: 'pago' as const,
      value: preco || "150",
      // Legacy fields for backward compatibility
      nomeCliente,
      dataNascimento,
      signo,
      atencao,
      dataInicio,
      dataAtendimento: dataInicio,
      data: new Date().toISOString(),
      preco,
      pergunta: "Análise Frequencial",
      resposta: analiseAntes + (analiseDepois ? ` | Depois: ${analiseDepois}` : ""),
      dataAnalise: new Date().toISOString(),
      analiseAntes,
      analiseDepois,
      planoAtivo,
      planoData: planoAtivo ? planoData : null,
      lembretes: [...lembretes],
      dataCriacao: new Date().toISOString(),
      finalizado: false,
      status: 'ativo' as const,
      atencaoFlag: atencao,
      valor: preco || "150",
      tipoServico: "Tarot Frequencial"
    };

    // Get current analyses
    const analises = getTarotAnalyses();

    // Find the index of the analysis to be updated
    const analiseIndex = analises.findIndex((a: any) => a.id === id);

    if (analiseIndex === -1) {
      toast.error("Análise não encontrada.");
      return;
    }

    // Update the analysis in the array
    analises[analiseIndex] = updatedAnalise;

    // Save the updated analyses array
    saveTarotAnalyses(analises);
    
    // Se tem plano ativo, criar as notificações
    if (planoAtivo && planoData.meses && planoData.valorMensal && dataInicio) {
      const notifications = createPlanoNotifications(
        nomeCliente,
        planoData.meses,
        planoData.valorMensal,
        dataInicio
      );
      
      // Salvar as notificações de plano
      const existingPlanos = getPlanos() || [];
      const updatedPlanos = [...existingPlanos, ...notifications];
      savePlanos(updatedPlanos);
      
      toast.success(`Análise frequencial salva! Plano de ${planoData.meses} meses criado com sucesso.`);
    } else {
      toast.success("Análise frequencial salva com sucesso!");
    }
    
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
          clienteId: updatedAnalise.id,
          clienteNome: nomeCliente
        };
        
        lembretesStorage.push(novoLembrete);
      }
    });
    
    localStorage.setItem("lembretes", JSON.stringify(lembretesStorage));
    
    // Voltar para a página de listagem
    navigate("/listagem-tarot");
  }, [id, nomeCliente, dataInicio, dataNascimento, signo, atencao, preco, analiseAntes, analiseDepois, planoAtivo, planoData, lembretes, navigate, getTarotAnalyses, saveTarotAnalyses, createPlanoNotifications, getPlanos, savePlanos]);

  const handleBack = useCallback(() => {
    navigate("/listagem-tarot");
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Memoize the birthday alert check
  const shouldShowBirthdayAlert = useMemo(() => {
    return nomeCliente && dataNascimento;
  }, [nomeCliente, dataNascimento]);

  // Create a mock atendimento object for PlanoMonthsVisualizer
  const mockAtendimento = useMemo(() => ({
    id: Date.now().toString(),
    nome: nomeCliente,
    planoAtivo,
    planoData: planoAtivo ? planoData : null,
    dataAtendimento: dataInicio,
    data: new Date().toISOString(),
  }), [nomeCliente, planoAtivo, planoData, dataInicio]);

  return (
    <div className="min-h-screen bg-[#F1F7FF] py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-colors duration-200" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#6B21A8]">
              Editar Análise Frequencial
            </h1>
          </div>
        </div>

        {shouldShowBirthdayAlert && (
          <ClientBirthdayAlert 
            clientName={nomeCliente}
            birthDate={dataNascimento}
            context="tarot"
          />
        )}

        <Card className="border-[#6B21A8]/20 shadow-sm mb-6 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-[#6B21A8] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados da Análise Frequencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm
              nomeCliente={nomeCliente}
              dataNascimento={dataNascimento}
              signo={signo}
              atencao={atencao}
              dataInicio={dataInicio}
              preco={preco}
              onNomeClienteChange={setNomeCliente}
              onDataNascimentoChange={handleDataNascimentoChange}
              onAtencaoChange={setAtencao}
              onDataInicioChange={setDataInicio}
              onPrecoChange={setPreco}
            />

            <div className="mt-6">
              <PlanoSelector
                planoAtivo={planoAtivo}
                planoData={planoData}
                onPlanoAtivoChange={setPlanoAtivo}
                onPlanoDataChange={handlePlanoDataChange}
              />
            </div>

            <AnalysisCards
              analiseAntes={analiseAntes}
              analiseDepois={analiseDepois}
              onAnaliseAntesChange={setAnaliseAntes}
              onAnaliseDepoisChange={setAnaliseDepois}
            />
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#6B21A8] flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Tratamentos e Lembretes
                </h3>
                <Button 
                  variant="outline" 
                  className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200"
                  onClick={adicionarLembrete}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Tratamento
                </Button>
              </div>
              
              <div className="space-y-4">
                {lembretes.map((lembrete) => (
                  <ReminderCard
                    key={lembrete.id}
                    lembrete={lembrete}
                    onUpdate={atualizarLembrete}
                    onRemove={removerLembrete}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors duration-200"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white transition-colors duration-200 hover:shadow-md"
              onClick={handleSalvarAnalise}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Análise
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Months Visualizer */}
        {planoAtivo && nomeCliente && planoData.meses && planoData.valorMensal && dataInicio && (
          <PlanoMonthsVisualizer atendimento={mockAtendimento} />
        )}
      </div>
    </div>
  );
};

export default EditarAnaliseFrequencial;
