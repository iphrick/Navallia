"use client";

import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook to access authentication state and multi-tenant data.
 *
 * Usage:
 * ```ts
 * const { user, userDoc, barbershopId, role, hasPermission } = useAuth();
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
