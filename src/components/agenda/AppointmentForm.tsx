"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { useBarbers } from "@/hooks/useBarbers";
import { Appointment } from "@/types/appointment";
import { addMinutesToTime } from "@/lib/date-utils";

const appointmentSchema = z.object({
  clientId: z.string().min(1, "Selecione o cliente"),
  serviceId: z.string().min(1, "Selecione o serviço"),
  barberId: z.string().min(1, "Selecione o barbeiro"),
  date: z.string().min(1, "Selecione a data"),
  startTime: z.string().min(1, "Selecione o horário"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  onSubmit: (data: Omit<Appointment, "id" | "barbershopId" | "createdAt" | "updatedAt">) => Promise<void>;
  loading?: boolean;
}

export function AppointmentForm({ initialData, onSubmit, loading }: AppointmentFormProps) {
  const { clients } = useClients();
  const { services } = useServices();
  const { barbers } = useBarbers();

  const [price, setPrice] = useState(initialData?.price || 0);
  const [duration, setDuration] = useState(0);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: initialData?.clientId || "",
      serviceId: initialData?.serviceId || "",
      barberId: initialData?.barberId || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      startTime: initialData?.startTime || "09:00",
      notes: initialData?.notes || "",
    }
  });

  const selectedServiceId = watch("serviceId");
  const selectedBarberId = watch("barberId");

  // Effect to update price and duration when service changes
  useEffect(() => {
    if (selectedServiceId) {
      const srv = services.find(s => s.id === selectedServiceId);
      if (srv) {
        setPrice(srv.price);
        setDuration(srv.duration);
      }
    } else {
      setPrice(0);
      setDuration(0);
    }
  }, [selectedServiceId, services]);

  const onFormSubmit = async (data: AppointmentFormData) => {
    // Calcula comissão e endTime
    const barber = barbers.find(b => b.id === data.barberId);
    let commission = 0;
    
    if (barber) {
      if (barber.commissionType === "percentage") {
        commission = price * (barber.commissionValue / 100);
      } else {
        commission = barber.commissionValue;
      }
    }

    const endTime = addMinutesToTime(data.startTime, duration > 0 ? duration : 30);

    const appointmentData: Omit<Appointment, "id" | "barbershopId" | "createdAt" | "updatedAt"> = {
      clientId: data.clientId,
      barberId: data.barberId,
      serviceId: data.serviceId,
      date: data.date,
      startTime: data.startTime,
      endTime: endTime,
      status: initialData?.status || "scheduled",
      price: price,
      commission: commission,
      notes: data.notes,
      paymentStatus: initialData?.paymentStatus || "pending"
    };

    await onSubmit(appointmentData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-3xl">
      <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
        
        {/* Pessoas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-white/10 pb-4">
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Cliente *</label>
                <select 
                  className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${errors.clientId ? 'border-destructive' : 'border-input'}`}
                  {...field}
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.filter(c => c.active).map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs font-medium text-destructive">{errors.clientId.message}</p>}
              </div>
            )}
          />

          <Controller
            name="barberId"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Barbeiro *</label>
                <select 
                  className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${errors.barberId ? 'border-destructive' : 'border-input'}`}
                  {...field}
                >
                  <option value="">Selecione o barbeiro...</option>
                  {barbers.filter(b => b.active).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.barberId && <p className="text-xs font-medium text-destructive">{errors.barberId.message}</p>}
              </div>
            )}
          />
        </div>

        {/* Serviço e Horário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/10 pb-4">
          <div className="md:col-span-1">
            <Controller
              name="serviceId"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Serviço *</label>
                  <select 
                    className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${errors.serviceId ? 'border-destructive' : 'border-input'}`}
                    {...field}
                  >
                    <option value="">Selecione...</option>
                    {services.filter(s => s.active).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.serviceId && <p className="text-xs font-medium text-destructive">{errors.serviceId.message}</p>}
                </div>
              )}
            />
          </div>

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input label="Data *" type="date" error={errors.date?.message} {...field} />
            )}
          />

          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Input label="Horário de Início *" type="time" error={errors.startTime?.message} {...field} />
            )}
          />
        </div>

        {/* Observações */}
        <div className="pt-2">
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Observações (Opcional)</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  placeholder="Ex: Cliente tem alergia a produto X..."
                  {...field}
                />
              </div>
            )}
          />
        </div>

        {/* Resumo do Agendamento */}
        {selectedServiceId && (
          <div className="bg-white/10 border border-white/10 rounded-lg p-4 flex justify-between items-center mt-4">
            <div>
              <p className="text-sm text-zinc-200 font-medium">Resumo do Atendimento</p>
              <p className="text-xs text-white/70 mt-1">
                Duração estimada: <strong>{duration} minutos</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70 mb-0.5">Valor Total</p>
              <p className="text-xl font-bold text-zinc-200">{formatCurrency(price)}</p>
            </div>
          </div>
        )}

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          Confirmar Agendamento
        </Button>
      </div>
    </form>
  );
}
