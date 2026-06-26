import { Timestamp } from "firebase/firestore";

export interface WorkSchedule {
  start: string;
  end: string;
  active: boolean; // para saber se trabalha no dia
}

export interface Barber {
  id: string;
  barbershopId: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialties: string[];
  commissionType: "percentage" | "fixed";
  commissionValue: number;
  workSchedule: {
    monday?: WorkSchedule;
    tuesday?: WorkSchedule;
    wednesday?: WorkSchedule;
    thursday?: WorkSchedule;
    friday?: WorkSchedule;
    saturday?: WorkSchedule;
    sunday?: WorkSchedule;
  };
  active: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface BarberGoal {
  id: string;
  barbershopId: string;
  barberId: string;
  month: string; // Formato: YYYY-MM
  targetRevenue: number;
  currentRevenue: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
