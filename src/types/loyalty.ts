import { Timestamp } from "firebase/firestore";

export type LoyaltyTier = "bronze" | "silver" | "gold" | "vip";

export interface LoyaltyProfile {
  id: string; // Vai usar o mesmo ID do Cliente
  barbershopId: string;
  clientId: string;
  points: number;
  totalSpent: number;
  tier: LoyaltyTier;
  lastUpdated: Timestamp | Date;
}
