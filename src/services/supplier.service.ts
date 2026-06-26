import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Supplier } from "@/types/stock";

const COLLECTION_NAME = "suppliers";

export const supplierService = {
  async getSuppliers(barbershopId: string): Promise<Supplier[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
  },

  async createSupplier(barbershopId: string, data: Omit<Supplier, "id" | "barbershopId" | "createdAt" | "updatedAt">): Promise<Supplier> {
    const docData = {
      ...data,
      barbershopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, COLLECTION_NAME), docData);
    return { id: ref.id, ...docData, createdAt: new Date(), updatedAt: new Date() } as Supplier;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteSupplier(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
