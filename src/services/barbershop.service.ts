import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { updateUserDocument } from "@/firebase/auth";
import type { BarbershopDocument, CreateBarbershopData } from "@/types";

// ─── Slug Generator ────────────────────────────────────────────────────────────

/**
 * Generates a URL-friendly slug from a barbershop name.
 * Example: "Navallia Barber Shop" → "navallia-barber-shop"
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "")   // Remove special chars
    .replace(/\s+/g, "-")            // Spaces to hyphens
    .replace(/-+/g, "-")             // Collapse multiple hyphens
    .trim();
};

/**
 * Check if a slug is already in use by another barbershop.
 * Appends a numeric suffix if needed to guarantee uniqueness.
 */
const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const q = query(collection(db, "barbershops"), where("slug", "==", slug));
    const snap = await getDocs(q);
    if (snap.empty) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// ─── Create Barbershop ─────────────────────────────────────────────────────────

export interface CreateBarbershopParams extends CreateBarbershopData {
  email: string;
  logoUrl?: string;
}

/**
 * Creates a new barbershop document and links the owner user to it.
 * This is called from the /onboarding page after logo upload.
 */
export const createBarbershop = async (
  data: CreateBarbershopParams,
  ownerId: string
): Promise<BarbershopDocument> => {
  const barbershopRef = doc(collection(db, "barbershops"));
  const barbershopId = barbershopRef.id;

  const baseSlug = generateSlug(data.name);
  const slug = await ensureUniqueSlug(baseSlug);

  const now = serverTimestamp();

  const barbershop: Omit<BarbershopDocument, "id"> = {
    name: data.name,
    slug,
    email: data.email,
    phone: data.phone,
    address: data.address,
    logoUrl: data.logoUrl || "",
    ownerId,
    plan: "trial",
    active: true,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await setDoc(barbershopRef, barbershop);

  // Link the owner user to this barbershop
  await updateUserDocument(ownerId, {
    barbershopId,
    role: "owner",
  });

  return { id: barbershopId, ...barbershop };
};

// ─── Read Barbershop ───────────────────────────────────────────────────────────

export const getBarbershop = async (
  barbershopId: string
): Promise<BarbershopDocument | null> => {
  const ref = doc(db, "barbershops", barbershopId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as BarbershopDocument;
};

export const getBySlug = async (
  slug: string
): Promise<BarbershopDocument | null> => {
  const q = query(collection(db, "barbershops"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BarbershopDocument;
};

// ─── Update Barbershop ─────────────────────────────────────────────────────────

export const updateBarbershop = async (
  barbershopId: string,
  data: Partial<Omit<BarbershopDocument, "id" | "createdAt" | "ownerId" | "slug">>
): Promise<void> => {
  const ref = doc(db, "barbershops", barbershopId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ─── Delete Barbershop ─────────────────────────────────────────────────────────

/**
 * Only owners can delete a barbershop.
 * This is enforced both here and in Firestore rules.
 */
export const deleteBarbershop = async (barbershopId: string): Promise<void> => {
  const ref = doc(db, "barbershops", barbershopId);
  await deleteDoc(ref);
};
