
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface AnalysisFieldsProps {
  form: UseFormReturn<any>;
}

const AnalysisFields: React.FC<AnalysisFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="beforeAnalysis"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#6B21A8]">Análise - Antes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a situação antes do tratamento..."
                  className="min-h-[120px] focus:border-[#6B21A8] focus:ring-[#6B21A8]/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="afterAnalysis"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#6B21A8]">Análise - Depois</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os resultados após o tratamento..."
                  className="min-h-[120px] focus:border-[#6B21A8] focus:ring-[#6B21A8]/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="recommendedTreatment"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#6B21A8]">Tratamento Recomendado</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva o tratamento recomendado..."
                className="focus:border-[#6B21A8] focus:ring-[#6B21A8]/20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AnalysisFields;
