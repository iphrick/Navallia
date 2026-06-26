import { User as FirebaseUser } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import React from "react";

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

export type AppUser = FirebaseUser;

// ─── RBAC Types ───────────────────────────────────────────────────────────────

export type UserRole = "master" | "owner" | "manager" | "barber";

export type Permission =
  | "barbershop.delete"
  | "barbershop.manage"
  | "plan.manage"
  | "clients.view"
  | "clients.manage"
  | "services.view"
  | "services.manage"
  | "agenda.view"
  | "agenda.manage"
  | "financial.view"
  | "financial.manage"
  | "reports.view"
  | "settings.manage"
  | "barbers.view"
  | "barbers.manage"
  | "stock.view"
  | "stock.manage"
  | "appointments.view"
  | "appointments.own"
  | "appointments.manage";

// ─── Firestore Document Types ─────────────────────────────────────────────────

export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  barbershopId: string; // Required after onboarding
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type BarbershopPlan = "trial" | "basic" | "premium";

export interface BarbershopDocument {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  ownerId: string;
  plan: BarbershopPlan;
  active: boolean;
  subscriptionStatus?: "active" | "overdue" | "trial";
  subscriptionDueDate?: Timestamp;
  subscriptionPlan?: string;
  subscriptionPrice?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// ─── Multi-Tenant Support ─────────────────────────────────────────────────────

/** Future: one user can manage multiple barbershops */
export interface UserBarbershop {
  userId: string;
  barbershopId: string;
  role: UserRole;
  joinedAt: Timestamp;
}

export interface CreateBarbershopData {
  name: string;
  phone: string;
  address: string;
  logoFile?: File;
}

// ─── Collection Documents (all include barbershopId for multi-tenancy) ────────

export interface ClientDocument {
  id: string;
  barbershopId: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  notes?: string;
  totalVisits: number;
  lastVisit?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceDocument {
  id: string;
  barbershopId: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BarberDocument {
  id: string;
  barbershopId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialties?: string[];
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AppointmentDocument {
  id: string;
  barbershopId: string;
  clientId: string;
  barberId: string;
  serviceIds: string[];
  date: Timestamp;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  totalPrice: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductDocument {
  id: string;
  barbershopId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TransactionDocument {
  id: string;
  barbershopId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
  appointmentId?: string;
  date: Timestamp;
  createdAt: Timestamp;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
}
