"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Store, Users, DollarSign, Activity } from "lucide-react";

export default function MasterDashboardPage() {
  const [stats, setStats] = useState({
    totalBarbershops: 0,
    totalUsers: 0,
    activeBarbershops: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Devido à regra isMaster(), o usuário master pode ler a coleção inteira
        const shopsSnap = await getDocs(collection(db, "barbershops"));
        const usersSnap = await getDocs(collection(db, "users"));

        setStats({
          totalBarbershops: shopsSnap.size,
          activeBarbershops: shopsSnap.docs.filter(d => d.data().active !== false).length,
          totalUsers: usersSnap.size,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas globais:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Visão Global do SaaS</h1>
        <p className="text-slate-400">Acompanhe o crescimento e a saúde da sua plataforma Navallia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total de Barbearias</p>
            <h3 className="text-2xl font-bold text-white">
              {loading ? "..." : stats.totalBarbershops}
            </h3>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-white/10 text-zinc-200">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Barbearias Ativas</p>
            <h3 className="text-2xl font-bold text-white">
              {loading ? "..." : stats.activeBarbershops}
            </h3>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/20 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total de Usuários</p>
            <h3 className="text-2xl font-bold text-white">
              {loading ? "..." : stats.totalUsers}
            </h3>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">MRR Estimado</p>
            <h3 className="text-2xl font-bold text-white">
              {/* Fake MRR computation just as example: 99 BRL per active shop */}
              {loading ? "..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.activeBarbershops * 99)}
            </h3>
          </div>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Bem-vindo à Sala de Controle</h3>
        <p className="text-slate-400">
          Você está logado como Master. Esta área ignora as restrições normais de locatário (tenant) e permite acesso total a todas as empresas cadastradas no banco de dados. Utilize com cautela.
        </p>
      </div>
    </div>
  );
}
