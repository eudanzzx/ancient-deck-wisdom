
import React from "react";
import { Sparkles, Star } from "lucide-react";
import Logo from "@/components/Logo";

const DashboardTitle: React.FC = () => {
  return (
    <div className="mb-12 flex items-center justify-between animate-slide-up">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
          <div className="relative transform hover:scale-110 transition-transform duration-300 cursor-pointer bg-white rounded-full p-2">
            <Logo height={60} width={60} />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-800 via-purple-700 to-blue-800 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
            Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <p className="text-blue-600/80 font-medium tracking-wide">Gerencie seus atendimentos com elegância</p>
            <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center gap-3 group cursor-pointer">
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2 text-blue-600/70 hover:text-blue-600 transition-all duration-300">
            <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <span className="text-sm font-semibold tracking-wide uppercase">Sistema Inteligente</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Powered by AI Technology</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default DashboardTitle;
