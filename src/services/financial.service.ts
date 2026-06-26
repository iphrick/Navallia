import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction, FinancialSummary } from "@/types/financial";

const COLLECTION_NAME = "transactions";

export const financialService = {
  /**
   * Obtém as transações de um período
   */
  async getTransactions(barbershopId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    if (!barbershopId) throw new Error("barbershopId is required");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  },

  /**
   * Resumo Financeiro (Lucro, Receita, Despesas)
   */
  async getSummary(barbershopId: string, startDate: string, endDate: string): Promise<FinancialSummary> {
    const transactions = await this.getTransactions(barbershopId, startDate, endDate);
    
    let totalIncome = 0;
    let totalExpense = 0;
    let commissionsPaid = 0;

    transactions.forEach(t => {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (t.category === "Comissão") {
          commissionsPaid += t.amount;
        }
      }
    });

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      commissionsPaid
    };
  },

  /**
   * Lança uma nova transação
   */
  async createTransaction(barbershopId: string, data: Omit<Transaction, "id" | "barbershopId" | "createdAt" | "updatedAt">): Promise<Transaction> {
    const transactionData = {
      ...data,
      barbershopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), transactionData);
    
    // Automação: Se for receita e houver cliente, soma pontos de fidelidade
    if (data.type === "income" && data.clientId) {
       const { loyaltyService } = require("./loyalty.service");
       await loyaltyService.addPoints(barbershopId, data.clientId, data.amount).catch((err: any) => console.error("Erro ao computar pontos:", err));
    }

    return {
      id: docRef.id,
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Transaction;
  },

  /**
   * Exclui transação
   */
  async deleteTransaction(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  /**
   * Prevenção de duplicação: Checa se um agendamento já gerou receita hoje
   */
  async hasTransactionForAppointment(barbershopId: string, appointmentId: string): Promise<boolean> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("barbershopId", "==", barbershopId),
      where("appointmentId", "==", appointmentId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }
};
