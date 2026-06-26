"use client";

import React from "react";
import Link from "next/link";
import { Crown, Star, Medal, Award } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useClients } from "@/hooks/useClients";

export default function FidelidadePage() {
  const { profiles, loading } = useLoyalty();
  const { clients } = useClients();

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || "Desconhecido";

  // Tier Counts
  const vips = profiles.filter(p => p.tier === "vip").length;
  const golds = profiles.filter(p => p.tier === "gold").length;
  const silvers = profiles.filter(p => p.tier === "silver").length;
  const bronzes = profiles.filter(p => p.tier === "bronze").length;

  return (
    <PageContainer 
      title="Programa de Fidelidade e CRM" 
      description="Gamificação e acompanhamento dos seus melhores clientes."
    >
      <div className="mt-6 space-y-6">
        
        {/* Tier Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Clientes VIP"
            subtitle="2000+ pontos"
            value={vips}
            icon={Crown}
            colorClass="text-yellow-400 bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
          />
          <MetricCard
            title="Clientes Gold"
            subtitle="1000 - 1999 pontos"
            value={golds}
            icon={Medal}
            colorClass="text-amber-400 bg-amber-500/20"
          />
          <MetricCard
            title="Clientes Silver"
            subtitle="500 - 999 pontos"
            value={silvers}
            icon={Award}
            colorClass="text-gray-300 bg-gray-400/20"
          />
          <MetricCard
            title="Clientes Bronze"
            subtitle="Até 499 pontos"
            value={bronzes}
            icon={Star}
            colorClass="text-orange-700 bg-orange-700/20"
          />
        </div>

        {/* Top Loyalty Ranking */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="text-lg font-medium text-white">Ranking de Fidelidade (Top Clientes)</h3>
          </div>
          
          {loading ? (
             <div className="text-center py-10 text-white/50">Carregando ranking...</div>
          ) : profiles.length === 0 ? (
             <div className="text-center py-10 text-white/50">Nenhum cliente pontuou ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-background text-white/50">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16 text-center">Posição</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium text-center">Nível Atual</th>
                    <th className="px-4 py-3 font-medium text-right">Pontos</th>
                    <th className="px-4 py-3 font-medium text-right">Total Investido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {profiles.slice(0, 50).map((p, index) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-white/30'}`}>
                           {index + 1}º
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/clientes/${p.clientId}`} className="font-medium text-white hover:text-zinc-200 transition-colors">
                          {getClientName(p.clientId)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase rounded border
                          ${p.tier === 'vip' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            p.tier === 'gold' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                            p.tier === 'silver' ? 'bg-gray-400/20 text-gray-300 border-gray-400/50' :
                            'bg-orange-700/20 text-orange-400 border-orange-700/50'
                          }`}
                        >
                          {p.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-200">
                        {p.points} pts
                      </td>
                      <td className="px-4 py-3 text-right text-white/50">
                        R$ {p.totalSpent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
}
