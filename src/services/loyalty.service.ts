import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LoyaltyProfile, LoyaltyTier } from "@/types/loyalty";

const COLLECTION_NAME = "loyalty";

export const loyaltyService = {
  /**
   * Calcula o tier baseado nos pontos atuais
   */
  calculateTier(points: number): LoyaltyTier {
    if (points >= 2000) return "vip";
    if (points >= 1000) return "gold";
    if (points >= 500) return "silver";
    return "bronze";
  },

  /**
   * Puxa o perfil de fidelidade de um cliente
   */
  async getProfile(clientId: string): Promise<LoyaltyProfile | null> {
    const ref = doc(db, COLLECTION_NAME, clientId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as LoyaltyProfile;
  },

  /**
   * Adiciona pontos para um cliente. 1 real = 1 ponto.
   */
  async addPoints(barbershopId: string, clientId: string, amountSpent: number): Promise<LoyaltyProfile> {
    const pointsEarned = Math.floor(amountSpent);
    if (pointsEarned <= 0) return this.getProfile(clientId).then(p => p!);

    const ref = doc(db, COLLECTION_NAME, clientId);
    const snap = await getDoc(ref);

    let profileData: Omit<LoyaltyProfile, "id">;

    if (!snap.exists()) {
      // Primeiro registro do cliente no programa de fidelidade
      profileData = {
        barbershopId,
        clientId,
        points: pointsEarned,
        totalSpent: amountSpent,
        tier: this.calculateTier(pointsEarned),
        lastUpdated: serverTimestamp() as any
      };
      await setDoc(ref, profileData);
    } else {
      // Atualiza o existente
      const existing = snap.data() as LoyaltyProfile;
      const newPoints = existing.points + pointsEarned;
      const newTotalSpent = existing.totalSpent + amountSpent;
      const newTier = this.calculateTier(newPoints);

      profileData = {
        ...existing,
        points: newPoints,
        totalSpent: newTotalSpent,
        tier: newTier,
        lastUpdated: serverTimestamp() as any
      };
      await updateDoc(ref, profileData as any);
    }

    return { id: clientId, ...profileData, lastUpdated: new Date() } as LoyaltyProfile;
  },

  /**
   * Lista o perfil de fidelidade de toda a barbearia
   */
  async getAllProfiles(barbershopId: string): Promise<LoyaltyProfile[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      orderBy("points", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoyaltyProfile));
  }
};
