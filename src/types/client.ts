import { Timestamp } from 'firebase/firestore';

export interface Client {
  id: string;
  barbershopId: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  birthDate?: string;
  notes?: string;
  photoUrl?: string;
  favoriteBarberId?: string;
  totalAppointments: number;
  totalSpent: number;
  loyaltyPoints: number;
  active: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
