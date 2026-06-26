"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Service } from "@/types/service";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useAuth } from "@/hooks/useAuth";

const serviceSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Preço inválido"),
  duration: z.coerce.number().min(1, "Duração inválida"),
  commissionType: z.enum(["percentage", "fixed"]),
  commissionValue: z.coerce.number().min(0, "Valor de comissão inválido"),
  active: z.boolean(),
  featured: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: Partial<Service>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  loading?: boolean;
}

export function ServiceForm({ initialData, onSubmit, loading }: ServiceFormProps) {
  const { categories } = useServiceCategories();

  const { control, handleSubmit, formState: { errors }, watch } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      duration: initialData?.duration || 30,
      commissionType: initialData?.commissionType || "percentage",
      commissionValue: initialData?.commissionValue || 0,
      active: initialData?.active ?? true,
      featured: initialData?.featured ?? false,
    }
  });

  const commissionType = watch("commissionType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-5">
          <h3 className="text-lg font-medium border-b border-white/10 pb-2">Informações Básicas</h3>
          
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input label="Nome do Serviço *" error={errors.name?.message} {...field} />
            )}
          />
          
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Categoria *</label>
                <select 
                  className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${errors.categoryId ? 'border-destructive' : 'border-input'}`}
                  {...field}
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs font-medium text-destructive">{errors.categoryId.message}</p>}
              </div>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Descrição</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  {...field}
                />
              </div>
            )}
          />
        </div>

        {/* Commercial & Commission */}
        <div className="space-y-6">
          <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="text-lg font-medium border-b border-white/10 pb-2">Comercial</h3>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input label="Preço (R$) *" type="number" step="0.01" error={errors.price?.message} {...field} />
                )}
              />
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Input label="Duração (min) *" type="number" error={errors.duration?.message} {...field} />
                )}
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
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
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
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-5">
        <h3 className="text-lg font-medium border-b border-white/10 pb-2">Configurações</h3>
        <div className="flex gap-8">
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-white/20 bg-background text-blue-600 focus:ring-blue-500"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="text-sm font-medium">Serviço Ativo</span>
              </label>
            )}
          />
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-white/20 bg-background text-blue-600 focus:ring-blue-500"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="text-sm font-medium">Destacar Serviço (⭐)</span>
              </label>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {initialData ? "Salvar Alterações" : "Cadastrar Serviço"}
        </Button>
      </div>
    </form>
  );
}
