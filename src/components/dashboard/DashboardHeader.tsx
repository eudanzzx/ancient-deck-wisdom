
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, BarChart3, Home, ChevronDown, Users, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isTarotPage = location.pathname === '/listagem-tarot' || location.pathname === '/analise-frequencial' || location.pathname === '/relatorio-frequencial' || location.pathname.includes('tarot');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5"></div>
      
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              <Logo height={45} width={45} />
            </div>
            <div className="space-y-1">
              <h1 className={`text-xl font-bold tracking-tight transition-all duration-300 ${
                isTarotPage 
                  ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent'
              }`}>
                Libertá Espaço Terapêutico
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs font-medium tracking-wider uppercase">Sistema de Atendimentos</span>
                <Sparkles className="h-3 w-3 text-slate-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isHomePage && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 text-sm font-medium rounded-xl px-4 py-2 hover:scale-105 hover:-translate-y-0.5"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
            )}
            
            {!isTarotPage && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 text-sm font-medium rounded-xl px-4 py-2 hover:scale-105 hover:-translate-y-0.5"
                onClick={() => navigate('/listagem-tarot')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Tarot
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-slate-600 transition-all duration-300 text-sm font-medium rounded-xl px-4 py-2 hover:scale-105 hover:-translate-y-0.5 ${
                    isTarotPage 
                      ? 'hover:text-purple-600 hover:bg-purple-50' 
                      : 'hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                  <ChevronDown className="h-3 w-3 ml-2 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2"
              >
                <DropdownMenuItem 
                  onClick={() => navigate(isTarotPage ? '/relatorio-individual-tarot' : '/relatorio-individual')}
                  className="rounded-xl hover:bg-blue-50 transition-all duration-200 cursor-pointer p-3"
                >
                  <Users className="h-4 w-4 mr-3 text-blue-600" />
                  <span className="font-medium">Relatórios Individuais</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate(isTarotPage ? '/relatorios-frequenciais-tarot' : '/relatorios-financeiros')}
                  className="rounded-xl hover:bg-purple-50 transition-all duration-200 cursor-pointer p-3"
                >
                  <BarChart3 className="h-4 w-4 mr-3 text-purple-600" />
                  <span className="font-medium">Relatórios Financeiros</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              className={`text-white h-10 px-6 text-sm font-medium transition-all duration-300 rounded-xl hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl btn-elegant ${
                isTarotPage 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
              onClick={() => navigate(isTarotPage ? '/analise-frequencial' : '/novo-atendimento')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isTarotPage ? 'Nova Análise' : 'Novo Atendimento'}
            </Button>
            
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
