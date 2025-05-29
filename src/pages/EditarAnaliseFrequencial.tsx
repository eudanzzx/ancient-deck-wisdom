import React, { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Save, BellRing, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateAnalysisInLocalStorage } from "@/utils/dataServices";
import Logo from "@/components/Logo";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";

const EditarAnaliseFrequencial = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCliente: "",
    dataNascimento: "",
    signo: "",
    atencao: false,
    dataInicio: "",
    preco: "",
    analiseAntes: "",
    analiseDepois: "",
  });
  
  const [lembretes, setLembretes] = useState([
    { id: 1, texto: "", dias: 7 }
  ]);
  const [analiseCarregada, setAnaliseCarregada] = useState(false);

  // Verificar notificações ao carregar a página
  useEffect(() => {
    checkNotifications();
  }, []);

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

  const handleInputChange = (field: string, value: any) => {
    console.log(`Updating ${field} with value:`, value);
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('Updated formData:', updated);
      return updated;
    });
  };

  useEffect(() => {
    // Carregar dados da análise a ser editada
    const analises = JSON.parse(localStorage.getItem("analises") || "[]");
    const analise = analises.find(a => a.id === id);
    
    if (analise) {
      setFormData({
        nomeCliente: analise.nomeCliente || "",
        dataNascimento: analise.dataNascimento || "",
        signo: analise.signo || "",
        atencao: analise.atencaoFlag || false,
        dataInicio: analise.dataInicio || "",
        preco: analise.preco || "",
        analiseAntes: analise.analiseAntes || "",
        analiseDepois: analise.analiseDepois || "",
      });
      
      // Carregar lembretes se existirem
      if (analise.lembretes && analise.lembretes.length > 0) {
        setLembretes(analise.lembretes);
      }
      
      setAnaliseCarregada(true);
    } else {
      toast.error("Análise não encontrada");
      navigate("/listagem-tarot");
    }
  }, [id, navigate]);

  const handleDataNascimentoChange = (e) => {
    const value = e.target.value;
    console.log('Data nascimento change:', value);
    handleInputChange('dataNascimento', value);
    
    // Logic for determining zodiac sign based on birth date
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
      
      handleInputChange('signo', signoCalculado);
    } else {
      handleInputChange('signo', "");
    }
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

  const handleSalvarAnalise = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Validar campos obrigatórios
    if (!formData.nomeCliente || !formData.dataInicio) {
      toast.error("Preencha o nome do cliente e a data de início");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Salvando análise com dados:', formData);
      console.log('Lembretes:', lembretes);
      
      // Preparar dados atualizados da análise
      const analiseAtualizada = {
        ...formData,
        id: id,
        lembretes: [...lembretes],
        dataAtualizacao: new Date().toISOString(),
        atencaoFlag: formData.atencao
      };
      
      console.log('Análise que será salva:', analiseAtualizada);
      
      // Atualizar no localStorage
      const success = updateAnalysisInLocalStorage(id!, analiseAtualizada);
      
      if (!success) {
        throw new Error("Falha ao salvar no localStorage");
      }
      
      // Atualizar lembretes
      const lembretesStorage = JSON.parse(localStorage.getItem("lembretes") || "[]");
      
      // Remover lembretes antigos deste cliente
      const lembretesAtualizados = lembretesStorage.filter(
        lembrete => lembrete.clienteId !== id
      );
      
      // Adicionar novos lembretes
      lembretes.forEach(lembrete => {
        if (lembrete.texto && lembrete.dias > 0) {
          const novoLembrete = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            texto: lembrete.texto,
            dataAlvo: new Date(Date.now() + lembrete.dias * 24 * 60 * 60 * 1000).toISOString(),
            clienteId: id,
            clienteNome: formData.nomeCliente
          };
          
          lembretesAtualizados.push(novoLembrete);
        }
      });
      
      localStorage.setItem("lembretes", JSON.stringify(lembretesAtualizados));
      
      // Notificar usuário
      toast.success("Análise frequencial atualizada com sucesso!");
      
      // Wait a bit before navigating to ensure data is saved
      setTimeout(() => {
        navigate("/listagem-tarot");
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast.error("Erro ao salvar a análise");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!analiseCarregada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Logo height={60} width={60} />
          <p className="mt-4 text-slate-600">Carregando análise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-violet-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto max-w-4xl py-6 px-4 relative z-10">
        <div className="mb-6 flex items-center animate-fade-in">
          <Button 
            variant="ghost" 
            className="mr-2 text-[#673193] hover:bg-[#673193]/10 hover:text-[#673193] transition-all duration-300 hover:scale-105" 
            onClick={() => navigate("/listagem-tarot")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <Logo height={40} width={40} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
              Editar Tarot Frequencial
            </h1>
          </div>
        </div>

        {/* Alert de aniversário do cliente - renderizado sempre que há nome e data */}
        {formData.nomeCliente && formData.dataNascimento && (
          <div className="animate-scale-in">
            <ClientBirthdayAlert 
              clientName={formData.nomeCliente}
              birthDate={formData.dataNascimento}
              context="tarot"
            />
          </div>
        )}

        <Card className="border-[#673193]/20 shadow-xl mb-6 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="bg-gradient-to-r from-[#673193]/5 to-purple-600/5 rounded-t-lg">
            <CardTitle className="bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
              Editar Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700 font-medium">Nome do Cliente</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome completo" 
                  value={formData.nomeCliente}
                  onChange={(e) => {
                    console.log('Nome input change:', e.target.value);
                    handleInputChange('nomeCliente', e.target.value);
                  }}
                  className="bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-slate-700 font-medium">Data de Nascimento</Label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  value={formData.dataNascimento}
                  onChange={handleDataNascimentoChange}
                  className="bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signo" className="text-slate-700 font-medium">Signo</Label>
                <Input 
                  id="signo" 
                  value={formData.signo} 
                  onChange={(e) => handleInputChange('signo', e.target.value)}
                  placeholder="Signo do zodíaco"
                  className="bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-inicio" className="text-slate-700 font-medium">Data de Início</Label>
                <Input 
                  id="data-inicio" 
                  type="date" 
                  value={formData.dataInicio}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                  className="bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preco" className="text-slate-700 font-medium">Preço (R$)</Label>
                <Input 
                  id="preco" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={formData.preco}
                  onChange={(e) => handleInputChange('preco', e.target.value)}
                  className="bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="atencao" className="text-base text-slate-700 font-medium">ATENÇÃO</Label>
                  <Switch 
                    checked={formData.atencao} 
                    onCheckedChange={(checked) => {
                      console.log('Switch change:', checked);
                      handleInputChange('atencao', checked);
                    }} 
                    className="data-[state=checked]:bg-[#673193]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 border-white/30 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#673193]/10 to-purple-600/10 py-3 rounded-t-lg">
                  <CardTitle className="text-lg bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                    ANÁLISE - ANTES
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea 
                    placeholder="Descreva a situação antes do tratamento..." 
                    className="min-h-[150px] bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                    value={formData.analiseAntes}
                    onChange={(e) => {
                      console.log('Analise antes change:', e.target.value);
                      handleInputChange('analiseAntes', e.target.value);
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 border-white/30 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#673193]/10 to-purple-600/10 py-3 rounded-t-lg">
                  <CardTitle className="text-lg bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                    ANÁLISE - DEPOIS
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea 
                    placeholder="Descreva os resultados após o tratamento..." 
                    className="min-h-[150px] bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                    value={formData.analiseDepois}
                    onChange={(e) => {
                      console.log('Analise depois change:', e.target.value);
                      handleInputChange('analiseDepois', e.target.value);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                  Tratamento
                </h3>
                <Button 
                  variant="outline" 
                  className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 hover:border-[#673193] transition-all duration-300 hover:scale-105"
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
                    className="flex flex-col gap-3 p-4 border border-white/30 rounded-xl bg-white/70 hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-[#673193]" />
                      <span className="font-medium text-[#673193]">Contador {lembrete.id}</span>
                      <div className="flex-grow"></div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
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
                          className="min-h-[80px] bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-slate-600">Avisar daqui a</span>
                        <Input 
                          type="number" 
                          className="w-20 bg-white/70 border-white/30 focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-md" 
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
          <CardFooter className="flex justify-end gap-3 bg-gradient-to-r from-slate-50/50 to-slate-100/50 rounded-b-lg">
            <Button 
              variant="outline" 
              onClick={() => navigate("/listagem-tarot")}
              disabled={isSubmitting}
              className="border-white/30 text-slate-600 hover:bg-white/50 transition-all duration-300 hover:scale-105"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#673193] to-purple-600 hover:from-[#673193]/90 hover:to-purple-600/90 text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
              onClick={handleSalvarAnalise}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EditarAnaliseFrequencial;
