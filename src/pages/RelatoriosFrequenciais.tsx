
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle2, AlertTriangle } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNavigate } from "react-router-dom";

interface AnaliseFrequencial {
  id: string;
  nomeCliente: string;
  dataInicio: string;
  preco: string;
  finalizado: boolean;
  dataNascimento: string;
  signo: string;
  analiseAntes: string;
  analiseDepois: string;
  lembretes: any[];
  atencaoFlag: boolean;
}

const RelatoriosFrequenciais = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  
  const [analises, setAnalises] = useState<AnaliseFrequencial[]>([]);
  const [selectedAnalise, setSelectedAnalise] = useState<AnaliseFrequencial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [atendimentosFinalizados, setAtendimentosFinalizados] = useState(0);
  const [atendimentosEmAndamento, setAtendimentosEmAndamento] = useState(0);
  const [atendimentosComAtencao, setAtendimentosComAtencao] = useState(0);

  useEffect(() => {
    const analisesTarot = getAllTarotAnalyses();
    const analisesFormatadas = analisesTarot.map(analise => ({
      id: analise.id,
      nomeCliente: analise.nomeCliente || analise.clientName || "",
      dataInicio: analise.dataInicio || analise.analysisDate || "",
      preco: analise.preco || analise.value || "",
      finalizado: analise.finalizado ?? false,
      dataNascimento: analise.dataNascimento || analise.clientBirthdate || "",
      signo: analise.signo || analise.clientSign || "",
      analiseAntes: analise.analiseAntes || "",
      analiseDepois: analise.analiseDepois || "",
      lembretes: typeof analise.lembretes === 'string' ? [] : (analise.lembretes || []),
      atencaoFlag: (analise as any).atencaoFlag || (analise as any).attentionFlag || false
    }));
    
    setAnalises(analisesFormatadas);

    setAtendimentosFinalizados(analisesFormatadas.filter(a => a.finalizado).length);
    setAtendimentosEmAndamento(analisesFormatadas.filter(a => !a.finalizado).length);
    setAtendimentosComAtencao(analisesFormatadas.filter(a => a.atencaoFlag).length);
  }, [getAllTarotAnalyses]);

  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Relatório Frequencial</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos Finalizados</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{atendimentosFinalizados}</div>
                <p className="text-sm text-muted-foreground">Total de atendimentos marcados como finalizados.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos Em Andamento</CardTitle>
                <CalendarClock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{atendimentosEmAndamento}</div>
                <p className="text-sm text-muted-foreground">Total de atendimentos ainda em andamento.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos Com Atenção</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{atendimentosComAtencao}</div>
                <p className="text-sm text-muted-foreground">Total de atendimentos que requerem atenção.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
                <CalendarClock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analises.length}</div>
                <p className="text-sm text-muted-foreground">Total de serviços cadastrados.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Lista de Atendimentos</h2>
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Preço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analises.map((analise) => (
                <TableRow key={analise.id} className="cursor-pointer hover:bg-gray-100" onClick={() => navigate(`/editar-tarot/${analise.id}`)}>
                  <TableCell>
                    <Badge variant={analise.finalizado ? "default" : "secondary"}>
                      {analise.finalizado ? "Finalizado" : "Em Andamento"}
                    </Badge>
                  </TableCell>
                  <TableCell>{analise.nomeCliente}</TableCell>
                  <TableCell>{analise.dataInicio}</TableCell>
                  <TableCell>{analise.preco}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RelatoriosFrequenciais;
