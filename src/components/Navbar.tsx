
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';

interface NavbarProps {
  username: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0EA5E9] to-blue-600 rounded-lg flex items-center justify-center">
              <h1 className="text-white font-bold text-sm">L</h1>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0EA5E9]">Libertá</h1>
              <span className="text-slate-600 text-xs">Sistema de Atendimentos</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200">
              <User className="h-4 w-4 text-[#0EA5E9]" />
              <span className="text-slate-700 text-sm font-medium">{username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-600 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
