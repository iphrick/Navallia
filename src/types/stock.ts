import { Timestamp } from "firebase/firestore";

export interface Supplier {
  id: string;
  barbershopId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type ProductUnit = "unit" | "ml" | "g" | "box";

export interface Product {
  id: string;
  barbershopId: string;
  name: string;
  description?: string;
  category: string;
  price: number; // Preço de venda
  costPrice: number; // Custo de compra
  stock: number;
  minStock: number;
  unit: ProductUnit;
  barcode?: string;
  supplierId?: string;
  active: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type MovementType = "in" | "out";

export interface StockMovement {
  id: string;
  barbershopId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  appointmentId?: string;
  createdAt: Timestamp | Date;
}
