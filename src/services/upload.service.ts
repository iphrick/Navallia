import { resizeImageToBase64 } from "@/lib/image-utils";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Converts logo to base64 and saves to Firestore barbershop document.
 * No Firebase Storage required — works on the free Spark plan.
 */
export const uploadLogo = async (file: File, barbershopId: string): Promise<string> => {
  // Logos can be a bit larger than avatars — 512px max
  const base64 = await resizeImageToBase64(file, 512);

  const shopRef = doc(db, "barbershops", barbershopId);
  await updateDoc(shopRef, { logoUrl: base64 });

  return base64;
};

export const deleteLogo = async (barbershopId: string): Promise<void> => {
  const shopRef = doc(db, "barbershops", barbershopId);
  await updateDoc(shopRef, { logoUrl: null });
};

export const createFilePreview = (file: File): string => URL.createObjectURL(file);
export const revokeFilePreview = (url: string): void => URL.revokeObjectURL(url);
