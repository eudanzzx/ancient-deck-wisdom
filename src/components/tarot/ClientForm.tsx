
import React, { memo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ClientFormProps {
  nomeCliente: string;
  dataNascimento: string;
  signo: string;
  atencao: boolean;
  dataInicio: string;
  preco: string;
  onNomeClienteChange: (value: string) => void;
  onDataNascimentoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAtencaoChange: (value: boolean) => void;
  onDataInicioChange: (value: string) => void;
  onPrecoChange: (value: string) => void;
}

const ClientForm: React.FC<ClientFormProps> = memo(({
  nomeCliente,
  dataNascimento,
  signo,
  atencao,
  dataInicio,
  preco,
  onNomeClienteChange,
  onDataNascimentoChange,
  onAtencaoChange,
  onDataInicioChange,
  onPrecoChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-slate-700">Nome do Cliente</Label>
        <Input 
          id="nome" 
          placeholder="Nome completo" 
          value={nomeCliente}
          onChange={(e) => onNomeClienteChange(e.target.value)}
          className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataNascimento" className="text-slate-700">Data de Nascimento</Label>
        <Input 
          id="dataNascimento" 
          type="date" 
          value={dataNascimento}
          onChange={onDataNascimentoChange}
          className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
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
          onChange={(e) => onDataInicioChange(e.target.value)}
          className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="preco" className="text-slate-700">Preço (R$)</Label>
        <Input 
          id="preco" 
          type="number" 
          placeholder="0.00" 
          value={preco}
          onChange={(e) => onPrecoChange(e.target.value)}
          className="bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <div className="flex items-center justify-between">
          <Label htmlFor="atencao" className="text-base text-slate-700">ATENÇÃO</Label>
          <Switch 
            checked={atencao} 
            onCheckedChange={onAtencaoChange} 
            className="data-[state=checked]:bg-[#6B21A8]"
          />
        </div>
      </div>
    </div>
  );
});

ClientForm.displayName = 'ClientForm';

export default ClientForm;
