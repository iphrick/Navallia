import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { isTimeOverlap } from "@/lib/date-utils";

const COLLECTION_NAME = "appointments";

export const appointmentService = {
  /**
   * Obtém agendamentos de uma barbearia em uma data específica
   */
  async getAppointmentsByDate(barbershopId: string, date: string): Promise<Appointment[]> {
    if (!barbershopId || !date) throw new Error("barbershopId and date are required");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      where("date", "==", date),
      orderBy("startTime", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  },

  /**
   * Obtém agendamentos de um barbeiro específico
   */
  async getBarberAppointments(barbershopId: string, barberId: string, date: string): Promise<Appointment[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      where("barberId", "==", barberId),
      where("date", "==", date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Appointment[];
  },

  /**
   * Obtém os agendamentos de um cliente específico (útil para o CRM)
   */
  async getClientAppointments(barbershopId: string, clientId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      where("clientId", "==", clientId),
      orderBy("date", "desc"),
      orderBy("startTime", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Appointment[];
  },

  /**
   * Verifica se o horário está disponível e sem conflitos
   */
  async checkAvailability(barbershopId: string, barberId: string, date: string, startTime: string, endTime: string, ignoreAppointmentId?: string): Promise<boolean> {
    const appointments = await this.getBarberAppointments(barbershopId, barberId, date);
    
    // Filtra agendamentos cancelados, pois eles liberam o horário
    const activeAppointments = appointments.filter(app => 
      app.status !== "canceled" && 
      app.id !== ignoreAppointmentId
    );

    for (const existing of activeAppointments) {
      if (isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        return false; // Conflito encontrado
      }
    }
    
    return true; // Disponível
  },

  /**
   * Obtém um agendamento específico
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    if (!id) throw new Error("appointmentId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    }
    return null;
  },

  /**
   * Cria um novo agendamento, verificando conflito antes
   */
  async createAppointment(barbershopId: string, data: Omit<Appointment, "id" | "barbershopId" | "createdAt" | "updatedAt">): Promise<Appointment> {
    if (!barbershopId) throw new Error("barbershopId is required");

    const isAvailable = await this.checkAvailability(barbershopId, data.barberId, data.date, data.startTime, data.endTime);
    if (!isAvailable) {
      throw new Error("CONFLICT");
    }

    const appointmentData = {
      ...data,
      barbershopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), appointmentData);
    return {
      id: docRef.id,
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Appointment;
  },

  /**
   * Atualiza dados de um agendamento (Remarcação ou Ajuste)
   */
  async updateAppointment(id: string, data: Partial<Omit<Appointment, "id" | "barbershopId" | "createdAt" | "updatedAt">>): Promise<void> {
    if (!id) throw new Error("appointmentId is required");

    // Se estiver tentando remarcar (alterando data, hora, barbeiro), precisa checar conflito novamente
    if (data.date || data.startTime || data.endTime || data.barberId) {
      const existing = await this.getAppointmentById(id);
      if (existing) {
        const barberId = data.barberId || existing.barberId;
        const date = data.date || existing.date;
        const startTime = data.startTime || existing.startTime;
        const endTime = data.endTime || existing.endTime;

        const isAvailable = await this.checkAvailability(existing.barbershopId, barberId, date, startTime, endTime, id);
        if (!isAvailable) {
          throw new Error("CONFLICT");
        }
      }
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Altera rapidamente o status de um agendamento
   */
  async changeStatus(id: string, newStatus: AppointmentStatus): Promise<void> {
    if (!id) throw new Error("appointmentId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    const existing = await this.getAppointmentById(id);

    if (existing && newStatus === "completed" && existing.status !== "completed") {
      // Importa financial.service (usamos require inline ou import top level para evitar ciclos duros)
      const { financialService } = require("./financial.service");
      
      const alreadyHasTransaction = await financialService.hasTransactionForAppointment(existing.barbershopId, id);
      
      if (!alreadyHasTransaction) {
        // Gera Receita Bruta (Income)
        await financialService.createTransaction(existing.barbershopId, {
          type: "income",
          category: "Serviço",
          description: "Serviço finalizado via agenda",
          amount: existing.price,
          paymentMethod: existing.paymentStatus === "paid" ? "cash" : "pending" as any,
          appointmentId: existing.id,
          clientId: existing.clientId,
          barberId: existing.barberId,
          date: existing.date
        });

        // Gera Comissão (Expense) se houver
        if (existing.commission > 0) {
          await financialService.createTransaction(existing.barbershopId, {
            type: "expense",
            category: "Comissão",
            description: "Comissão automática",
            amount: existing.commission,
            appointmentId: existing.id,
            barberId: existing.barberId,
            date: existing.date
          });
        }
      }
    }

    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  },
  
  /**
   * Cancela agendamento (Muda status para canceled)
   */
  async cancelAppointment(id: string): Promise<void> {
    await this.changeStatus(id, "canceled");
  }
};
