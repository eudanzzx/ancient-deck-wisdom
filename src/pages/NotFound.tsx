
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F7FF] p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
        <CardContent className="py-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#0EA5E9] mb-4">404</h1>
          <h3 className="text-xl font-medium text-slate-600 mb-4">Página não encontrada</h3>
          <p className="text-slate-500 mb-6">A página que você está procurando não existe ou foi removida.</p>
          <Button 
            asChild
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
          >
            <a href="/">Voltar ao Início</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
