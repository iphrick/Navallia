"use client";

import { useState, useCallback, useEffect } from "react";
import { Product, Supplier, StockMovement, MovementType } from "@/types/stock";
import { stockService } from "@/services/stock.service";
import { supplierService } from "@/services/supplier.service";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";

export function useStock() {
  const { user, barbershopId } = useAuth();
  const { error, success } = useToastContext();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const fetchStockData = useCallback(async () => {
    if (!barbershopId) return;

    try {
      setLoading(true);
      const [prods, supps] = await Promise.all([
        stockService.getProducts(barbershopId),
        supplierService.getSuppliers(barbershopId)
      ]);
      setProducts(prods);
      setSuppliers(supps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [barbershopId, error]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  const fetchMovements = useCallback(async (productId?: string) => {
    if (!barbershopId) return;
    try {
      const movs = await stockService.getMovements(barbershopId, productId);
      setMovements(movs);
    } catch (err) {
      console.error(err);
    }
  }, [barbershopId]);

  const addProduct = async (data: Omit<Product, "id" | "barbershopId" | "createdAt" | "updatedAt">) => {
    if (!barbershopId) throw new Error("No barbershopId");
    await stockService.createProduct(barbershopId, data);
    fetchStockData();
    success("Sucesso", "Produto adicionado com sucesso.");
  };

  const addMovement = async (productId: string, type: MovementType, quantity: number, reason: string, integrateFinance: boolean) => {
    if (!barbershopId) throw new Error("No barbershopId");
    await stockService.addMovement(barbershopId, productId, type, quantity, reason, integrateFinance);
    fetchStockData();
    fetchMovements(productId);
    success("Sucesso", "Movimentação registrada com sucesso.");
  };

  return {
    products,
    suppliers,
    movements,
    loading,
    refresh: fetchStockData,
    fetchMovements,
    addProduct,
    addMovement
  };
}
