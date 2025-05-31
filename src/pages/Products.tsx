import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Package } from 'lucide-react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const Products = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <DashboardHeader />

      <main className="container mx-auto py-24 px-4 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#6B21A8] bg-gradient-to-r from-[#6B21A8] to-purple-600 bg-clip-text text-transparent">
                Produtos e Serviços
              </h1>
              <p className="text-[#6B21A8] mt-1 opacity-80">Gerencie seus produtos e serviços oferecidos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total de Produtos"
            value="25"
            icon={<Package className="h-8 w-8 text-[#6B21A8]" />}
          />
          <StatCard
            title="Produtos Ativos"
            value="20"
            icon={<CheckCircle className="h-8 w-8 text-[#6B21A8]" />}
          />
          <StatCard
            title="Produtos Inativos"
            value="5"
            icon={<XCircle className="h-8 w-8 text-[#6B21A8]" />}
          />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#6B21A8]">Lista de Produtos</CardTitle>
            <CardDescription>Visualize e gerencie seus produtos e serviços</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/50 border border-white/30 rounded-xl mb-6">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white transition-all duration-300 hover:bg-[#6B21A8]/10"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white transition-all duration-300 hover:bg-[#6B21A8]/10"
                >
                  Ativos
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white transition-all duration-300 hover:bg-[#6B21A8]/10"
                >
                  Inativos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div>
                  <ProductItem name="Analise Frequencial" description="Analise completa do campo frequencial" price="R$ 150,00" status="Ativo" />
                  <ProductItem name="Mentoria Individual" description="Sessao de mentoria individual" price="R$ 300,00" status="Ativo" />
                </div>
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                <div>
                  <ProductItem name="Analise Frequencial" description="Analise completa do campo frequencial" price="R$ 150,00" status="Ativo" />
                  <ProductItem name="Mentoria Individual" description="Sessao de mentoria individual" price="R$ 300,00" status="Ativo" />
                </div>
              </TabsContent>

              <TabsContent value="inactive" className="space-y-4">
                <div>
                  <p>Nenhum produto inativo encontrado.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProductItem = ({ name, description, price, status }: { name: string; description: string; price: string; status: string }) => (
  <Card className="bg-white/80 border border-white/30 hover:bg-white/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] animate-fade-in group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{name}</h3>
          <p className="text-sm text-slate-600 mt-2">{description}</p>
          <p className="text-sm text-emerald-600 font-medium mt-3">{price}</p>
        </div>
        <div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">{status}</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Products;
