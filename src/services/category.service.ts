import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ServiceCategory } from "@/types/service";

const COLLECTION_NAME = "service_categories";

const DEFAULT_CATEGORIES = [
  "Cortes",
  "Barba",
  "Combos",
  "Pigmentação",
  "Sobrancelha",
  "Tratamentos",
  "Hidratação",
  "Outros"
];

export const categoryService = {
  /**
   * Obtém todas as categorias ativas de uma barbearia
   */
  async getCategories(barbershopId: string): Promise<ServiceCategory[]> {
    if (!barbershopId) throw new Error("barbershopId is required");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as ServiceCategory[];
  },

  /**
   * Cria uma nova categoria
   */
  async createCategory(barbershopId: string, data: Omit<ServiceCategory, "id" | "barbershopId" | "createdAt">): Promise<ServiceCategory> {
    if (!barbershopId) throw new Error("barbershopId is required");

    const categoryData = {
      ...data,
      barbershopId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), categoryData);
    return {
      id: docRef.id,
      ...categoryData,
      createdAt: new Date(),
    } as ServiceCategory;
  },

  /**
   * Atualiza uma categoria
   */
  async updateCategory(id: string, data: Partial<Omit<ServiceCategory, "id" | "barbershopId" | "createdAt">>): Promise<void> {
    if (!id) throw new Error("categoryId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  },

  /**
   * Exclui (permanentemente) uma categoria
   */
  async deleteCategory(id: string): Promise<void> {
    if (!id) throw new Error("categoryId is required");

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  /**
   * Cria as categorias padrão caso não existam
   */
  async seedDefaultCategories(barbershopId: string): Promise<void> {
    if (!barbershopId) return;
    
    try {
      // Verifica se já existem categorias
      const q = query(collection(db, COLLECTION_NAME), where("barbershopId", "==", barbershopId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const batch = writeBatch(db);
        
        DEFAULT_CATEGORIES.forEach(name => {
          const newDocRef = doc(collection(db, COLLECTION_NAME));
          batch.set(newDocRef, {
            name,
            barbershopId,
            active: true,
            createdAt: serverTimestamp()
          });
        });
        
        await batch.commit();
        console.log("Default categories seeded successfully!");
      }
    } catch (error) {
      console.error("Error seeding default categories:", error);
    }
  }
};
