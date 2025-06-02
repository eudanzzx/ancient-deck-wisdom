
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, BarChart3, FileText, Calendar } from "lucide-react";
import SemanalPaymentNotifications from "@/components/SemanalPaymentNotifications";

const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-[#0EA5E9]">Dashboard</h1>
              <nav className="hidden md:flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  className="text-slate-600 hover:text-[#0EA5E9] hover:bg-white/80"
                  onClick={() => navigate("/relatorio-geral")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-slate-600 hover:text-[#0EA5E9] hover:bg-white/80"
                  onClick={() => navigate("/analise-frequencial")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Análise Frequencial
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-slate-600 hover:text-[#0EA5E9] hover:bg-white/80"
                  onClick={() => navigate("/listagem-tarot")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Serviços
                </Button>
              </nav>
            </div>
            
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white shadow-lg"
              onClick={() => navigate("/novo-atendimento")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Atendimento
            </Button>
          </div>
        </div>
      </header>
      
      {/* Componente de notificações semanais */}
      <SemanalPaymentNotifications />
    </>
  );
};

export default DashboardHeader;
