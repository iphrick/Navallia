import { Timestamp } from "firebase/firestore";

export type TransactionType = "income" | "expense";
export type PaymentMethod = "cash" | "card" | "pix" | "transfer";

export interface Transaction {
  id: string;
  barbershopId: string;
  type: TransactionType;
  category: string; // Ex: "Serviços", "Comissão", "Aluguel", "Conta de Luz"
  description?: string;
  amount: number; // Sempre positivo no banco. O "type" define se subtrai.
  paymentMethod?: PaymentMethod;
  appointmentId?: string; // Vínculo com agendamento
  clientId?: string;      // Vínculo com cliente
  barberId?: string;      // Vínculo com profissional
  date: string;           // YYYY-MM-DD
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  commissionsPaid: number;
}
