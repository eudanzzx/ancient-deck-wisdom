
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, BarChart3, Home, ChevronDown, Users, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import SemanalPaymentNotifications from "@/components/SemanalPaymentNotifications";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isTarotPage = location.pathname === '/listagem-tarot' || location.pathname === '/analise-frequencial' || location.pathname === '/relatorio-frequencial' || location.pathname.includes('tarot');

  const handleTestNotifications = () => {
    console.log('Testando notificações semanais...');
    
    // Simular notificação de 1 dia antes (quinta-feira)
    toast.warning(
      `⚠️ Teste: Pagamento semanal amanhã!`,
      {
        description: `Cliente Teste - R$ 150,00 vence amanhã (sexta-feira)`,
        duration: 10000,
        action: {
          label: "Ver detalhes",
          onClick: () => console.log("Detalhes do pagamento teste")
        }
      }
    );

    // Simular notificação do dia (sexta-feira) após 2 segundos
    setTimeout(() => {
      toast.error(
        `🚨 Teste: Pagamento semanal vence hoje!`,
        {
          description: `Cliente Teste 2 - R$ 200,00 vence hoje (sexta-feira)`,
          duration: 15000,
          action: {
            label: "Ver detalhes",
            onClick: () => console.log("Detalhes do pagamento teste 2")
          }
        }
      );
    }, 2000);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo height={40} width={40} />
              <div>
                <h1 className={`text-lg font-semibold tracking-tight ${isTarotPage ? 'text-[#6B21A8]' : 'text-[#1E40AF]'}`}>
                  Libertá Espaço Terapêutico
                </h1>
                <span className="text-slate-600 text-xs">Sistema de Atendimentos</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isHomePage && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-[#1E40AF] hover:bg-[#1E40AF]/10 transition-all duration-200 text-sm"
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Início
                </Button>
              )}
              {!isTarotPage && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-[#1E40AF] hover:bg-[#1E40AF]/10 transition-all duration-200 text-sm"
                  onClick={() => navigate('/listagem-tarot')}
                >
                  Tarot
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`text-slate-600 transition-all duration-200 text-sm ${
                      isTarotPage 
                        ? 'hover:text-[#6B21A8] hover:bg-[#6B21A8]/10' 
                        : 'hover:text-[#1E40AF] hover:bg-[#1E40AF]/10'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Relatórios
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border border-white/30 shadow-lg">
                  <DropdownMenuItem onClick={() => navigate(isTarotPage ? '/relatorio-individual-tarot' : '/relatorio-individual')}>
                    <Users className="h-4 w-4 mr-2" />
                    Relatórios Individuais
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(isTarotPage ? '/relatorios-frequenciais-tarot' : '/relatorios-financeiros')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatórios Financeiros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 transition-all duration-200 text-sm"
                onClick={handleTestNotifications}
              >
                <Bell className="h-4 w-4 mr-1" />
                Teste Notificações
              </Button>
              
              <Button 
                className={`text-white h-8 px-4 text-sm transition-all duration-200 ${
                  isTarotPage 
                    ? 'hover:bg-[#6B21A8]/90' 
                    : 'hover:bg-[#1E40AF]/90'
                }`}
                style={{ 
                  backgroundColor: isTarotPage ? '#6B21A8' : '#1E40AF'
                }}
                onClick={() => navigate(isTarotPage ? '/analise-frequencial' : '/novo-atendimento')}
              >
                <Plus className="h-4 w-4 mr-1" />
                {isTarotPage ? 'Nova Análise' : 'Novo Atendimento'}
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      <SemanalPaymentNotifications />
    </>
  );
};

export default DashboardHeader;
