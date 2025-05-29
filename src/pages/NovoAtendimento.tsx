import React, { useState } from "react";
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
import BirthdayNotifications from "@/components/BirthdayNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const NovoAtendimento = () => {
  const navigate = useNavigate();
  const { getAtendimentos, saveAtendimentos, checkBirthdays } = useUserDataService();
  const [dataNascimento, setDataNascimento] = useState("");
  const [signo, setSigno] = useState("");
  const [atencao, setAtencao] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    tipoServico: "",
    statusPagamento: "",
    dataAtendimento: "",
    valor: "",
    destino: "",
    ano: "",
    atencaoNota: "",
    detalhes: "",
    tratamento: "",
    indicacao: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSelectChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const checkIfBirthday = (birthDate: string) => {
    console.log('NovoAtendimento - Verificando se é aniversário para data:', birthDate);
    
    if (!birthDate) return;
    
    try {
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1;
      
      const [year, month, day] = birthDate.split('-').map(Number);
      
      console.log('NovoAtendimento - Comparação de datas:', {
        birthDate,
        parsedDay: day,
        parsedMonth: month,
        todayDay,
        todayMonth
      });
      
      const isSameDay = day === todayDay;
      const isSameMonth = month === todayMonth;
      const isToday = isSameDay && isSameMonth;
      
      console.log('NovoAtendimento - Resultado da comparação:', {
        isSameDay,
        isSameMonth,
        isToday
      });
      
      if (isToday) {
        const age = today.getFullYear() - year;
        console.log('NovoAtendimento - É aniversário! Idade:', age);
        
        toast.success(
          `🎉 Hoje é aniversário desta pessoa! ${age} anos`,
          {
            duration: 8000,
            icon: <Cake className="h-5 w-5" />,
            description: "Não esqueça de parabenizar!"
          }
        );
      } else {
        console.log('NovoAtendimento - Não é aniversário hoje');
      }
    } catch (error) {
      console.error('NovoAtendimento - Erro ao processar data:', error);
    }
  };

  const handleDataNascimentoChange = (e) => {
    const value = e.target.value;
    console.log('NovoAtendimento - Data de nascimento alterada para:', value);
    
    setDataNascimento(value);
    setFormData({
      ...formData,
      dataNascimento: value,
    });
    
    if (value) {
      checkIfBirthday(value);
    }
    
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

  const handleSaveAtendimento = () => {
    const existingAtendimentos = getAtendimentos();
    
    const novoAtendimento = {
      id: Date.now().toString(),
      ...formData,
      signo,
      atencaoFlag: atencao,
      data: new Date().toISOString(),
    };
    
    existingAtendimentos.push(novoAtendimento);
    saveAtendimentos(existingAtendimentos);
    
    toast.success("Atendimento salvo com sucesso!");
    navigate("/");
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "pago":
        return "bg-emerald-500 text-white border-emerald-600";
      case "pendente":
        return "bg-amber-500 text-white border-amber-600";
      case "parcelado":
        return "bg-rose-500 text-white border-rose-600";
      default:
        return "bg-slate-200 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      <BirthdayNotifications checkOnMount={false} />
      
      <div className="container mx-auto px-4 py-6 mt-20">
        <div className="mb-6 flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-[#0EA5E9] hover:bg-white/80 hover:text-[#0EA5E9] transition-all duration-200" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-[#0EA5E9]">
            Novo Atendimento
          </h1>
        </div>

        <ClientBirthdayAlert 
          clientName={formData.nome}
          birthDate={formData.dataNascimento}
          context="atendimento"
        />

        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-[#0EA5E9] text-lg">Cadastro de Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700 font-medium">Nome do Cliente</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome completo" 
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-slate-700 font-medium">Data de Nascimento</Label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  value={dataNascimento}
                  onChange={handleDataNascimentoChange}
                  className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signo" className="text-slate-700 font-medium">Signo</Label>
                <Input 
                  id="signo" 
                  value={signo} 
                  readOnly 
                  className="bg-slate-50 border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoServico" className="text-slate-700 font-medium">Tipo de Serviço</Label>
                <Select onValueChange={(value) => handleSelectChange("tipoServico", value)}>
                  <SelectTrigger className="bg-white/50 border-white/20 focus:border-[#0EA5E9]">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tarot">Tarot</SelectItem>
                    <SelectItem value="terapia">Terapia</SelectItem>
                    <SelectItem value="mesa-radionica">Mesa Radiônica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAtendimento" className="text-slate-700 font-medium">Data do Atendimento</Label>
                <Input 
                  id="dataAtendimento" 
                  type="date" 
                  value={formData.dataAtendimento}
                  onChange={handleInputChange}
                  className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor" className="text-slate-700 font-medium">Valor Cobrado (R$)</Label>
                <Input 
                  id="valor" 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.valor}
                  onChange={handleInputChange}
                  className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusPagamento" className="text-slate-700 font-medium">Status de Pagamento</Label>
                <Select onValueChange={(value) => handleSelectChange("statusPagamento", value)}>
                  <SelectTrigger className={formData.statusPagamento ? `border-2 ${getStatusColor(formData.statusPagamento)}` : "bg-white/50 border-white/20 focus:border-[#0EA5E9]"}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago" className="text-emerald-700">Pago</SelectItem>
                    <SelectItem value="pendente" className="text-amber-700">Pendente</SelectItem>
                    <SelectItem value="parcelado" className="text-rose-700">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.statusPagamento && (
                  <div className={`mt-2 px-3 py-1 rounded-md text-sm flex items-center ${getStatusColor(formData.statusPagamento)}`}>
                    <span className="h-2 w-2 rounded-full bg-white mr-2"></span>
                    <span className="capitalize">{formData.statusPagamento}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino" className="text-slate-700 font-medium">Destino</Label>
                <Input 
                  id="destino" 
                  placeholder="Destino do cliente" 
                  value={formData.destino}
                  onChange={handleInputChange}
                  className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano" className="text-slate-700 font-medium">Ano</Label>
                <Input 
                  id="ano" 
                  placeholder="Ano específico" 
                  value={formData.ano}
                  onChange={handleInputChange}
                  className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="atencao" className="text-slate-700 font-medium flex items-center">
                    <AlertTriangle className={`mr-2 h-4 w-4 ${atencao ? "text-rose-500" : "text-slate-400"}`} />
                    ATENÇÃO
                  </Label>
                  <Switch 
                    checked={atencao} 
                    onCheckedChange={setAtencao} 
                    className="data-[state=checked]:bg-rose-500"
                  />
                </div>
                <Input 
                  id="atencaoNota" 
                  placeholder="Pontos de atenção" 
                  className={atencao ? "border-rose-500 bg-rose-50" : "bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"}
                  value={formData.atencaoNota}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="detalhes" className="text-slate-700 font-medium">Detalhes da Sessão</Label>
              <Textarea 
                id="detalhes" 
                placeholder="Revelações, conselhos e orientações..." 
                className="min-h-[100px] bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                value={formData.detalhes}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="tratamento" className="text-slate-700 font-medium">Tratamento</Label>
                <Textarea 
                  id="tratamento" 
                  placeholder="Observações sobre o tratamento..." 
                  className="min-h-[80px] bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  value={formData.tratamento}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicacao" className="text-slate-700 font-medium">Indicação</Label>
                <Textarea 
                  id="indicacao" 
                  placeholder="Informações adicionais e indicações..." 
                  className="min-h-[80px] bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  value={formData.indicacao}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="border-white/20 text-slate-600 hover:bg-white/50"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
              onClick={handleSaveAtendimento}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Atendimento
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NovoAtendimento;
