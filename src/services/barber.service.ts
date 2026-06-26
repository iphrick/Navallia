import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Barber, BarberGoal } from "@/types/barber";

const COLLECTION_NAME = "barbers";
const GOALS_COLLECTION = "barber_goals";

export const barberService = {
  /**
   * Cria um novo barbeiro
   * Note: Você pode querer sincronizar o id com o UID da autenticação, passando um ID customizado se necessário.
   */
  async createBarber(barbershopId: string, data: Omit<Barber, "id" | "barbershopId" | "createdAt" | "updatedAt">, customId?: string): Promise<Barber> {
    if (!barbershopId) throw new Error("barbershopId is required");

    const barberData = {
      ...data,
      barbershopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    let docId = customId;
    if (customId) {
      await setDoc(doc(db, COLLECTION_NAME, customId), barberData);
    } else {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), barberData);
      docId = docRef.id;
    }

    return {
      id: docId!,
      ...barberData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Barber;
  },

  /**
   * Obtém todos os barbeiros de uma barbearia
   */
  async getBarbers(barbershopId: string): Promise<Barber[]> {
    if (!barbershopId) throw new Error("barbershopId is required");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      orderBy("name", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Barber[];
  },

  /**
   * Obtém um barbeiro específico
   */
  async getBarberById(id: string): Promise<Barber | null> {
    if (!id) throw new Error("barberId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Barber;
    }
    return null;
  },

  /**
   * Atualiza os dados do barbeiro
   */
  async updateBarber(id: string, data: Partial<Omit<Barber, "id" | "barbershopId" | "createdAt" | "updatedAt">>): Promise<void> {
    if (!id) throw new Error("barberId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Inativa um barbeiro (soft delete)
   */
  async deactivateBarber(id: string): Promise<void> {
    await this.updateBarber(id, { active: false });
  },

  // ─── METAS (GOALS) ─────────────────────────────────────────────────────────

  /**
   * Define a meta de um barbeiro para um mês específico
   * Mês no formato 'YYYY-MM'
   */
  async setBarberGoal(barbershopId: string, barberId: string, month: string, targetRevenue: number): Promise<void> {
    // Procura se já existe meta para este barbeiro neste mês
    const q = query(
      collection(db, GOALS_COLLECTION),
      where("barbershopId", "==", barbershopId),
      where("barberId", "==", barberId),
      where("month", "==", month)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Cria nova meta
      await addDoc(collection(db, GOALS_COLLECTION), {
        barbershopId,
        barberId,
        month,
        targetRevenue,
        currentRevenue: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Atualiza meta existente
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, GOALS_COLLECTION, docId), {
        targetRevenue,
        updatedAt: serverTimestamp()
      });
    }
  },

  /**
   * Obtém a meta de um barbeiro para um mês específico
   */
  async getBarberGoal(barbershopId: string, barberId: string, month: string): Promise<BarberGoal | null> {
    const q = query(
      collection(db, GOALS_COLLECTION),
      where("barbershopId", "==", barbershopId),
      where("barberId", "==", barberId),
      where("month", "==", month)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as BarberGoal;
    }
    return null;
  }
};
