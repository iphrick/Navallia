"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppointments } from "@/hooks/useAppointments";
import { useBarbers } from "@/hooks/useBarbers";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { Appointment } from "@/types/appointment";
import { generateTimeSlots } from "@/lib/date-utils";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-white/5 text-white border-white/10",
  confirmed: "bg-white/10 text-white border-white/20",
  in_progress: "bg-primary/50 text-white border-primary",
  completed: "bg-primary text-white border-primary",
  canceled: "bg-red-900/50 text-red-300 border-red-900/50",
  no_show: "bg-zinc-800/80 text-zinc-500 border-zinc-700/50",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  in_progress: "Em Andamento",
  completed: "Finalizado",
  canceled: "Cancelado",
  no_show: "Não Compareceu",
};

export default function AgendaPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const { appointments, loading, fetchByDate } = useAppointments();
  const { barbers } = useBarbers();
  const { clients } = useClients();
  const { services } = useServices();

  const activeBarbers = barbers.filter(b => b.active);
  const timeSlots = generateTimeSlots("08:00", "20:00", 30); // 30 min interval

  useEffect(() => {
    // ISO date string like "YYYY-MM-DD"
    const dateStr = format(currentDate, "yyyy-MM-dd");
    fetchByDate(dateStr);
  }, [currentDate, fetchByDate]);

  const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || "Cliente Excluído";
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || "Serviço";

  // Função para checar se um slot possui agendamento
  // Para visualização simplificada: apenas mostramos a hora de início exata do agendamento no slot.
  const getAppointmentForSlot = (barberId: string, time: string) => {
    return appointments.find(app => app.barberId === barberId && app.startTime === time && app.status !== "canceled");
  };

  // Mobile list view
  const mobileAppointments = useMemo(() => {
    return [...appointments].filter(a => a.status !== "canceled").sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments]);

  return (
    <PageContainer 
      title="Agenda Diária" 
      description="Controle e visualização de todos os agendamentos da equipe."
      actions={
        <Link href="/agenda/novo">
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Agendamento</Button>
        </Link>
      }
    >
      <div className="mt-6 space-y-6">
        {/* Date Selector & Metrics */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePrevDay}><ChevronLeft className="h-4 w-4" /></Button>
            <div 
              className="w-56 relative group flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
              onClick={() => dateInputRef.current?.showPicker()}
            >
              <CalendarIcon className="h-4 w-4 text-white/50" />
              <span className="font-semibold text-white capitalize">{format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
              <input 
                ref={dateInputRef}
                type="date" 
                value={format(currentDate, "yyyy-MM-dd")}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    setCurrentDate(new Date(year, month - 1, day));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleNextDay}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="secondary" size="sm" onClick={handleToday} className="ml-2">Hoje</Button>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-white/50 mb-0.5">Agendamentos</p>
              <p className="font-bold text-white text-lg">{appointments.filter(a => a.status !== "canceled").length}</p>
            </div>
            <div className="text-center">
              <p className="text-white/50 mb-0.5">Finalizados</p>
              <p className="font-bold text-zinc-200 text-lg">{appointments.filter(a => a.status === "completed").length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/50 flex flex-col items-center gap-2">
            <Clock className="h-8 w-8 animate-spin text-white/30" />
            <p>Sincronizando agenda...</p>
          </div>
        ) : (
          <>
            {/* Desktop Grid View */}
            <div className="hidden lg:block overflow-x-auto border border-white/10 rounded-xl bg-background">
              <div className="min-w-max flex">
                
                {/* Time Column */}
                <div className="w-20 flex-shrink-0 border-r border-white/10 bg-white/5">
                  <div className="h-12 border-b border-white/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white/30" />
                  </div>
                  {timeSlots.map(time => (
                    <div key={time} className="h-20 border-b border-white/5 flex items-start justify-center pt-2">
                      <span className="text-xs text-white/40 font-medium">{time}</span>
                    </div>
                  ))}
                </div>

                {/* Barbers Columns */}
                {activeBarbers.map(barber => (
                  <div key={barber.id} className="w-64 flex-shrink-0 border-r border-white/10">
                    <div className="h-12 border-b border-white/10 bg-white/5 flex items-center justify-center gap-2 px-2">
                       {barber.avatarUrl ? (
                         <img src={barber.avatarUrl} alt={barber.name} className="w-6 h-6 rounded-full object-cover" />
                       ) : (
                         <User className="w-4 h-4 text-white/50" />
                       )}
                       <span className="font-medium text-sm text-white truncate">{barber.name}</span>
                    </div>
                    
                    {timeSlots.map(time => {
                      const app = getAppointmentForSlot(barber.id, time);
                      return (
                        <div key={`${barber.id}-${time}`} className="h-20 border-b border-white/5 relative group p-1">
                          {/* Hover effect to create new appointment in this slot */}
                          <Link href={`/agenda/novo?barberId=${barber.id}&time=${time}&date=${format(currentDate, "yyyy-MM-dd")}`} 
                                className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-white/5 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <Plus className="h-5 w-5 text-white/50" />
                          </Link>

                          {app && (
                            <div 
                              onClick={() => router.push(`/agenda/${app.id}`)}
                              className={`relative z-10 w-full h-full p-2 rounded-lg border cursor-pointer hover:brightness-110 transition-all ${STATUS_COLORS[app.status]} flex flex-col justify-center`}
                            >
                              <div className="font-medium text-sm truncate">{getClientName(app.clientId)}</div>
                              <div className="text-xs opacity-80 truncate">{getServiceName(app.serviceId)}</div>
                              <div className="text-[10px] opacity-60 uppercase font-bold mt-1 tracking-wider">
                                {STATUS_LABELS[app.status]}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile List View */}
            <div className="lg:hidden space-y-4">
              {mobileAppointments.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10">
                  <XCircle className="h-8 w-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/50">Nenhum agendamento para este dia.</p>
                </div>
              ) : (
                mobileAppointments.map(app => {
                  const barber = barbers.find(b => b.id === app.barberId);
                  return (
                    <Card key={app.id} className="p-4 bg-white/5 border-white/10 flex gap-4" onClick={() => router.push(`/agenda/${app.id}`)}>
                      <div className="flex flex-col items-center justify-center border-r border-white/10 pr-4 w-16">
                        <span className="text-lg font-bold text-white">{app.startTime}</span>
                        <span className="text-xs text-white/40">{app.endTime}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{getClientName(app.clientId)}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[app.status]}`}>
                             {STATUS_LABELS[app.status]}
                           </span>
                        </div>
                        <div className="text-sm text-white/50 mt-2 flex items-center gap-2">
                           <User className="h-3.5 w-3.5" /> {barber?.name || "Barbeiro"} • {getServiceName(app.serviceId)}
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
