import { Timestamp } from "firebase/firestore";

export interface ServiceCategory {
  id: string;
  barbershopId: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Timestamp | Date;
}

export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  duration: number; // In minutes
  commissionType: "percentage" | "fixed";
  commissionValue: number;
  active: boolean;
  featured: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
