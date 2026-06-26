import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarbershopDocument } from "@/types";
import { Service } from "@/types/service";
import { Barber } from "@/types/barber";
import { Appointment } from "@/types/appointment";
import { Client } from "@/types/client";

export const publicService = {
  
  /**
   * Encontra a barbearia pelo Slug da URL
   */
  async getBarbershopBySlug(slug: string): Promise<BarbershopDocument | null> {
    const q = query(collection(db, "barbershops"), where("slug", "==", slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as BarbershopDocument;
  },

  /**
   * Puxa todos os serviços ativos da barbearia
   */
  async getPublicServices(barbershopId: string): Promise<Service[]> {
    const q = query(
      collection(db, "services"), 
      where("barbershopId", "==", barbershopId),
      where("active", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
  },

  /**
   * Puxa os barbeiros ativos
   */
  async getPublicBarbers(barbershopId: string): Promise<Barber[]> {
    const q = query(
      collection(db, "barbers"), 
      where("barbershopId", "==", barbershopId),
      where("active", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Barber));
  },

  /**
   * Encontra ou cria o cliente com base no WhatsApp
   */
  async findOrCreateClient(barbershopId: string, name: string, whatsapp: string): Promise<string> {
    const q = query(
      collection(db, "clients"),
      where("barbershopId", "==", barbershopId),
      where("whatsapp", "==", whatsapp)
    );
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      return snap.docs[0].id; // Já é cliente
    }

    // Cadastra novo cliente anonimamente
    const clientData: Omit<Client, "id"> = {
      barbershopId,
      name,
      whatsapp,
      phone: whatsapp,
      totalAppointments: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      active: true,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any
    };

    const docRef = await addDoc(collection(db, "clients"), clientData);
    return docRef.id;
  },

  /**
   * Cria o agendamento público
   */
  async createPublicAppointment(
    barbershopId: string,
    barberId: string,
    serviceId: string,
    price: number,
    date: string,
    startTime: string,
    endTime: string,
    clientName: string,
    clientWhatsapp: string
  ): Promise<string> {
    // 1. Acha ou cadastra cliente
    const clientId = await this.findOrCreateClient(barbershopId, clientName, clientWhatsapp);

    // Fetch the barber to calculate commission
    let commission = 0;
    try {
      const barberDoc = await getDoc(doc(db, "barbers", barberId));
      if (barberDoc.exists()) {
        const barberData = barberDoc.data() as Barber;
        if (barberData.commissionType === "percentage") {
          commission = price * (barberData.commissionValue / 100);
        } else {
          commission = barberData.commissionValue;
        }
      }
    } catch (err) {
      console.error("Erro ao carregar comissão do barbeiro:", err);
    }

    // 2. Grava Agendamento
    const appointmentData: Omit<Appointment, "id"> = {
      barbershopId,
      clientId,
      barberId,
      serviceId,
      date,
      startTime,
      endTime,
      status: "scheduled",
      price,
      commission,
      paymentStatus: "pending",
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any
    };

    const docRef = await addDoc(collection(db, "appointments"), appointmentData);
    return docRef.id;
  }
};
