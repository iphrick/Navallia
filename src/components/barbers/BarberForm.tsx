"use client";

import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Barber, WorkSchedule } from "@/types/barber";
import { barberStorageService } from "@/services/barber-storage.service";
import { useAuth } from "@/hooks/useAuth";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Segunda-feira" },
  { id: "tuesday", label: "Terça-feira" },
  { id: "wednesday", label: "Quarta-feira" },
  { id: "thursday", label: "Quinta-feira" },
  { id: "friday", label: "Sexta-feira" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" }
] as const;

const workScheduleSchema = z.object({
  active: z.boolean(),
  start: z.string(),
  end: z.string(),
});

const barberSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  specialties: z.array(z.string()).min(1, "Adicione pelo menos uma especialidade"),
  commissionType: z.enum(["percentage", "fixed"]),
  commissionValue: z.coerce.number().min(0, "Valor inválido"),
  active: z.boolean(),
  workSchedule: z.object({
    monday: workScheduleSchema,
    tuesday: workScheduleSchema,
    wednesday: workScheduleSchema,
    thursday: workScheduleSchema,
    friday: workScheduleSchema,
    saturday: workScheduleSchema,
    sunday: workScheduleSchema,
  })
});

type BarberFormData = z.infer<typeof barberSchema>;

interface BarberFormProps {
  initialData?: Partial<Barber>;
  onSubmit: (data: BarberFormData, avatarFile: File | null) => Promise<void>;
  loading?: boolean;
}

export function BarberForm({ initialData, onSubmit, loading }: BarberFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newSpecialty, setNewSpecialty] = useState("");

  const defaultSchedule = { active: false, start: "09:00", end: "18:00" };
  
  const { control, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm<BarberFormData>({
    resolver: zodResolver(barberSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      specialties: initialData?.specialties || [],
      commissionType: initialData?.commissionType || "percentage",
      commissionValue: initialData?.commissionValue || 0,
      active: initialData?.active ?? true,
      workSchedule: {
        monday: initialData?.workSchedule?.monday || defaultSchedule,
        tuesday: initialData?.workSchedule?.tuesday || defaultSchedule,
        wednesday: initialData?.workSchedule?.wednesday || defaultSchedule,
        thursday: initialData?.workSchedule?.thursday || defaultSchedule,
        friday: initialData?.workSchedule?.friday || defaultSchedule,
        saturday: initialData?.workSchedule?.saturday || defaultSchedule,
        sunday: initialData?.workSchedule?.sunday || defaultSchedule,
      } as any
    }
  });

  const commissionType = watch("commissionType");
  const specialties = watch("specialties");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return;
    if (!specialties.includes(newSpecialty.trim())) {
      setValue("specialties", [...specialties, newSpecialty.trim()]);
    }
    setNewSpecialty("");
  };

  const removeSpecialty = (sp: string) => {
    setValue("specialties", specialties.filter(s => s !== sp));
  };

  const onFormSubmit = async (data: BarberFormData) => {
    await onSubmit(data, avatarFile);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 max-w-4xl">
      
      {/* 1. Header & Avatar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-white/40 group-hover:text-white/60 transition-colors" />
            )}
            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
              <span className="text-xs font-medium text-white">Alterar</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-medium text-white">Foto de Perfil</h3>
          <p className="text-sm text-white/50">Recomendado: 256x256px. Máx: 2MB.</p>
        </div>
        <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <input 
                  type="checkbox" 
                  className="rounded border-white/20 bg-background text-blue-600 focus:ring-blue-500"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="text-sm font-medium">Barbeiro Ativo</span>
              </label>
            )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Basic Info & Commission */}
        <div className="space-y-6">
          <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="text-lg font-medium border-b border-white/10 pb-2">Informações Básicas</h3>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input label="Nome Completo *" error={errors.name?.message} {...field} />}
            />
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input label="E-mail (Login)" type="email" error={errors.email?.message} {...field} />}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <Input label="Telefone" error={errors.phone?.message} {...field} />}
              />
            </div>
          </div>

          <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="text-lg font-medium border-b border-white/10 pb-2">Comissão</h3>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="commissionType"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Tipo de Comissão</label>
                    <select 
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      {...field}
                    >
                      <option value="percentage">Percentual (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                )}
              />
              <Controller
                name="commissionValue"
                control={control}
                render={({ field }) => (
                  <Input 
                    label={commissionType === 'percentage' ? "Porcentagem (%) *" : "Valor Fixo (R$) *"} 
                    type="number" 
                    step={commissionType === 'percentage' ? "1" : "0.01"}
                    error={errors.commissionValue?.message} 
                    {...field} 
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="text-lg font-medium border-b border-white/10 pb-2">Especialidades</h3>
            <div className="flex gap-2">
              <Input 
                placeholder="Ex: Corte Degradê" 
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); } }}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addSpecialty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.specialties && <p className="text-xs text-red-500">{errors.specialties.message}</p>}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {specialties.map(sp => (
                <span key={sp} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                  {sp}
                  <button type="button" onClick={() => removeSpecialty(sp)} className="hover:text-blue-300">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Work Schedule */}
        <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-5 h-fit">
          <h3 className="text-lg font-medium border-b border-white/10 pb-2">Jornada de Trabalho</h3>
          <p className="text-sm text-white/50 mb-4">Defina os dias e horários em que o barbeiro estará disponível na agenda.</p>
          
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <Controller
                  name={`workSchedule.${day.id}.active` as any}
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer w-32">
                      <input 
                        type="checkbox" 
                        className="rounded border-white/20 bg-background"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  )}
                />
                
                {watch(`workSchedule.${day.id}.active` as any) ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Controller
                      name={`workSchedule.${day.id}.start` as any}
                      control={control}
                      render={({ field }) => (
                        <input type="time" className="flex h-8 w-24 rounded-md border border-input bg-background px-2 py-1 text-sm" {...field} />
                      )}
                    />
                    <span className="text-white/50">até</span>
                    <Controller
                      name={`workSchedule.${day.id}.end` as any}
                      control={control}
                      render={({ field }) => (
                        <input type="time" className="flex h-8 w-24 rounded-md border border-input bg-background px-2 py-1 text-sm" {...field} />
                      )}
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-white/30 italic">Folga</div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {initialData ? "Salvar Alterações" : "Cadastrar Barbeiro"}
        </Button>
      </div>
    </form>
  );
}
