"use client";

import { useState, useEffect, useCallback } from "react";
import { Barber } from "@/types/barber";
import { barberService } from "@/services/barber.service";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";

export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, barbershopId } = useAuth();
  const { error } = useToastContext();

  const fetchBarbers = useCallback(async () => {
    if (!barbershopId) return;

    try {
      setLoading(true);
      const data = await barberService.getBarbers(barbershopId);
      setBarbers(data);
    } catch (err) {
      console.error("Erro ao buscar barbeiros:", err);
    } finally {
      setLoading(false);
    }
  }, [barbershopId, error]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const createBarber = async (data: Omit<Barber, "id" | "barbershopId" | "createdAt" | "updatedAt">, customId?: string) => {
    if (!barbershopId) throw new Error("No barbershopId");
    const newBarber = await barberService.createBarber(barbershopId, data, customId);
    setBarbers((prev) => [...prev, newBarber]);
    return newBarber;
  };

  const updateBarber = async (id: string, data: Partial<Omit<Barber, "id" | "barbershopId" | "createdAt" | "updatedAt">>) => {
    await barberService.updateBarber(id, data);
    setBarbers((prev) => prev.map((bar) => (bar.id === id ? { ...bar, ...data, updatedAt: new Date() } as Barber : bar)));
  };

  const deactivateBarber = async (id: string) => {
    await barberService.deactivateBarber(id);
    setBarbers((prev) => prev.map((bar) => (bar.id === id ? { ...bar, active: false, updatedAt: new Date() } as Barber : bar)));
  };

  return {
    barbers,
    loading,
    createBarber,
    updateBarber,
    deactivateBarber,
    refreshBarbers: fetchBarbers
  };
}
