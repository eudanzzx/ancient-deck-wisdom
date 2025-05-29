
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password, rememberMe);
      
      if (success) {
        toast({
          title: 'Login bem-sucedido',
          description: 'Bem-vindo de volta!'
        });
        navigate('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Falha no login',
          description: 'Email ou senha incorretos.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F7FF] p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo height={80} width={80} />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0EA5E9]">
            Libertá
          </CardTitle>
          <p className="text-slate-600">Sistema de Atendimentos</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-white/50 border-white/20 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe" className="text-sm cursor-pointer text-slate-600">Lembrar-me</Label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-[#0EA5E9] hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
