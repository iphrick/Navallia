"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TransactionType, PaymentMethod, Transaction } from "@/types/financial";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(2, "Categoria inválida"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  paymentMethod: z.enum(["cash", "card", "pix", "transfer"]),
  date: z.string().min(1, "Data é obrigatória"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, "id" | "barbershopId" | "createdAt" | "updatedAt">) => Promise<void>;
  loading?: boolean;
}

export function TransactionForm({ onSubmit, loading }: TransactionFormProps) {
  const { control, handleSubmit, formState: { errors }, watch } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      category: "",
      description: "",
      amount: 0,
      paymentMethod: "pix",
      date: new Date().toISOString().split("T")[0],
    }
  });

  const type = watch("type");

  const EXPENSE_CATEGORIES = ["Aluguel", "Conta de Luz", "Conta de Água", "Marketing", "Produtos/Estoque", "Salários", "Outros"];
  const INCOME_CATEGORIES = ["Serviço Extra", "Venda de Produto", "Investimento", "Outros"];

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const onFormSubmit = async (data: TransactionFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
        
        {/* Tipo e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Tipo de Lançamento</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => field.onChange("income")}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${field.value === 'income' ? 'bg-white/10 border-white/30 text-zinc-200' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                  >
                    Entrada
                  </button>
                  <button 
                    type="button" 
                    onClick={() => field.onChange("expense")}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${field.value === 'expense' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                  >
                    Saída
                  </button>
                </div>
              </div>
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input label="Data da Transação *" type="date" error={errors.date?.message} {...field} />
            )}
          />
        </div>

        {/* Valor e Método */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input 
                label="Valor (R$) *" 
                type="number" 
                step="0.01" 
                error={errors.amount?.message} 
                className={type === 'income' ? 'text-zinc-200' : 'text-red-400'}
                {...field} 
              />
            )}
          />
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Método de Pagamento *</label>
                <select 
                  className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${errors.paymentMethod ? 'border-destructive' : 'border-input'}`}
                  {...field}
                >
                  <option value="pix">PIX</option>
                  <option value="card">Cartão</option>
                  <option value="cash">Dinheiro Espécie</option>
                  <option value="transfer">Transferência Bancária</option>
                </select>
                {errors.paymentMethod && <p className="text-xs font-medium text-destructive">{errors.paymentMethod.message}</p>}
              </div>
            )}
          />
        </div>

        {/* Categoria e Descrição */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Categoria *</label>
                <select 
                  className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${errors.category ? 'border-destructive' : 'border-input'}`}
                  {...field}
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs font-medium text-destructive">{errors.category.message}</p>}
              </div>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input label="Descrição (Opcional)" placeholder="Ex: Pagamento referente a..." error={errors.description?.message} {...field} />
            )}
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          Salvar Transação
        </Button>
      </div>
    </form>
  );
}
