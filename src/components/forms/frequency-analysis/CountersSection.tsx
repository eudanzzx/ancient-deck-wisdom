
import React, { useCallback, memo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Counter {
  id: string;
  name: string;
  endDate: Date;
}

interface CountersSectionProps {
  counters: Counter[];
  onAddCounter: () => void;
  onUpdateCounter: (id: string, name: string, endDate: Date) => void;
  onRemoveCounter: (id: string) => void;
}

const CounterField = memo(({ 
  counter, 
  index, 
  onUpdate, 
  onRemove 
}: { 
  counter: Counter; 
  index: number; 
  onUpdate: (id: string, name: string, endDate: Date) => void;
  onRemove: (id: string) => void;
}) => {
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(counter.id, e.target.value, counter.endDate);
  }, [counter.id, counter.endDate, onUpdate]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      onUpdate(counter.id, counter.name, date);
    }
  }, [counter.id, counter.name, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(counter.id);
  }, [counter.id, onRemove]);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-[#6B21A8]">Contador {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nome do Contador</label>
          <Input
            value={counter.name}
            className="focus:border-[#6B21A8] focus:ring-[#6B21A8]/20"
            onChange={handleNameChange}
            placeholder="Nome do contador"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Data Final</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal focus:border-[#6B21A8] focus:ring-[#6B21A8]/20"
              >
                {counter.endDate ? (
                  format(counter.endDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={counter.endDate}
                onSelect={handleDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
});

CounterField.displayName = 'CounterField';

const CountersSection: React.FC<CountersSectionProps> = memo(({
  counters,
  onAddCounter,
  onUpdateCounter,
  onRemoveCounter,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[#6B21A8]">Contadores</h3>
        <Button 
          type="button" 
          variant="outline" 
          className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8]"
          onClick={onAddCounter}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Contador
        </Button>
      </div>

      {counters.map((counter, index) => (
        <CounterField
          key={counter.id}
          counter={counter}
          index={index}
          onUpdate={onUpdateCounter}
          onRemove={onRemoveCounter}
        />
      ))}
    </div>
  );
});

CountersSection.displayName = 'CountersSection';

export default CountersSection;
