"use client";

import { useMemo } from "react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { useServices } from "@/hooks/useServices";
import { Scissors, Star, Archive, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ServicosDashboardPage() {
  const { services, loading } = useServices();

  const stats = useMemo(() => {
    const total = services.length;
    const ativos = services.filter(s => s.active).length;
    const inativos = services.filter(s => !s.active).length;
    const destaques = services.filter(s => s.featured).length;

    return { total, ativos, inativos, destaques };
  }, [services]);

  // Mocks that will be populated via agenda and financial module later
  const popularServicesData = [
    { name: 'Corte Degradê', vendas: 145 },
    { name: 'Barba Terapia', vendas: 98 },
    { name: 'Combo (Corte+Barba)', vendas: 75 },
    { name: 'Sobrancelha', vendas: 45 },
    { name: 'Pigmentação', vendas: 30 },
  ];

  const revenueData = [
    { name: 'Corte', value: 4500 },
    { name: 'Barba', value: 2400 },
    { name: 'Combos', value: 3500 },
    { name: 'Química', value: 1200 },
  ];

  if (loading) {
    return <PageContainer title="Dashboard"><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  return (
    <PageContainer 
      title="Dashboard de Serviços" 
      description="Visão geral e indicadores do catálogo de serviços."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-lg text-primary">
            <Scissors className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Total Cadastrado</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-lg text-zinc-200">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Serviços Ativos</p>
            <p className="text-2xl font-bold text-white">{stats.ativos}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-lg text-yellow-400">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Em Destaque</p>
            <p className="text-2xl font-bold text-white">{stats.destaques}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-red-500/20 p-3 rounded-lg text-red-400">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Inativos</p>
            <p className="text-2xl font-bold text-white">{stats.inativos}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Chart 1: Mais Vendidos */}
        <Card className="p-6 bg-white/5 border-white/10 lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Serviços Mais Realizados (Top 5)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularServicesData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#ffffff50" />
                <YAxis dataKey="name" type="category" stroke="#ffffff50" width={100} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#ffffff10', color: '#fff' }}
                />
                <Bar dataKey="vendas" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Receita por Categoria */}
        <Card className="p-6 bg-white/5 border-white/10 flex flex-col">
          <h3 className="text-lg font-medium text-white mb-4">Receita por Categoria</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#ffffff10', color: '#fff' }}
                  formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {revenueData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-white/70">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
