"use client";

import React from "react";
import { DollarSign, Users, Scissors, Target, CalendarDays, TrendingDown, Clock } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RankingList } from "@/components/dashboard/RankingList";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { role } = useAuth();
  const { 
    metrics, 
    chartData, 
    barberRanking, 
    serviceRanking, 
    loading, 
    dateFilter, 
    setDateFilter 
  } = useDashboard();

  const isBarber = role === "barber";
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const DateFilterSelector = () => (
    <select
      className="text-sm rounded-lg px-3 py-2 outline-none transition-colors"
      style={{
        background: "#1C1C1C",
        border: "1px solid #2a2a2a",
        color: "#A3A3A3",
      }}
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value as any)}
    >
      <option value="today">Hoje</option>
      <option value="7d">Últimos 7 dias</option>
      <option value="30d">Últimos 30 dias</option>
      <option value="month">Mês Atual</option>
    </select>
  );

  if (loading) {
    return (
      <PageContainer title="Dashboard">
        <div className="flex flex-col items-center justify-center py-20 text-white/50">
          <Clock className="w-8 h-8 animate-spin mb-4" />
          <p>Analisando dados e gerando insights...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title={isBarber ? "Meu Desempenho" : "Visão Geral"} 
      description="Acompanhe os resultados e métricas em tempo real."
      actions={<DateFilterSelector />}
    >
      <div className="mt-6 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <MetricCard
            title={isBarber ? "Minha Receita Gerada" : "Receita Bruta"}
            value={formatCurrency(metrics.totalRevenue)}
            icon={DollarSign}
            colorClass="text-[#F5F5DC] bg-[#92400E]/20"
          />

          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(metrics.averageTicket)}
            icon={Target}
            colorClass="text-[#A3A3A3] bg-[#404040]/40"
          />

          <MetricCard
            title={isBarber ? "Meus Atendimentos" : "Atendimentos Totais"}
            value={metrics.appointmentsCount}
            subtitle={`${metrics.completedAppointments} finalizados`}
            icon={Scissors}
            colorClass="text-[#92400E] bg-[#92400E]/10"
          />

          {isBarber ? (
             <MetricCard
               title="Comissão Acumulada"
               value={formatCurrency(metrics.commissionTotal)}
               subtitle="Baseada nos serviços finalizados"
               icon={DollarSign}
               colorClass="text-[#F5F5DC] bg-[#404040]/40"
             />
          ) : (
             <MetricCard
               title="Clientes Ativos"
               value={metrics.activeClientsCount}
               subtitle="Cadastrados no sistema"
               icon={Users}
               colorClass="text-[#F5F5DC] bg-[#404040]/40"
             />
          )}
        </div>

        {/* Canceled/NoShow Warning Row (Visible to everyone but mostly management) */}
        {(metrics.canceledAppointments > 0 || metrics.noShowAppointments > 0) && (
           <div
             className="flex gap-4 p-4 rounded-xl"
             style={{
               background: "rgba(239,68,68,0.06)",
               border: "1px solid rgba(239,68,68,0.2)",
               borderLeft: "3px solid rgba(239,68,68,0.5)",
             }}
           >
             <TrendingDown className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
             <div>
               <h4 className="text-sm font-semibold text-red-400 font-display tracking-wide uppercase">
                 Atenção com perdas
               </h4>
               <p className="text-sm text-red-400/70 mt-0.5">
                 Neste período, houve <strong className="text-red-400">{metrics.canceledAppointments}</strong> cancelamentos
                 {" "}e <strong className="text-red-400">{metrics.noShowAppointments}</strong> no-shows.
               </p>
             </div>
           </div>
        )}

        {/* Main Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} title={isBarber ? "Evolução das Minhas Vendas" : "Evolução do Faturamento"} />
          </div>
          
          <div className="space-y-6">
            {!isBarber && (
              <RankingList title="Top Barbeiros" type="barber" data={barberRanking} />
            )}
            <RankingList title="Serviços Mais Vendidos" type="service" data={serviceRanking} />
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
