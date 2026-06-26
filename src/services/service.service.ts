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
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Service } from "@/types/service";

const COLLECTION_NAME = "services";

export const serviceService = {
  /**
   * Obtém todos os serviços de uma barbearia (ordenados por nome)
   */
  async getServices(barbershopId: string): Promise<Service[]> {
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
    })) as Service[];
  },

  /**
   * Obtém um serviço específico por ID
   */
  async getServiceById(id: string): Promise<Service | null> {
    if (!id) throw new Error("serviceId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Service;
    }
    return null;
  },

  /**
   * Cria um novo serviço
   */
  async createService(barbershopId: string, data: Omit<Service, "id" | "barbershopId" | "createdAt" | "updatedAt">): Promise<Service> {
    if (!barbershopId) throw new Error("barbershopId is required");

    const serviceData = {
      ...data,
      barbershopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), serviceData);
    return {
      id: docRef.id,
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Service;
  },

  /**
   * Atualiza um serviço
   */
  async updateService(id: string, data: Partial<Omit<Service, "id" | "barbershopId" | "createdAt" | "updatedAt">>): Promise<void> {
    if (!id) throw new Error("serviceId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Realiza a exclusão lógica do serviço (inativa)
   */
  async softDeleteService(id: string): Promise<void> {
    if (!id) throw new Error("serviceId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      active: false,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Duplica um serviço existente, com (cópia) no nome
   */
  async duplicateService(id: string): Promise<Service | null> {
    const existing = await this.getServiceById(id);
    if (!existing) return null;

    const { id: _, createdAt, updatedAt, name, ...rest } = existing;
    
    return this.createService(existing.barbershopId, {
      ...rest,
      name: `${name} (cópia)`
    });
  },

  /**
   * Alterna o status de destaque de um serviço
   */
  async toggleFeatured(id: string, currentFeatured: boolean): Promise<void> {
    if (!id) throw new Error("serviceId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      featured: !currentFeatured,
      updatedAt: serverTimestamp()
    });
  }
};
