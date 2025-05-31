import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Edit, Trash2, Plus } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import useUserDataService from "@/services/userDataService";
import TarotCountdown from "@/components/TarotCountdown";
import TarotCounters from "@/components/tarot/TarotCounters";

const ListagemTarot = () => {
  const navigate = useNavigate();
  const [analises, setAnalises] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [sortBy, setSortBy] = useState("nomeCliente"); // Default sort by client name
  const { getAllTarotAnalyses, deleteTarotAnalysis } = useUserDataService();

  useEffect(() => {
    const storedAnalises = getAllTarotAnalyses();
    setAnalises(storedAnalises);
  }, [getAllTarotAnalyses]);

  const handleCreate = useCallback(() => {
    navigate("/analise-frequencial");
  }, [navigate]);

  const handleEdit = useCallback((id: string) => {
    navigate(`/editar-tarot/${id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteTarotAnalysis(id);
      const updatedAnalises = getAllTarotAnalyses();
      setAnalises(updatedAnalises);
      toast.success("Análise excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir análise.");
    }
  }, [deleteTarotAnalysis, getAllTarotAnalyses]);

  const handleFinalizar = useCallback((id: string) => {
    const analisesAtualizadas = analises.map((analise) =>
      analise.id === id ? { ...analise, finalizado: !analise.finalizado } : analise
    );
    localStorage.setItem("analises", JSON.stringify(analisesAtualizadas));
    setAnalises(analisesAtualizadas);
    toast.success(`Análise ${analisesAtualizadas.find(a => a.id === id)?.finalizado ? 'finalizada' : 'reativada'} com sucesso!`);
  }, [analises]);

  const filteredAnalises = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return analises.filter(analise =>
      analise.nomeCliente.toLowerCase().includes(term) ||
      (analise.signo && analise.signo.toLowerCase().includes(term))
    );
  }, [analises, searchTerm]);

  const sortedAnalises = useMemo(() => {
    const sorted = [...filteredAnalises].sort((a: any, b: any) => {
      const aValue = typeof a[sortBy] === 'string' ? a[sortBy].toLowerCase() : a[sortBy];
      const bValue = typeof b[sortBy] === 'string' ? b[sortBy].toLowerCase() : b[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredAnalises, sortOrder, sortBy]);

  return (
    <div className="min-h-screen bg-[#F1F7FF] py-6 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#6B21A8]">
              Listagem - Tarot Frequencial
            </h1>
          </div>
          <Button
            className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white transition-colors duration-200 hover:shadow-md"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </div>

        <TarotCountdown analises={analises} />
        
        {/* Adicionar os contadores detalhados */}
        <div className="mb-6">
          <TarotCounters analises={analises} />
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar por nome ou signo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAnalises.map((analise: any) => (
            <Card key={analise.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#6B21A8]">{analise.nomeCliente}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Data de Início: {format(new Date(analise.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                {analise.signo && (
                  <p className="text-sm text-slate-600">Signo: {analise.signo}</p>
                )}
                <p className="text-sm text-slate-600">
                  Valor: R$ {parseFloat(analise.preco || "150").toFixed(2)}
                </p>
                <div className="mt-2 flex items-center">
                  <Label htmlFor={`attention-${analise.id}`} className="text-sm text-slate-600 mr-2">
                    Atenção:
                  </Label>
                  <Checkbox
                    id={`attention-${analise.id}`}
                    checked={analise.atencaoFlag}
                    disabled
                  />
                </div>
              </CardContent>
              <div className="flex justify-between items-center p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFinalizar(analise.id)}
                  className={`text-sm ${analise.finalizado ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                >
                  {analise.finalizado ? 'Finalizado' : 'Pendente'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-slate-500 hover:bg-slate-100 transition-colors duration-200"
                    onClick={() => handleEdit(analise.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá excluir a análise permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(analise.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListagemTarot;
