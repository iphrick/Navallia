"use client";

import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook to access current barbershop data.
 *
 * Usage:
 * ```ts
 * const { currentBarbershop, loading, refreshBarbershop } = useBarbershop();
 * ```
 */
export function useBarbershop() {
  const { currentBarbershop, loading, refreshBarbershop, barbershopId } = useAuthContext();

  return {
    currentBarbershop,
    barbershopId,
    loading,
    refreshBarbershop,
    hasShop: !!currentBarbershop,
  };
}
