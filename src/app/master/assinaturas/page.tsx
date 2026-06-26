"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { BarbershopDocument } from "@/types";
import { TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function MasterAssinaturasPage() {
  const [barbershops, setBarbershops] = useState<BarbershopDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDocs(collection(db, "barbershops"));
        setBarbershops(snap.docs.map(d => ({ id: d.id, ...d.data() } as BarbershopDocument)));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const active = barbershops.filter(s => s.subscriptionStatus === "active");
  const overdue = barbershops.filter(s => {
    const due = s.subscriptionDueDate?.toDate();
    return due && due < new Date();
  });
  const trial = barbershops.filter(s => s.subscriptionStatus === "trial");

  const mrr = active.reduce((sum, s) => sum + (s.subscriptionPrice || 0), 0);
  const totalPotential = barbershops.reduce((sum, s) => sum + (s.subscriptionPrice || 0), 0);

  const metrics = [
    {
      label: "MRR (Receita Mensal)",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr),
      sub: `${active.length} assinantes ativos`,
      icon: TrendingUp,
      color: "text-zinc-200",
      bg: "bg-white/10",
    },
    {
      label: "Potencial Total",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPotential),
      sub: `${barbershops.length} clientes cadastrados`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/20",
    },
    {
      label: "Em Período de Teste",
      value: trial.length.toString(),
      sub: "Barbearias no trial",
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Mensalidades Vencidas",
      value: overdue.length.toString(),
      sub: "Aguardando pagamento",
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Planos e Receitas</h1>
        <p className="text-slate-400 mt-1">Visão financeira global da plataforma Navallia SaaS.</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-slate-900 border-slate-800 p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-slate-400">{m.label}</p>
              <div className={`p-2 rounded-lg ${m.bg}`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-slate-500 mt-1">{m.sub}</p>
          </Card>
        ))}
      </div>

      {/* Lista detalhada */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Status de Assinaturas</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando dados...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/50 text-slate-400">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Barbearia</th>
                  <th className="px-6 py-3 text-left font-medium">Plano</th>
                  <th className="px-6 py-3 text-left font-medium">Valor</th>
                  <th className="px-6 py-3 text-left font-medium">Vencimento</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {barbershops.map((shop) => {
                  const dueDate = shop.subscriptionDueDate?.toDate();
                  const isOverdue = dueDate && dueDate < new Date();
                  const status = shop.active === false
                    ? { label: "Bloqueada", cls: "bg-red-500/10 text-red-400" }
                    : isOverdue
                    ? { label: "Vencida", cls: "bg-orange-500/10 text-orange-400" }
                    : shop.subscriptionStatus === "trial"
                    ? { label: "Trial", cls: "bg-yellow-500/10 text-yellow-400" }
                    : { label: "Em Dia", cls: "bg-white/10 text-zinc-200" };

                  return (
                    <tr key={shop.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-slate-200 font-medium">{shop.name}</td>
                      <td className="px-6 py-4 text-slate-400">{shop.subscriptionPlan || "Padrão"}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shop.subscriptionPrice || 0)}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {dueDate ? dueDate.toLocaleDateString('pt-BR') : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {barbershops.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma barbearia cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
