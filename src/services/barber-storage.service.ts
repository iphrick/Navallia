import { resizeImageToBase64 } from "@/lib/image-utils";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Converts image to base64, saves to Firestore barber document.
 * No Firebase Storage required — works on the free Spark plan.
 */
export const barberStorageService = {
  async uploadAvatar(barbershopId: string, barberId: string, file: File): Promise<string> {
    const base64 = await resizeImageToBase64(file, 256);

    const barberRef = doc(db, "barbershops", barbershopId, "barbers", barberId);
    await updateDoc(barberRef, { avatarUrl: base64 });

    return base64;
  },

  async getAvatarUrl(barbershopId: string, barberId: string): Promise<string | null> {
    // Avatars are now stored directly in the Firestore document — no separate lookup needed.
    return null;
  },

  async deleteAvatar(barbershopId: string, barberId: string): Promise<void> {
    const barberRef = doc(db, "barbershops", barbershopId, "barbers", barberId);
    await updateDoc(barberRef, { avatarUrl: null });
  },
};
