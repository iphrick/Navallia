"use client";

import { useState, useEffect, useCallback } from "react";
import { Service } from "@/types/service";
import { serviceService } from "@/services/service.service";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, barbershopId } = useAuth();
  const { error } = useToastContext();

  const fetchServices = useCallback(async () => {
    if (!barbershopId) return;

    try {
      setLoading(true);
      const data = await serviceService.getServices(barbershopId);
      setServices(data);
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    } finally {
      setLoading(false);
    }
  }, [barbershopId, error]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = async (data: Omit<Service, "id" | "barbershopId" | "createdAt" | "updatedAt">) => {
    if (!barbershopId) throw new Error("No barbershopId");
    const newService = await serviceService.createService(barbershopId, data);
    setServices((prev) => [...prev, newService]);
    return newService;
  };

  const updateService = async (id: string, data: Partial<Omit<Service, "id" | "barbershopId" | "createdAt" | "updatedAt">>) => {
    await serviceService.updateService(id, data);
    setServices((prev) => prev.map((srv) => (srv.id === id ? { ...srv, ...data, updatedAt: new Date() } as Service : srv)));
  };

  const deleteService = async (id: string) => {
    await serviceService.softDeleteService(id);
    setServices((prev) => prev.map((srv) => (srv.id === id ? { ...srv, active: false, updatedAt: new Date() } as Service : srv)));
  };

  const duplicateService = async (id: string) => {
    const newService = await serviceService.duplicateService(id);
    if (newService) {
      setServices((prev) => [...prev, newService]);
    }
    return newService;
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    await serviceService.toggleFeatured(id, currentFeatured);
    setServices((prev) => prev.map((srv) => (srv.id === id ? { ...srv, featured: !currentFeatured, updatedAt: new Date() } as Service : srv)));
  };

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    duplicateService,
    toggleFeatured,
    refreshServices: fetchServices
  };
}
