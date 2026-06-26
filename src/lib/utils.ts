import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha inválidos.",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "A senha é muito fraca.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
    "auth/user-disabled": "Esta conta foi desativada.",
  };
  return messages[code] ?? "Ocorreu um erro inesperado. Tente novamente.";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Multi-tenant helper.
 * Returns the current barbershopId stored in the auth context.
 *
 * NOTE: Prefer using `barbershopId` directly from `useAuth()` in components.
 * This utility is intended for use in service functions or non-React contexts.
 *
 * Usage:
 * ```ts
 * const id = getCurrentBarbershopId();
 * if (!id) throw new Error("No active barbershop");
 * ```
 */
let _currentBarbershopId: string | null = null;

export const setCurrentBarbershopId = (id: string | null): void => {
  _currentBarbershopId = id;
};

export const getCurrentBarbershopId = (): string | null => {
  return _currentBarbershopId;
};
