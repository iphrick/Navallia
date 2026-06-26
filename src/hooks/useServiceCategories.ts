"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceCategory } from "@/types/service";
import { categoryService } from "@/services/category.service";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";

export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, barbershopId } = useAuth();
  const { error } = useToastContext();

  const fetchCategories = useCallback(async () => {
    if (!barbershopId) return;

    try {
      setLoading(true);
      // Auto seed as per requirements
      await categoryService.seedDefaultCategories(barbershopId);
      
      const data = await categoryService.getCategories(barbershopId);
      setCategories(data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    } finally {
      setLoading(false);
    }
  }, [barbershopId, error]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: Omit<ServiceCategory, "id" | "barbershopId" | "createdAt">) => {
    if (!barbershopId) return null;
    const newCat = await categoryService.createCategory(barbershopId, data);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (id: string, data: Partial<Omit<ServiceCategory, "id" | "barbershopId" | "createdAt">>) => {
    await categoryService.updateCategory(id, data);
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)));
  };

  const deleteCategory = async (id: string) => {
    await categoryService.deleteCategory(id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories
  };
}
