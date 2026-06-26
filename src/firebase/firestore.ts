import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Get all documents in a collection filtered by barbershopId.
 * This is the core multi-tenant query helper.
 */
export const getByBarbershop = async <T>(
  collectionName: string,
  barbershopId: string,
  extraConstraints: QueryConstraint[] = []
): Promise<T[]> => {
  const ref = collection(db, collectionName);
  const q = query(
    ref,
    where("barbershopId", "==", barbershopId),
    ...extraConstraints
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
};

/**
 * Get a single document by id, enforcing barbershopId ownership.
 */
export const getOneByBarbershop = async <T>(
  collectionName: string,
  docId: string,
  barbershopId: string
): Promise<T | null> => {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  // Enforce tenant isolation
  if (data.barbershopId !== barbershopId) return null;
  return { id: snap.id, ...data } as T;
};

/**
 * Create a document with barbershopId automatically injected.
 */
export const createWithBarbershop = async <T extends DocumentData>(
  collectionName: string,
  barbershopId: string,
  data: Omit<WithFieldValue<T>, "barbershopId" | "createdAt" | "updatedAt">
): Promise<string> => {
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, {
    ...data,
    barbershopId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update a document, verifying barbershopId ownership first.
 */
export const updateWithBarbershop = async (
  collectionName: string,
  docId: string,
  barbershopId: string,
  data: Partial<DocumentData>
): Promise<void> => {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().barbershopId !== barbershopId) {
    throw new Error("Permission denied: document not found or wrong tenant.");
  }
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a document, verifying barbershopId ownership first.
 */
export const deleteWithBarbershop = async (
  collectionName: string,
  docId: string,
  barbershopId: string
): Promise<void> => {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().barbershopId !== barbershopId) {
    throw new Error("Permission denied: document not found or wrong tenant.");
  }
  await deleteDoc(ref);
};
