export interface DashboardMetrics {
  totalRevenue: number;
  averageTicket: number;
  appointmentsCount: number;
  activeClientsCount: number;
  completedAppointments: number;
  canceledAppointments: number;
  noShowAppointments: number;
  commissionTotal: number; // Relevante principalmente para o dashboard do barbeiro
}

export interface ChartDataPoint {
  date: string;       // Data formatada (ex: 01/06)
  revenue: number;    // Faturamento no dia
  appointments: number; // Agendamentos no dia
}

export interface BarberRanking {
  barberId: string;
  name: string;
  revenue: number;
  appointmentsCount: number;
}

export interface ServiceRanking {
  serviceId: string;
  name: string;
  revenue: number;
  count: number;
}

export type DateFilter = "today" | "7d" | "30d" | "month";
