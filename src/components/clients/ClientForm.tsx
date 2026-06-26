"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Client } from "@/types/client";
import { Camera } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
  favoriteBarberId: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: ClientFormData, photoFile: File | null) => Promise<void>;
  loading?: boolean;
}

export function ClientForm({ initialData, onSubmit, loading }: ClientFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      whatsapp: initialData?.whatsapp || "",
      email: initialData?.email || "",
      birthDate: initialData?.birthDate || "",
      notes: initialData?.notes || "",
      favoriteBarberId: initialData?.favoriteBarberId || "",
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const submitForm = async (data: ClientFormData) => {
    await onSubmit(data, photoFile);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6 max-w-2xl bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-white/40" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="text-xs text-white/50 text-center">
            <p>Clique para enviar</p>
            <p>uma foto</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-medium border-b border-white/10 pb-2">Informações Básicas</h3>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input label="Nome Completo *" error={errors.name?.message} {...field} />
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input label="Telefone *" error={errors.phone?.message} {...field} />
              )}
            />
            <Controller
              name="whatsapp"
              control={control}
              render={({ field }) => (
                <Input 
                  label="WhatsApp *" 
                  error={errors.whatsapp?.message} 
                  {...field} 
                  rightElement={
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-6 px-2 text-xs absolute right-1"
                      onClick={() => setValue('whatsapp', watch('phone'))}
                    >
                      Copiar
                    </Button>
                  }
                />
              )}
            />
          </div>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input label="E-mail" type="email" error={errors.email?.message} {...field} />
            )}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-medium border-b border-white/10 pb-2">Informações Extras</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <Input label="Data de Nascimento" type="date" error={errors.birthDate?.message} {...field} />
            )}
          />
          <Controller
            name="favoriteBarberId"
            control={control}
            render={({ field }) => (
              <Input label="ID Barbeiro Favorito (Opcional)" error={errors.favoriteBarberId?.message} {...field} />
            )}
          />
        </div>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Observações</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                {...field}
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {initialData ? "Salvar Alterações" : "Cadastrar Cliente"}
        </Button>
      </div>
    </form>
  );
}
