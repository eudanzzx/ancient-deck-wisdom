
import React from "react";
import { Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

const DashboardTitle: React.FC = () => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="transform hover:scale-110 transition-transform duration-300 cursor-pointer">
          <Logo height={50} width={50} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-blue-600 mt-1 opacity-80">Gerencie seus atendimentos</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-blue-600/60 hover:text-blue-600 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1">
        <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
        <span className="text-sm font-medium">Sistema Inteligente</span>
      </div>
    </div>
  );
};

export default DashboardTitle;
