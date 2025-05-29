
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserIcon, LogOut } from 'lucide-react';

const UserMenu = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    toast({
      title: 'Logout realizado',
      description: 'Você saiu do sistema com sucesso.'
    });
  };

  if (!currentUser) return null;

  const getInitials = () => {
    if (!currentUser.username) return 'U';
    return currentUser.username
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200">
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black text-xs font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-black/90 border border-white/20 backdrop-blur-md"
      >
        <DropdownMenuLabel className="text-white">Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator className="border-white/20" />
        <DropdownMenuItem disabled className="flex justify-between text-white/80">
          <span className="text-sm">{currentUser.username}</span>
          <UserIcon className="h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-xs text-white/60">
          {currentUser.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="border-white/20" />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-400 focus:text-red-300 focus:bg-red-500/20 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
