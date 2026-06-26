"use client";

import { useState, useCallback } from "react";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { appointmentService } from "@/services/appointment.service";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, barbershopId } = useAuth();
  const { error } = useToastContext();

  const fetchByDate = useCallback(async (date: string) => {
    if (!barbershopId) return;
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentsByDate(barbershopId, date);
      setAppointments(data);
    } catch (err) {
      console.error("Erro ao buscar agendamentos do dia:", err);
    } finally {
      setLoading(false);
    }
  }, [barbershopId, error]);

  const createAppointment = async (data: Omit<Appointment, "id" | "barbershopId" | "createdAt" | "updatedAt">) => {
    if (!barbershopId) throw new Error("No barbershopId");
    const newAppointment = await appointmentService.createAppointment(barbershopId, data);
    
    // Atualiza a lista se for para a mesma data que estamos visualizando
    setAppointments((prev) => {
      if (prev.length > 0 && prev[0].date === data.date) {
        return [...prev, newAppointment].sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
      return prev;
    });
    return newAppointment;
  };

  const updateAppointment = async (id: string, data: Partial<Omit<Appointment, "id" | "barbershopId" | "createdAt" | "updatedAt">>) => {
    await appointmentService.updateAppointment(id, data);
    setAppointments((prev) => 
      prev.map((app) => (app.id === id ? { ...app, ...data, updatedAt: new Date() } as Appointment : app))
    );
  };

  const changeStatus = async (id: string, status: AppointmentStatus) => {
    await appointmentService.changeStatus(id, status);
    setAppointments((prev) => 
      prev.map((app) => (app.id === id ? { ...app, status, updatedAt: new Date() } as Appointment : app))
    );
  };

  const cancelAppointment = async (id: string) => {
    await appointmentService.cancelAppointment(id);
    setAppointments((prev) => 
      prev.map((app) => (app.id === id ? { ...app, status: "canceled", updatedAt: new Date() } as Appointment : app))
    );
  };

  return {
    appointments,
    loading,
    fetchByDate,
    createAppointment,
    updateAppointment,
    changeStatus,
    cancelAppointment,
  };
}
