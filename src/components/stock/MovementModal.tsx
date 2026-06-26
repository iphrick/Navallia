"use client";

import React, { useState } from "react";
import { X, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Product } from "@/types/stock";

interface MovementModalProps {
  product: Product;
  onClose: () => void;
  onSubmit: (productId: string, type: "in" | "out", quantity: number, reason: string, integrateFinance: boolean) => Promise<void>;
}

export function MovementModal({ product, onClose, onSubmit }: MovementModalProps) {
  const [type, setType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [integrateFinance, setIntegrateFinance] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    
    setLoading(true);
    try {
      await onSubmit(product.id, type, quantity, reason, integrateFinance);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-medium text-white">Movimentar Estoque</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <p className="text-sm text-white/50 mb-1">Produto Selecionado</p>
            <p className="font-semibold text-white">{product.name} <span className="text-xs text-white/40 ml-2">Atual: {product.stock} {product.unit}</span></p>
          </div>

          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setType("in")}
              className={`flex-1 py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors ${type === 'in' ? 'bg-white/10 border-white/30 text-zinc-200' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
            >
              <ArrowDownRight className="w-5 h-5" />
              <span className="text-sm font-bold">Dar Entrada</span>
            </button>
            <button 
              type="button" 
              onClick={() => setType("out")}
              className={`flex-1 py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors ${type === 'out' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
            >
              <ArrowUpRight className="w-5 h-5" />
              <span className="text-sm font-bold">Dar Saída</span>
            </button>
          </div>

          <Input 
            label="Quantidade *" 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))} 
            required 
          />

          <Input 
            label="Motivo / Justificativa *" 
            placeholder={type === 'in' ? "Ex: Compra de reposição" : "Ex: Venda no balcão"}
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            required 
          />

          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <input 
              type="checkbox" 
              id="finance" 
              checked={integrateFinance}
              onChange={(e) => setIntegrateFinance(e.target.checked)}
              className="mt-1 rounded bg-white/10 border-transparent focus:ring-primary text-zinc-200"
            />
            <label htmlFor="finance" className="text-sm text-white/80 cursor-pointer">
              <span className="block font-medium mb-0.5">Integração Financeira</span>
              <span className="text-xs text-white/50">
                {type === 'in' 
                  ? "Criará uma Despesa automaticamente no Financeiro baseada no Custo do produto." 
                  : "Criará uma Receita automaticamente no Financeiro baseada no Preço de Venda."}
              </span>
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={loading}>
              Confirmar {type === 'in' ? 'Entrada' : 'Saída'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
