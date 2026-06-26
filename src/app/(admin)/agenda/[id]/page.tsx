"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Calendar as CalendarIcon, User, Scissors, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { appointmentService } from "@/services/appointment.service";
import { useClients } from "@/hooks/useClients";
import { useBarbers } from "@/hooks/useBarbers";
import { useServices } from "@/hooks/useServices";
import { useAuth } from "@/hooks/useAuth";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { useToastContext } from "@/contexts/ToastContext";
import { formatDateBR } from "@/lib/date-utils";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  in_progress: "Em Andamento",
  completed: "Finalizado",
  canceled: "Cancelado",
  no_show: "Não Compareceu",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-white/5 text-white border-white/10",
  confirmed: "bg-white/10 text-white border-white/20",
  in_progress: "bg-primary/50 text-white border-primary",
  completed: "bg-primary text-white border-primary",
  canceled: "bg-red-900/50 text-red-300 border-red-900/50",
  no_show: "bg-zinc-800/80 text-zinc-500 border-zinc-700/50",
};

export default function DetalhesAgendamentoPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const { user, role, barbershopId } = useAuth();
  const { success, error } = useToastContext();
  
  const { clients } = useClients();
  const { barbers } = useBarbers();
  const { services } = useServices();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const canEdit = role === "owner" || role === "manager" || (user && appointment?.barberId === user.uid);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await appointmentService.getAppointmentById(appointmentId);
        if (data && data.barbershopId === barbershopId) {
          setAppointment(data);
        } else {
          router.push("/agenda");
        }
      } catch (err) {
        console.error(err);
        router.push("/agenda");
      } finally {
        setLoading(false);
      }
    };
    
    if (barbershopId && appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, barbershopId, router]);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!appointment) return;
    try {
      setUpdating(true);
      await appointmentService.changeStatus(appointment.id, newStatus);
      setAppointment({ ...appointment, status: newStatus });
      success("Status Atualizado", `O agendamento agora está: ${STATUS_LABELS[newStatus]}`);
    } catch (err) {
      error("Erro", "Falha ao atualizar o status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      handleStatusChange("canceled");
    }
  };

  if (loading) {
    return <PageContainer title="Carregando..."><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  if (!appointment) return null;

  const client = clients.find(c => c.id === appointment.clientId);
  const barber = barbers.find(b => b.id === appointment.barberId);
  const service = services.find(s => s.id === appointment.serviceId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <PageContainer 
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/agenda")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      }
    >
      <div className="mt-6 max-w-3xl mx-auto space-y-6">
        
        {/* Status Header */}
        <Card className="p-6 bg-white/5 border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Detalhes do Agendamento</h2>
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${STATUS_COLORS[appointment.status]}`}>
              <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
              {STATUS_LABELS[appointment.status]}
            </div>
          </div>
          
          {canEdit && appointment.status !== "canceled" && appointment.status !== "completed" && (
            <div className="flex flex-wrap gap-2 justify-end">
              {appointment.status === "scheduled" && (
                <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10" onClick={() => handleStatusChange("confirmed")} isLoading={updating}>
                  Confirmar Presença
                </Button>
              )}
              {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10" onClick={() => handleStatusChange("in_progress")} isLoading={updating}>
                  Iniciar Atendimento
                </Button>
              )}
              {appointment.status === "in_progress" && (
                <Button size="sm" variant="outline" className="border-white/30 text-zinc-200 hover:bg-white/10" onClick={() => handleStatusChange("completed")} isLoading={updating}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar
                </Button>
              )}
              <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={handleCancel} isLoading={updating}>
                <XCircle className="w-4 h-4 mr-2" /> Cancelar
              </Button>
            </div>
          )}
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 bg-white/5 border-white/10 space-y-4">
             <div className="flex items-center gap-3">
               <div className="bg-primary/20 p-2.5 rounded-lg text-primary"><CalendarIcon className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs text-white/50">Data e Hora</p>
                 <p className="font-semibold text-white">{formatDateBR(appointment.date)} • {appointment.startTime} às {appointment.endTime}</p>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               <div className="bg-white/10 p-2.5 rounded-lg text-zinc-200"><User className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs text-white/50">Cliente</p>
                 <p className="font-semibold text-white">{client?.name || "Desconhecido"}</p>
                 <p className="text-xs text-white/40">{client?.phone}</p>
               </div>
             </div>

             <div className="flex items-center gap-3">
               <div className="bg-purple-500/20 p-2.5 rounded-lg text-purple-400"><Scissors className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs text-white/50">Profissional Responsável</p>
                 <p className="font-semibold text-white">{barber?.name || "Desconhecido"}</p>
               </div>
             </div>
          </Card>

          <Card className="p-5 bg-white/5 border-white/10 flex flex-col justify-between">
             <div>
               <h3 className="text-white/50 text-xs mb-1 uppercase tracking-wider">Serviço Realizado</h3>
               <p className="text-lg font-bold text-white">{service?.name || "Serviço Removido"}</p>
               <p className="text-sm text-white/50">{service?.duration} min</p>
             </div>

             <div className="mt-6 p-4 bg-background rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">Valor do Serviço</span>
                  <span className="font-medium text-white">{formatCurrency(appointment.price)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2 mt-2">
                  <span className="text-white/40">Comissão ({barber?.commissionType === 'percentage' ? barber?.commissionValue + '%' : 'Fixo'})</span>
                  <span className="text-zinc-200">{formatCurrency(appointment.commission)}</span>
                </div>
             </div>
          </Card>
        </div>

        {appointment.notes && (
          <Card className="p-5 bg-white/5 border-white/10">
            <h3 className="text-sm font-medium text-white/70 mb-2">Observações</h3>
            <p className="text-sm text-white/90 whitespace-pre-line bg-background p-4 rounded-lg">{appointment.notes}</p>
          </Card>
        )}

      </div>
    </PageContainer>
  );
}
