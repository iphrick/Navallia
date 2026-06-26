"use client";

import { useState, useCallback, useEffect } from "react";
import { format, subDays, startOfMonth, endOfMonth, endOfDay } from "date-fns";
import { DashboardMetrics, ChartDataPoint, BarberRanking, ServiceRanking, DateFilter } from "@/types/dashboard";
import { dashboardService } from "@/services/dashboard.service";
import { useAuth } from "@/hooks/useAuth";
import { useBarbers } from "@/hooks/useBarbers";
import { useServices } from "@/hooks/useServices";
import { useToastContext } from "@/contexts/ToastContext";

export function useDashboard() {
  const { user, role, barbershopId } = useAuth();
  const { barbers } = useBarbers();
  const { services } = useServices();
  const { error } = useToastContext();

  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    averageTicket: 0,
    appointmentsCount: 0,
    activeClientsCount: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    noShowAppointments: 0,
    commissionTotal: 0
  });
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [barberRanking, setBarberRanking] = useState<BarberRanking[]>([]);
  const [serviceRanking, setServiceRanking] = useState<ServiceRanking[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!barbershopId) return;

    try {
      setLoading(true);

      const today = new Date();
      let startDateStr = "";
      let endDateStr = format(endOfDay(today), "yyyy-MM-dd");

      switch (dateFilter) {
        case "today":
          startDateStr = format(today, "yyyy-MM-dd");
          break;
        case "7d":
          startDateStr = format(subDays(today, 6), "yyyy-MM-dd");
          break;
        case "30d":
          startDateStr = format(subDays(today, 29), "yyyy-MM-dd");
          break;
        case "month":
          startDateStr = format(startOfMonth(today), "yyyy-MM-dd");
          endDateStr = format(endOfMonth(today), "yyyy-MM-dd");
          break;
      }

      // Se for barbeiro, passa o ID dele para filtrar os dados
      const barberIdToFilter = role === "barber" ? user?.uid : undefined;

      const data = await dashboardService.getDashboardData(
        barbershopId,
        startDateStr,
        endDateStr,
        barberIdToFilter
      );

      setMetrics(data.metrics);
      setChartData(data.chartData);

      // Preenche os nomes usando os dados em cache dos hooks
      const bRanking = data.barberRankingRaw.map(r => {
        const b = barbers.find(b => b.id === r.barberId);
        return { ...r, name: b?.name || "Desconhecido" };
      });
      setBarberRanking(bRanking);

      const sRanking = data.serviceRankingRaw.map(r => {
        const s = services.find(s => s.id === r.serviceId);
        return { ...r, name: s?.name || "Desconhecido" };
      });
      setServiceRanking(sRanking);

    } catch (err) {
      console.error("Erro ao buscar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user, role, dateFilter, barbers, services, error]);

  // Recarrega sempre que o filtro de data ou os dados base mudarem
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    metrics,
    chartData,
    barberRanking,
    serviceRanking,
    loading,
    dateFilter,
    setDateFilter,
    refresh: fetchDashboardData
  };
}
