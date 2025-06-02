
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NovoAtendimento from "@/pages/NovoAtendimento";
import EditarAtendimento from "@/pages/EditarAtendimento";
import RelatorioGeral from "@/pages/RelatorioGeral";
import RelatorioIndividual from "@/pages/RelatorioIndividual";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import AnaliseFrequencial from "@/pages/AnaliseFrequencial";
import ListagemTarot from "@/pages/ListagemTarot";
import EditarAnaliseFrequencial from "@/pages/EditarAnaliseFrequencial";
import RelatoriosFrequencial from "@/pages/RelatoriosFrequencial";
import RelatoriosFinanceiros from "@/pages/RelatoriosFinanceiros";
import RelatoriosFinanceirosTarot from "@/pages/RelatoriosFinanceirosTarot";
import RelatoriosFrequenciaisTarot from "@/pages/RelatoriosFrequenciaisTarot";
import RelatorioGeralTarot from "@/pages/RelatorioGeralTarot";
import RelatorioIndividualTarot from "@/pages/RelatorioIndividualTarot";
import { AuthProvider } from "@/contexts/AuthContext";

// Create QueryClient outside of component to avoid recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/novo-atendimento" element={<NovoAtendimento />} />
              <Route path="/editar-atendimento/:id" element={<EditarAtendimento />} />
              <Route path="/relatorio-geral" element={<RelatorioGeral />} />
              <Route path="/relatorio-geral-tarot" element={<RelatorioGeralTarot />} />
              <Route path="/relatorio-individual" element={<RelatorioIndividual />} />
              <Route path="/relatorio-individual-tarot" element={<RelatorioIndividualTarot />} />
              <Route path="/analise-frequencial" element={<AnaliseFrequencial />} />
              <Route path="/listagem-tarot" element={<ListagemTarot />} />
              <Route path="/editar-analise-frequencial/:id" element={<EditarAnaliseFrequencial />} />
              <Route path="/relatorios-frequencial" element={<RelatoriosFrequencial />} />
              <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
              <Route path="/relatorios-financeiros-tarot" element={<RelatoriosFinanceirosTarot />} />
              <Route path="/relatorios-frequenciais-tarot" element={<RelatoriosFrequenciaisTarot />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
