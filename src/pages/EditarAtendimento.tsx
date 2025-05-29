import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, AlertTriangle, Cake } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { updateAtendimento } from "@/utils/dataServices";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import Logo from "@/components/Logo";

interface Atendimento {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento?: 'pago' | 'pendente' | 'parcelado';
  dataNascimento?: string;
  signo?: string;
  destino?: string;
  ano?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  atencaoNota?: string;
}

const EditarAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userDataService = useUserDataService();
  const { getAtendimentos } = userDataService;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Individual form states for better control
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [dataAtendimento, setDataAtendimento] = useState("");
  const [valor, setValor] = useState("");
  const [destino, setDestino] = useState("");
  const [ano, setAno] = useState("");
  const [atencaoNota, setAtencaoNota] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [tratamento, setTratamento] = useState("");
  const [indicacao, setIndicacao] = useState("");
  const [signo, setSigno] = useState("");
  const [atencaoFlag, setAtencaoFlag] = useState(false);

  useEffect(() => {
    const carregarAtendimento = () => {
      console.log('EditarAtendimento - ID recebido:', id);
      
      if (!id) {
        console.error('ID do atendimento não fornecido');
        toast.error("ID do atendimento não fornecido");
        navigate('/');
        return;
      }

      try {
        const atendimentos = getAtendimentos();
        console.log('EditarAtendimento - Total de atendimentos:', atendimentos.length);
        
        const atendimento = atendimentos.find((a: Atendimento) => a.id === id);
        console.log('EditarAtendimento - Atendimento encontrado:', atendimento);
        
        if (atendimento) {
          setNome(atendimento.nome || "");
          setDataNascimento(atendimento.dataNascimento || "");
          setTipoServico(atendimento.tipoServico || "");
          setStatusPagamento(atendimento.statusPagamento || "");
          setDataAtendimento(atendimento.dataAtendimento || "");
          setValor(atendimento.valor || "");
          setDestino(atendimento.destino || "");
          setAno(atendimento.ano || "");
          setAtencaoNota(atendimento.atencaoNota || "");
          setDetalhes(atendimento.detalhes || "");
          setTratamento(atendimento.tratamento || "");
          setIndicacao(atendimento.indicacao || "");
          setSigno(atendimento.signo || "");
          setAtencaoFlag(Boolean(atendimento.atencaoFlag));
          
          console.log('EditarAtendimento - Dados carregados com sucesso');
        } else {
          console.error('Atendimento não encontrado com ID:', id);
          toast.error("Atendimento não encontrado");
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao carregar atendimento:', error);
        toast.error("Erro ao carregar o atendimento");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    carregarAtendimento();
  }, [id, navigate, getAtendimentos]);

  const checkIfBirthday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth()) {
      const age = today.getFullYear() - birth.getFullYear();
      toast.success(
        `🎉 Hoje é aniversário desta pessoa! ${age} anos`,
        {
          duration: 8000,
          icon: <Cake className="h-5 w-5" />,
          description: "Não esqueça de parabenizar!"
        }
      );
    }
  };

  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Alterando data de nascimento para:', value);
    setDataNascimento(value);
    
    // Check if it's birthday
    if (value) {
      checkIfBirthday(value);
    }
    
    // Calculate zodiac sign
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

  const handleSalvarAtendimento = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Tentando salvar atendimento...');
    
    // Validações básicas
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      setIsSubmitting(false);
      return;
    }

    if (!dataAtendimento) {
      toast.error("Data do atendimento é obrigatória");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare complete form data
      const formData = {
        nome: nome.trim(),
        dataNascimento,
        tipoServico,
        statusPagamento,
        dataAtendimento,
        valor,
        destino,
        ano,
        atencaoNota,
        detalhes,
        tratamento,
        indicacao,
        signo,
        atencaoFlag,
      };
      
      console.log('Dados do formulário que serão salvos:', formData);
      
      const resultado = updateAtendimento(id!, formData, userDataService);
      
      if (resultado) {
        console.log('Atendimento salvo com sucesso:', resultado);
        toast.success("Atendimento atualizado com sucesso!");
        
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        console.error('Erro: resultado do updateAtendimento é null');
        toast.error("Erro ao salvar o atendimento");
      }
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      toast.error("Erro ao salvar o atendimento");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500 text-white border-green-600";
      case "pendente":
        return "bg-yellow-500 text-white border-yellow-600";
      case "parcelado":
        return "bg-red-500 text-white border-red-600";
      default:
        return "bg-gray-200 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F7FF] flex items-center justify-center">
        <div className="text-center">
          <Logo height={60} width={60} />
          <p className="mt-4 text-slate-600">Carregando atendimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F7FF] py-6 px-4">
      <BirthdayNotifications checkOnMount={false} />
      
      {nome && dataNascimento && (
        <div className="container mx-auto max-w-4xl mb-4">
          <ClientBirthdayAlert 
            clientName={nome}
            birthDate={dataNascimento}
            context="atendimento"
          />
        </div>
      )}
      
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] transition-all duration-200" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Editar Atendimento
            </h1>
          </div>
        </div>

        <Card className="border-[#0EA5E9]/20 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#0EA5E9]">Edição de Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700">Nome do Cliente</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome completo" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-slate-700">Data de Nascimento</Label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  value={dataNascimento}
                  onChange={handleDataNascimentoChange}
                  className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signo" className="text-slate-700">Signo</Label>
                <Input id="signo" value={signo} readOnly className="bg-slate-50 border-slate-200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoServico" className="text-slate-700">Tipo de Serviço</Label>
                <Select 
                  value={tipoServico} 
                  onValueChange={setTipoServico}
                >
                  <SelectTrigger className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="tarot">Tarot</SelectItem>
                    <SelectItem value="terapia">Terapia</SelectItem>
                    <SelectItem value="mesa-radionica">Mesa Radiônica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAtendimento" className="text-slate-700">Data do Atendimento</Label>
                <Input 
                  id="dataAtendimento" 
                  type="date" 
                  value={dataAtendimento}
                  onChange={(e) => setDataAtendimento(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor" className="text-slate-700">Valor Cobrado (R$)</Label>
                <Input 
                  id="valor" 
                  type="number" 
                  placeholder="0.00" 
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusPagamento" className="text-slate-700">Status de Pagamento</Label>
                <Select 
                  value={statusPagamento} 
                  onValueChange={setStatusPagamento}
                >
                  <SelectTrigger className={`bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200 ${statusPagamento ? `border-2 ${getStatusColor(statusPagamento)}` : ""}`}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="pago" className="bg-green-100 text-green-800 hover:bg-green-200">Pago</SelectItem>
                    <SelectItem value="pendente" className="bg-orange-100 text-orange-800 hover:bg-orange-200">Pendente</SelectItem>
                    <SelectItem value="parcelado" className="bg-red-100 text-red-800 hover:bg-red-200">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
                
                {statusPagamento && (
                  <div className={`mt-2 px-3 py-1 rounded-md text-sm flex items-center ${getStatusColor(statusPagamento)}`}>
                    <span className={`h-3 w-3 rounded-full mr-2 bg-white`}></span>
                    <span className="capitalize">{statusPagamento}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino" className="text-slate-700">Destino</Label>
                <Input 
                  id="destino" 
                  placeholder="Destino do cliente" 
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano" className="text-slate-700">Ano</Label>
                <Input 
                  id="ano" 
                  placeholder="Ano específico" 
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="atencao" className="text-base flex items-center text-slate-700">
                    <AlertTriangle className={`mr-2 h-4 w-4 ${atencaoFlag ? "text-red-500" : "text-slate-400"}`} />
                    ATENÇÃO
                  </Label>
                  <Switch 
                    checked={atencaoFlag} 
                    onCheckedChange={setAtencaoFlag}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
                <Input 
                  id="atencaoNota" 
                  placeholder="Pontos de atenção" 
                  className={`transition-all duration-200 ${atencaoFlag ? "border-red-500 bg-red-50" : "bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"}`}
                  value={atencaoNota}
                  onChange={(e) => setAtencaoNota(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="detalhes" className="text-slate-700">Detalhes da Sessão</Label>
              <Textarea 
                id="detalhes" 
                placeholder="Revelações, conselhos e orientações..." 
                className="min-h-[120px] bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                value={detalhes}
                onChange={(e) => setDetalhes(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="tratamento" className="text-slate-700">Tratamento</Label>
                <Textarea 
                  id="tratamento" 
                  placeholder="Observações sobre o tratamento..." 
                  className="min-h-[100px] bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                  value={tratamento}
                  onChange={(e) => setTratamento(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicacao" className="text-slate-700">Indicação</Label>
                <Textarea 
                  id="indicacao" 
                  placeholder="Informações adicionais e indicações..." 
                  className="min-h-[100px] bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
                  value={indicacao}
                  onChange={(e) => setIndicacao(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              disabled={isSubmitting}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white transition-all duration-200 hover:shadow-md"
              onClick={handleSalvarAtendimento}
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

export default EditarAtendimento;
