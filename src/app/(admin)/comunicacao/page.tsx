"use client";

import { useEffect, useState } from "react";
import { Send, Gift, Clock, RefreshCcw, MessageCircle } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { notificationService, CommunicationTask } from "@/services/notification.service";
import { whatsappUtils } from "@/lib/whatsapp";

export default function ComunicacaoPage() {
  const { barbershopId } = useAuth();
  const [tasks, setTasks] = useState<CommunicationTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!barbershopId) return;
      try {
        const data = await notificationService.getDailyTasks(barbershopId);
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [barbershopId]);

  const handleSendWhatsApp = (task: CommunicationTask) => {
    let message = "";
    
    if (task.type === "birthday") {
      message = whatsappUtils.templates.birthday(task.clientName);
    } else if (task.type === "recovery") {
      message = whatsappUtils.templates.recovery(task.clientName);
    } else if (task.type === "reminder") {
      message = whatsappUtils.templates.reminder(task.clientName, "Amanhã", "15:00", "Corte e Barba"); // Mock, pois não temos a agenda
    }

    const link = whatsappUtils.generateLink(task.phone, message);
    window.open(link, "_blank");
  };

  const birthdays = tasks.filter(t => t.type === "birthday");
  const recoveries = tasks.filter(t => t.type === "recovery");

  return (
    <PageContainer 
      title="Mesa de Comunicação Ativa" 
      description="Gerencie os disparos de WhatsApp e mantenha os clientes engajados."
    >
      <div className="mt-6 space-y-6">
        
        {/* Aniversariantes */}
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Aniversariantes do Dia</h3>
              <p className="text-sm text-white/50">Mande os parabéns e ofereça um trato no visual.</p>
            </div>
            <div className="ml-auto bg-white/10 px-3 py-1 rounded-full text-white/70 text-sm font-bold">
              {birthdays.length}
            </div>
          </div>

          {loading ? (
             <div className="text-sm text-white/40">Buscando tarefas...</div>
          ) : birthdays.length === 0 ? (
             <div className="text-sm text-white/40 border border-dashed border-white/10 p-6 rounded-lg text-center">Nenhum aniversariante hoje.</div>
          ) : (
            <div className="space-y-3">
              {birthdays.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium text-white">{task.clientName}</p>
                    <p className="text-xs text-white/40">{task.phone}</p>
                  </div>
                  <Button size="sm" onClick={() => handleSendWhatsApp(task)} className="bg-primary hover:bg-primary/80 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Enviar Parabéns
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recuperação de Inativos */}
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recuperação de Inativos</h3>
              <p className="text-sm text-white/50">Clientes marcados como inativos. Tente resgatá-los.</p>
            </div>
            <div className="ml-auto bg-white/10 px-3 py-1 rounded-full text-white/70 text-sm font-bold">
              {recoveries.length}
            </div>
          </div>

          {loading ? (
             <div className="text-sm text-white/40">Buscando tarefas...</div>
          ) : recoveries.length === 0 ? (
             <div className="text-sm text-white/40 border border-dashed border-white/10 p-6 rounded-lg text-center">Nenhum cliente inativo na base.</div>
          ) : (
            <div className="space-y-3">
              {recoveries.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium text-white">{task.clientName}</p>
                    <p className="text-xs text-white/40">{task.phone}</p>
                  </div>
                  <Button size="sm" onClick={() => handleSendWhatsApp(task)} className="bg-primary hover:bg-primary/80 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Enviar Mensagem
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </PageContainer>
  );
}
