"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Package, AlertTriangle, ArrowUpDown, FileText } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MovementModal } from "@/components/stock/MovementModal";
import { useStock } from "@/hooks/useStock";
import { Product } from "@/types/stock";
import { useAuth } from "@/hooks/useAuth";

export default function EstoquePage() {
  const { products, loading, addMovement } = useStock();
  const { role } = useAuth();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const criticalProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <PageContainer 
      title="Controle de Estoque" 
      description="Gerencie seus produtos, custos e reposições."
      actions={
        role !== "barber" && (
          <div className="flex gap-2">
            <Link href="/estoque/importar-nfe">
              <Button size="sm" variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Importar NF-e
              </Button>
            </Link>
            <Link href="/estoque/novo">
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Produto</Button>
            </Link>
          </div>
        )
      }
    >
      <div className="mt-6 space-y-6">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Produtos Cadastrados"
            value={products.length}
            icon={Package}
            colorClass="text-primary bg-primary/20"
          />
          <MetricCard
            title="Alerta de Estoque"
            value={criticalProducts.length}
            subtitle="Produtos na reserva ou vazios"
            icon={AlertTriangle}
            colorClass={criticalProducts.length > 0 ? "text-red-400 bg-red-500/20" : "text-zinc-200 bg-white/10"}
          />
          <MetricCard
            title="Capital Imobilizado (Custo)"
            value={formatCurrency(totalValue)}
            icon={Package}
            colorClass="text-purple-400 bg-purple-500/20"
          />
        </div>

        {/* Tabela de Estoque */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="text-lg font-medium text-white">Catálogo de Produtos</h3>
          </div>
          
          {loading ? (
             <div className="text-center py-10 text-white/50">Carregando estoque...</div>
          ) : products.length === 0 ? (
             <div className="text-center py-10 text-white/50">Nenhum produto cadastrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-background text-white/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome / Categoria</th>
                    <th className="px-4 py-3 font-medium text-center">Quantidade</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Venda / Custo</th>
                    {role !== "barber" && <th className="px-4 py-3 font-medium text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {products.map((p) => {
                    const isCritical = p.stock <= p.minStock;
                    const isZero = p.stock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{p.name}</p>
                          <p className="text-xs text-white/50">{p.category}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-lg text-white">{p.stock}</span>
                          <span className="text-xs text-white/40 ml-1">{p.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isZero ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              ESGOTADO
                            </span>
                          ) : isCritical ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              BAIXO
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold bg-white/10 text-zinc-200 border border-white/20">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-bold text-zinc-200">{formatCurrency(p.price)}</p>
                          <p className="text-xs text-white/40">Custo: {formatCurrency(p.costPrice)}</p>
                        </td>
                        {role !== "barber" && (
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline" onClick={() => setSelectedProduct(p)}>
                              <ArrowUpDown className="w-4 h-4 mr-2" /> Movimentar
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {selectedProduct && (
        <MovementModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSubmit={addMovement}
        />
      )}
    </PageContainer>
  );
}
