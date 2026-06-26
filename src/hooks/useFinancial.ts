"use client";

import { useState, useCallback, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { Transaction, FinancialSummary } from "@/types/financial";
import { financialService } from "@/services/financial.service";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { DateFilter } from "@/types/dashboard";

export function useFinancial() {
  const { user, role, barbershopId } = useAuth();
  const { error } = useToastContext();

  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    commissionsPaid: 0
  });

  // Block completely if the user is a barber to avoid leaking financial data
  const isAuthorized = role === "owner" || role === "manager";

  const fetchFinancialData = useCallback(async () => {
    if (!barbershopId || !isAuthorized) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = new Date();
      let startDateStr = "";
      let endDateStr = format(today, "yyyy-MM-dd");

      switch (dateFilter) {
        case "today":
          startDateStr = format(today, "yyyy-MM-dd");
          break;
        case "7d":
          startDateStr = format(subDays(today, 6), "yyyy-MM-dd");
          break;
        case "30d":
          startDateStr = format(subDays(today, 29), "yyyy-MM-dd");
          break;
        case "month":
          startDateStr = format(startOfMonth(today), "yyyy-MM-dd");
          endDateStr = format(endOfMonth(today), "yyyy-MM-dd");
          break;
      }

      const txList = await financialService.getTransactions(barbershopId, startDateStr, endDateStr);
      // Sort desc by date and creation
      txList.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });

      setTransactions(txList);

      const sum = await financialService.getSummary(barbershopId, startDateStr, endDateStr);
      setSummary(sum);

    } catch (err) {
      console.error("Erro ao buscar dados financeiros:", err);
    } finally {
      setLoading(false);
    }
  }, [user, dateFilter, isAuthorized, error]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const addTransaction = async (data: Omit<Transaction, "id" | "barbershopId" | "createdAt" | "updatedAt">) => {
    if (!barbershopId) throw new Error("No barbershopId");
    await financialService.createTransaction(barbershopId, data);
    fetchFinancialData(); // Recarrega para atualizar summary e lista
  };

  const removeTransaction = async (id: string) => {
    if (role !== "owner") throw new Error("Apenas proprietários podem excluir transações financeiras");
    await financialService.deleteTransaction(id);
    fetchFinancialData();
  };

  return {
    transactions,
    summary,
    loading,
    dateFilter,
    setDateFilter,
    addTransaction,
    removeTransaction,
    refresh: fetchFinancialData,
    isAuthorized
  };
}
