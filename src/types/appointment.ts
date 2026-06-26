import { Timestamp } from "firebase/firestore";

export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "canceled" | "no_show";
export type PaymentStatus = "pending" | "paid" | "partial";

export interface Appointment {
  id: string;
  barbershopId: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  
  date: string; // Formato ISO "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  
  status: AppointmentStatus;
  
  price: number;
  commission: number;
  
  notes?: string;
  paymentStatus: PaymentStatus;
  
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
