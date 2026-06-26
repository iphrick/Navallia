"use client";

import { useMemo } from "react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { useClients } from "@/hooks/useClients";
import { Users, UserPlus, Star, UserX, Cake } from "lucide-react";
import { format, isThisMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function ClientesDashboardPage() {
  const { clients, loading } = useClients();

  const stats = useMemo(() => {
    const total = clients.length;
    const vips = clients.filter(c => c.totalSpent >= 1000).length;
    const inativos = clients.filter(c => !c.active).length;
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    const novos = clients.filter(c => {
      const createdAt = c.createdAt instanceof Date ? c.createdAt : (c.createdAt as any).toDate();
      return createdAt >= thirtyDaysAgo;
    }).length;

    return { total, vips, inativos, novos };
  }, [clients]);

  const birthdays = useMemo(() => {
    return clients
      .filter(c => c.active && c.birthDate)
      .filter(c => {
        // We only care about the month for "Aniversariantes do Mês"
        // Since birthDate is a string YYYY-MM-DD
        const month = c.birthDate?.split('-')[1];
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        return month === currentMonth;
      })
      .sort((a, b) => {
        const dayA = a.birthDate?.split('-')[2] || '0';
        const dayB = b.birthDate?.split('-')[2] || '0';
        return parseInt(dayA) - parseInt(dayB);
      });
  }, [clients]);

  // Mock data for charts - in real scenario, aggregate from clients
  const growthData = [
    { name: 'Jan', clientes: 10 },
    { name: 'Fev', clientes: 25 },
    { name: 'Mar', clientes: 45 },
    { name: 'Abr', clientes: 80 },
    { name: 'Mai', clientes: 120 },
    { name: 'Jun', clientes: stats.total },
  ];

  const vipData = [
    { name: 'Comum', value: stats.total - stats.vips },
    { name: 'VIP', value: stats.vips },
  ];

  if (loading) {
    return <PageContainer title="Dashboard"><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  return (
    <PageContainer 
      title="Dashboard de Clientes" 
      description="Visão geral e indicadores da sua base de clientes."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-lg text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Total de Clientes</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-lg text-zinc-200">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Novos (30 dias)</p>
            <p className="text-2xl font-bold text-white">{stats.novos}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-lg text-yellow-400">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Clientes VIP</p>
            <p className="text-2xl font-bold text-white">{stats.vips}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <div className="bg-red-500/20 p-3 rounded-lg text-red-400">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/50">Clientes Inativos</p>
            <p className="text-2xl font-bold text-white">{stats.inativos}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Chart 1 */}
        <Card className="p-6 bg-white/5 border-white/10 lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Crescimento de Cadastro</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff50" />
                <YAxis stroke="#ffffff50" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#ffffff10', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="clientes" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Birthdays Widget */}
        <Card className="p-6 bg-white/5 border-white/10 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Cake className="h-5 w-5 text-pink-400" />
            <h3 className="text-lg font-medium text-white">Aniversariantes do Mês</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {birthdays.length === 0 ? (
              <p className="text-sm text-white/50 text-center py-10">
                Nenhum aniversariante neste mês.
              </p>
            ) : (
              birthdays.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    {client.photoUrl ? (
                       <img src={client.photoUrl} alt={client.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                       <div className="h-8 w-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                         {client.name.charAt(0)}
                       </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{client.name}</p>
                      <p className="text-xs text-white/50">{client.whatsapp}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 px-2 py-1 rounded text-xs font-medium text-white/90">
                    Dia {client.birthDate?.split('-')[2]}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
