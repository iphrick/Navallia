"use client";

import { useState, useCallback, useEffect } from "react";
import { LoyaltyProfile } from "@/types/loyalty";
import { loyaltyService } from "@/services/loyalty.service";
import { useAuth } from "@/hooks/useAuth";

export function useLoyalty(clientId?: string) {
  const { user, barbershopId } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Para listar toda a barbearia
  const [profiles, setProfiles] = useState<LoyaltyProfile[]>([]);
  
  // Para ver o perfil de um cliente específico
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!barbershopId) return;
    try {
      setLoading(true);
      const data = await loyaltyService.getAllProfiles(barbershopId);
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  const fetchSingleProfile = useCallback(async (cId: string) => {
    try {
      setLoading(true);
      const p = await loyaltyService.getProfile(cId);
      setProfile(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchSingleProfile(clientId);
    } else {
      fetchProfiles();
    }
  }, [clientId, fetchProfiles, fetchSingleProfile]);

  return {
    profiles,
    profile,
    loading,
    refreshAll: fetchProfiles,
    refreshSingle: (id: string) => fetchSingleProfile(id)
  };
}
