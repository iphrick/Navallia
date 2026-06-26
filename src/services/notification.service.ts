import { clientService } from "@/services/client.service";
import { format, addDays, isSameDay, isSameMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface CommunicationTask {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  type: "birthday" | "reminder" | "recovery";
  contextMessage: string;
}

export const notificationService = {
  
  /**
   * Busca as tarefas de comunicação do dia (CRM Ativo)
   * Nota: Como não temos integração do calendário real pronta (Agendamentos vindo do Banco),
   * vamos focar as automações usando a base de Clientes.
   */
  async getDailyTasks(barbershopId: string): Promise<CommunicationTask[]> {
    const clients = await clientService.getClients(barbershopId);
    const tasks: CommunicationTask[] = [];
    const today = new Date();

    for (const client of clients) {
      if (!client.phone && !client.whatsapp) continue; // Sem número não dá pra mandar zap
      
      const phone = client.whatsapp || client.phone || "";

      // 1. ANIVERSARIANTES DO DIA
      if (client.birthDate) {
        // Assume format YYYY-MM-DD
        const [, month, day] = client.birthDate.split("-");
        const bdayThisYear = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
        
        if (isSameDay(bdayThisYear, today)) {
          tasks.push({
            id: `bday_${client.id}`,
            clientId: client.id,
            clientName: client.name,
            phone,
            type: "birthday",
            contextMessage: "Aniversariante de hoje! Mande parabéns."
          });
        }
      }

      // 2. RECUPERAÇÃO DE INATIVOS (Ex: Clientes não ativos / sumidos)
      // Como não temos a flag "lastVisit" atrelada perfeitamente ainda sem Módulo Agenda 100% full, 
      // usaremos a flag de inativo como base pra recuperação de relacionamento
      if (!client.active) {
        tasks.push({
          id: `recov_${client.id}`,
          clientId: client.id,
          clientName: client.name,
          phone,
          type: "recovery",
          contextMessage: "Cliente inativo. Tente reativar o relacionamento."
        });
      }
    }

    return tasks;
  }
};
