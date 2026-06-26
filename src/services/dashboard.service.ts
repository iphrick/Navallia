import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Appointment } from "@/types/appointment";
import { Barber } from "@/types/barber";
import { Service } from "@/types/service";
import { DashboardMetrics, ChartDataPoint, BarberRanking, ServiceRanking } from "@/types/dashboard";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dashboardService = {
  /**
   * Obtém as métricas base (KPIs) e os dados agregados de uma barbearia em um intervalo
   */
  async getDashboardData(
    barbershopId: string, 
    startDate: string, 
    endDate: string,
    barberId?: string // Se fornecido, filtra dados apenas para aquele barbeiro
  ) {
    // 1. Buscar os Agendamentos do Período
    const appointmentsRef = collection(db, "appointments");
    let q = query(
      appointmentsRef,
      where("barbershopId", "==", barbershopId),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    
    // NOTA: No Firebase, para combinar orderBy com where em campos diferentes, 
    // precisaríamos criar um Índice Composto na nuvem. 
    // Para simplificar e evitar o erro "Index Required" pro usuário, 
    // vamos trazer todos do range e filtrar em memória o `barberId`.

    const snapshot = await getDocs(q);
    let appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];

    // Aplica filtro de barbeiro em memória, se aplicável
    if (barberId) {
      appointments = appointments.filter(app => app.barberId === barberId);
    }

    // 2. Buscar Contagem Total de Clientes Ativos (Apenas Owner vê o todo, mas ok)
    let activeClientsCount = 0;
    if (!barberId) {
      try {
        const clientsRef = collection(db, "clients");
        const clientsQuery = query(clientsRef, where("barbershopId", "==", barbershopId), where("active", "==", true));
        const clientsSnap = await getCountFromServer(clientsQuery);
        activeClientsCount = clientsSnap.data().count;
      } catch (err) {
        console.warn("Sem permissão para contar clientes ou erro", err);
      }
    }

    // 3. Processar Métricas
    let totalRevenue = 0;
    let commissionTotal = 0;
    let completedAppointments = 0;
    let canceledAppointments = 0;
    let noShowAppointments = 0;

    // Estruturas auxiliares para Rankings e Gráficos
    const chartMap: Record<string, { revenue: number, appointments: number }> = {};
    const barberMap: Record<string, { revenue: number, count: number }> = {};
    const serviceMap: Record<string, { revenue: number, count: number }> = {};

    appointments.forEach(app => {
      // 3.1 Status
      if (app.status === "completed") completedAppointments++;
      if (app.status === "canceled") canceledAppointments++;
      if (app.status === "no_show") noShowAppointments++;

      // Só consideramos receita e comissão se o serviço foi completado (ou in_progress/confirmed dependendo da regra, mas completed é mais seguro)
      // Para visão geral, vamos assumir que o que foi agendado é "Previsão", mas vamos somar apenas completed para receita real.
      // O briefing fala "Receita", assumiremos finalizados.
      if (app.status === "completed") {
        totalRevenue += app.price;
        commissionTotal += app.commission;

        // Chart Data Agregada por Data
        if (!chartMap[app.date]) {
          chartMap[app.date] = { revenue: 0, appointments: 0 };
        }
        chartMap[app.date].revenue += app.price;
        chartMap[app.date].appointments += 1;

        // Barber Ranking
        if (!barberMap[app.barberId]) {
          barberMap[app.barberId] = { revenue: 0, count: 0 };
        }
        barberMap[app.barberId].revenue += app.price;
        barberMap[app.barberId].count += 1;

        // Service Ranking
        if (!serviceMap[app.serviceId]) {
          serviceMap[app.serviceId] = { revenue: 0, count: 0 };
        }
        serviceMap[app.serviceId].revenue += app.price;
        serviceMap[app.serviceId].count += 1;
      }
    });

    // 4. Montar Objetos Finais

    const metrics: DashboardMetrics = {
      totalRevenue,
      averageTicket: completedAppointments > 0 ? totalRevenue / completedAppointments : 0,
      appointmentsCount: appointments.length,
      activeClientsCount,
      completedAppointments,
      canceledAppointments,
      noShowAppointments,
      commissionTotal
    };

    // Montar chart array (ordem cronológica)
    const chartData: ChartDataPoint[] = Object.keys(chartMap)
      .sort()
      .map(dateStr => ({
        date: format(parseISO(dateStr), "dd/MM"),
        revenue: chartMap[dateStr].revenue,
        appointments: chartMap[dateStr].appointments
      }));

    // Retorna IDs para que o frontend popule os Nomes (usando useBarbers e useServices que já tem cache)
    const barberRankingRaw = Object.entries(barberMap)
      .map(([id, data]) => ({ barberId: id, name: "", revenue: data.revenue, appointmentsCount: data.count }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5

    const serviceRankingRaw = Object.entries(serviceMap)
      .map(([id, data]) => ({ serviceId: id, name: "", revenue: data.revenue, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    return {
      metrics,
      chartData,
      barberRankingRaw,
      serviceRankingRaw
    };
  }
};
