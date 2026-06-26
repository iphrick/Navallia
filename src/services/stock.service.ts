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
  increment,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, StockMovement, MovementType } from "@/types/stock";
import { financialService } from "@/services/financial.service";

const PRODUCT_COLLECTION = "products";
const MOVEMENT_COLLECTION = "stock_movements";

export const stockService = {
  /**
   * Obtém todos os produtos da barbearia
   */
  async getProducts(barbershopId: string): Promise<Product[]> {
    const q = query(
      collection(db, PRODUCT_COLLECTION),
      where("barbershopId", "==", barbershopId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  /**
   * Obtém movimentos de um produto
   */
  async getMovements(barbershopId: string, productId?: string): Promise<StockMovement[]> {
    let q = query(
      collection(db, MOVEMENT_COLLECTION),
      where("barbershopId", "==", barbershopId)
    );
    
    // Filtro em memória pra evitar index requirement se combinarmos orderBy
    const snap = await getDocs(q);
    let movements = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
    
    if (productId) {
      movements = movements.filter(m => m.productId === productId);
    }
    
    // Ordena do mais recente pro mais antigo
    movements.sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toMillis?.() || 0;
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return movements;
  },

  /**
   * Cria um novo produto
   */
  async createProduct(barbershopId: string, data: Omit<Product, "id" | "barbershopId" | "createdAt" | "updatedAt">): Promise<Product> {
    const docData = {
      ...data,
      barbershopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, PRODUCT_COLLECTION), docData);
    
    const product = { id: ref.id, ...docData, createdAt: new Date(), updatedAt: new Date() } as Product;

    // Se criou produto já com estoque inicial > 0, cria o movimento "in"
    if (data.stock > 0) {
      await this.addMovement(barbershopId, ref.id, "in", data.stock, "Estoque inicial");
    }

    return product;
  },

  /**
   * Atualiza produto
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    const ref = doc(db, PRODUCT_COLLECTION, id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Exclui produto
   */
  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
  },

  /**
   * Movimenta o estoque (+ ou -)
   */
  async addMovement(
    barbershopId: string, 
    productId: string, 
    type: MovementType, 
    quantity: number, 
    reason: string,
    integrateFinance: boolean = false,
    appointmentId?: string
  ): Promise<void> {
    if (quantity <= 0) throw new Error("Quantity must be greater than zero");

    // 1. Pega o produto atual para saber os valores financeiros
    const prodRef = doc(db, PRODUCT_COLLECTION, productId);
    const prodSnap = await getDoc(prodRef);
    if (!prodSnap.exists()) throw new Error("Product not found");
    const productData = prodSnap.data() as Product;

    // 2. Grava o movimento
    await addDoc(collection(db, MOVEMENT_COLLECTION), {
      barbershopId,
      productId,
      type,
      quantity,
      reason,
      appointmentId: appointmentId || null,
      createdAt: serverTimestamp()
    });

    // 3. Atualiza o estoque do produto atomicamente
    await updateDoc(prodRef, {
      stock: increment(type === "in" ? quantity : -quantity),
      updatedAt: serverTimestamp()
    });

    // 4. Integração Financeira opcional
    if (integrateFinance) {
      const today = new Date().toISOString().split("T")[0];

      if (type === "in") {
        // Compra de produto -> Despesa no financeiro baseado no Custo
        const totalCost = productData.costPrice * quantity;
        if (totalCost > 0) {
          await financialService.createTransaction(barbershopId, {
            type: "expense",
            category: "Produtos/Estoque",
            description: `Compra de ${quantity}x ${productData.name} - Motivo: ${reason}`,
            amount: totalCost,
            paymentMethod: "pix", // Default
            date: today
          });
        }
      } else if (type === "out" && reason.toLowerCase().includes("venda")) {
        // Venda de produto -> Receita no financeiro baseado no Preço de Venda
        const totalRevenue = productData.price * quantity;
        if (totalRevenue > 0) {
          await financialService.createTransaction(barbershopId, {
            type: "income",
            category: "Venda de Produto",
            description: `Venda de ${quantity}x ${productData.name}`,
            amount: totalRevenue,
            paymentMethod: "cash", // Default
            date: today
          });
        }
      }
    }
  }
};
