
import React, { useState, useCallback, useMemo, memo } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import ClientInfoFields from "./frequency-analysis/ClientInfoFields";
import AnalysisFields from "./frequency-analysis/AnalysisFields";
import CountersSection from "./frequency-analysis/CountersSection";

const formSchema = z.object({
  clientName: z.string().min(1, "Nome é obrigatório"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  startDate: z.date({
    required_error: "Data de início é obrigatória",
  }),
  treatmentDays: z.number().int().min(1, "A duração deve ser pelo menos 1 dia"),
  beforeAnalysis: z.string().min(1, "Análise anterior é obrigatória"),
  afterAnalysis: z.string().default(""),
  recommendedTreatment: z.string().min(1, "Tratamento recomendado é obrigatória"),
  price: z.number().min(0, "Valor não pode ser negativo"),
  attention: z.boolean().default(false),
  planoAtivo: z.boolean().default(false),
  planoMeses: z.string().default(""),
  planoValorMensal: z.string().default(""),
  semanalAtivo: z.boolean().default(false),
  semanalSemanas: z.string().default(""),
  semanalValorSemanal: z.string().default(""),
  counters: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Nome do contador é obrigatório"),
      endDate: z.date(),
    })
  ).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface Counter {
  id: string;
  name: string;
  endDate: Date;
}

interface FrequencyAnalysisFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingAnalysis?: any;
}

const FrequencyAnalysisForm: React.FC<FrequencyAnalysisFormProps> = memo(({
  onSubmit,
  onCancel,
  editingAnalysis,
}) => {
  const initialCounters: Counter[] = useMemo(() => 
    (editingAnalysis?.counters || []).map((counter: any) => ({
      id: counter.id || uuidv4(),
      name: counter.name || '',
      endDate: counter.endDate || new Date(),
    })), [editingAnalysis?.counters]
  );
  
  const [counters, setCounters] = useState<Counter[]>(initialCounters);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: editingAnalysis?.client.name || "",
      birthDate: editingAnalysis?.client.birthDate || undefined,
      startDate: editingAnalysis?.startDate || new Date(),
      treatmentDays: editingAnalysis?.treatmentDays || 10,
      beforeAnalysis: editingAnalysis?.beforeAnalysis || "",
      afterAnalysis: editingAnalysis?.afterAnalysis || "",
      recommendedTreatment: editingAnalysis?.recommendedTreatment || "",
      price: editingAnalysis?.price || 0,
      attention: editingAnalysis?.attention || false,
      planoAtivo: editingAnalysis?.planoAtivo || false,
      planoMeses: editingAnalysis?.planoData?.meses || "",
      planoValorMensal: editingAnalysis?.planoData?.valorMensal || "",
      semanalAtivo: editingAnalysis?.semanalAtivo || false,
      semanalSemanas: editingAnalysis?.semanalData?.semanas || "",
      semanalValorSemanal: editingAnalysis?.semanalData?.valorSemanal || "",
      counters: initialCounters,
    },
  });

  const planoAtivo = form.watch("planoAtivo");
  const semanalAtivo = form.watch("semanalAtivo");

  const handleAddCounter = useCallback(() => {
    const newCounter: Counter = {
      id: uuidv4(),
      name: `Contador ${counters.length + 1}`,
      endDate: new Date(),
    };
    const updatedCounters = [...counters, newCounter];
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  }, [counters, form]);

  const handleRemoveCounter = useCallback((id: string) => {
    const updatedCounters = counters.filter((counter) => counter.id !== id);
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  }, [counters, form]);

  const handleUpdateCounter = useCallback((id: string, name: string, endDate: Date) => {
    const updatedCounters = counters.map((counter) =>
      counter.id === id ? { ...counter, name, endDate } : counter
    );
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  }, [counters, form]);

  const handleSubmit = useCallback((data: FormValues) => {
    const newAnalysis = {
      id: editingAnalysis?.id || uuidv4(),
      client: {
        id: uuidv4(),
        name: data.clientName,
        birthDate: data.birthDate,
        zodiacSign: "",
      },
      startDate: data.startDate,
      treatmentDays: data.treatmentDays,
      beforeAnalysis: data.beforeAnalysis,
      afterAnalysis: data.afterAnalysis,
      recommendedTreatment: data.recommendedTreatment,
      price: data.price,
      attention: data.attention,
      planoAtivo: data.planoAtivo,
      planoData: data.planoAtivo ? {
        meses: data.planoMeses,
        valorMensal: data.planoValorMensal,
      } : null,
      semanalAtivo: data.semanalAtivo,
      semanalData: data.semanalAtivo ? {
        semanas: data.semanalSemanas,
        valorSemanal: data.semanalValorSemanal,
      } : null,
      counters: data.counters,
      completed: false,
      createdAt: editingAnalysis?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSubmit(newAnalysis);
    form.reset();
  }, [editingAnalysis, onSubmit, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <ClientInfoFields form={form} />
        <AnalysisFields form={form} />

        {/* Plano Section */}
        <div className="space-y-4 p-4 border border-[#6B21A8]/20 rounded-lg bg-[#6B21A8]/5">
          <h3 className="text-lg font-medium text-[#6B21A8]">Plano de Pagamento</h3>
          
          <FormField
            control={form.control}
            name="planoAtivo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Ativar Plano Mensal</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Habilita o sistema de pagamento parcelado mensal
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {planoAtivo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="planoMeses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de Meses</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 12"
                        {...field}
                        className="bg-white/50 border-[#6B21A8]/20 focus:border-[#6B21A8]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planoValorMensal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mensal (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        {...field}
                        className="bg-white/50 border-[#6B21A8]/20 focus:border-[#6B21A8]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Semanal Section */}
        <div className="space-y-4 p-4 border border-[#10B981]/20 rounded-lg bg-[#10B981]/5">
          <h3 className="text-lg font-medium text-[#10B981]">Plano Semanal</h3>
          
          <FormField
            control={form.control}
            name="semanalAtivo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Ativar Plano Semanal</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Habilita o sistema de pagamento semanal (vence toda sexta-feira)
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {semanalAtivo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="semanalSemanas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de Semanas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 8"
                        {...field}
                        className="bg-white/50 border-[#10B981]/20 focus:border-[#10B981]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semanalValorSemanal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Semanal (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 37.50"
                        {...field}
                        className="bg-white/50 border-[#10B981]/20 focus:border-[#10B981]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <CountersSection
          counters={counters}
          onAddCounter={handleAddCounter}
          onUpdateCounter={handleUpdateCounter}
          onRemoveCounter={handleRemoveCounter}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white"
          >
            Salvar Análise
          </Button>
        </div>
      </form>
    </Form>
  );
});

FrequencyAnalysisForm.displayName = 'FrequencyAnalysisForm';

export default FrequencyAnalysisForm;
