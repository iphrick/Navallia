"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types/stock";
import { useRouter } from "next/navigation";

const productSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(2, "Categoria é obrigatória"),
  price: z.coerce.number().min(0, "Preço de venda inválido"),
  costPrice: z.coerce.number().min(0, "Custo inválido"),
  stock: z.coerce.number().min(0, "Estoque inválido"),
  minStock: z.coerce.number().min(0, "Mínimo inválido"),
  unit: z.enum(["unit", "ml", "g", "box"]),
  barcode: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: Omit<Product, "id" | "barbershopId" | "createdAt" | "updatedAt" | "active"> & { active: boolean }) => Promise<void>;
  loading?: boolean;
}

export function ProductForm({ onSubmit, loading }: ProductFormProps) {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      costPrice: 0,
      stock: 0,
      minStock: 5,
      unit: "unit",
      barcode: "",
    }
  });

  const onFormSubmit = async (data: ProductFormData) => {
    await onSubmit({ ...data, active: true });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-3xl">
      <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
        <h3 className="text-lg font-medium text-white mb-2">Informações do Produto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input label="Nome do Produto *" placeholder="Ex: Pomada Modeladora" error={errors.name?.message} {...field} />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Input label="Categoria *" placeholder="Ex: Finalizadores" error={errors.category?.message} {...field} />
            )}
          />
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input label="Descrição (Opcional)" placeholder="Detalhes do produto..." error={errors.description?.message} {...field} />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="barcode"
            control={control}
            render={({ field }) => (
              <Input label="Código de Barras (Opcional)" placeholder="EAN / GTIN" error={errors.barcode?.message} {...field} />
            )}
          />
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Unidade de Medida *</label>
                <select 
                  className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${errors.unit ? 'border-destructive' : 'border-input'}`}
                  {...field}
                >
                  <option value="unit">Unidade (Un)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="g">Grama (g)</option>
                  <option value="box">Caixa (Cx)</option>
                </select>
              </div>
            )}
          />
        </div>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
        <h3 className="text-lg font-medium text-white mb-2">Precificação e Estoque</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-white/10 pb-4">
          <Controller
            name="costPrice"
            control={control}
            render={({ field }) => (
              <Input label="Custo de Compra (R$) *" type="number" step="0.01" error={errors.costPrice?.message} {...field} />
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input label="Preço de Venda (R$) *" type="number" step="0.01" error={errors.price?.message} {...field} />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <Input label="Estoque Inicial *" type="number" error={errors.stock?.message} {...field} />
            )}
          />
          <Controller
            name="minStock"
            control={control}
            render={({ field }) => (
              <Input label="Estoque Mínimo (Alerta) *" type="number" error={errors.minStock?.message} {...field} />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/estoque")}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          Salvar Produto
        </Button>
      </div>
    </form>
  );
}
