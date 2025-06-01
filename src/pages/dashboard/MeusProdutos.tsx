
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Zap } from "lucide-react";

interface Product {
  id: string;
  name: string;
  licenseType: 'Mensal' | 'Lifetime' | 'External';
  status: 'active' | 'inactive';
  activationDate: string;
  expirationDate?: string;
}

const MeusProdutos = () => {
  // Mock data - replace with real data from your backend
  const products: Product[] = [
    {
      id: '1',
      name: 'TZX Advanced',
      licenseType: 'Lifetime',
      status: 'active',
      activationDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Cheat Barzinho',
      licenseType: 'Mensal',
      status: 'active',
      activationDate: '2024-01-10',
      expirationDate: '2024-02-10',
    },
    {
      id: '3',
      name: 'TZX Basic',
      licenseType: 'External',
      status: 'inactive',
      activationDate: '2023-12-01',
      expirationDate: '2023-12-31',
    },
  ];

  const activeProducts = products.filter(p => p.status === 'active');

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500';
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'Lifetime': return 'bg-purple-600';
      case 'Mensal': return 'bg-blue-600';
      case 'External': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  if (activeProducts.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="mb-6">
            <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum produto ativo</h3>
            <p className="text-gray-400 mb-6">Você não possui produtos ativos no momento.</p>
          </div>
          <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-full">
            Adquirir Produto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Meus Produtos</h2>
        <p className="text-gray-400">Gerencie seus produtos e licenças</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(product.status)}`}></div>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getLicenseTypeColor(product.licenseType)} text-white border-0`}>
                  {product.licenseType}
                </Badge>
                <Badge variant={product.status === 'active' ? 'default' : 'destructive'}>
                  {product.status === 'active' ? 'Ativo' : 'Expirado'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ativação:</span>
                  <span className="text-white">{new Date(product.activationDate).toLocaleDateString('pt-BR')}</span>
                </div>
                {product.expirationDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vencimento:</span>
                    <span className="text-white">{new Date(product.expirationDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {activeProducts.length > 0 && (
        <div className="mt-8 text-center">
          <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-full">
            Adquirir Mais Produtos
          </Button>
        </div>
      )}
    </div>
  );
};

export default MeusProdutos;
