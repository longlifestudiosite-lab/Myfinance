"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ParsedTransaction } from "@/lib/parseVoiceCommand";
import type { NewTransaction } from "@/components/AddTransactionForm";

export interface Transaction {
  id: string;
  user_id: string;
  household_id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
  recurrence: "once" | "fixed" | "installment";
  installments_total: number | null;
  installment_current: number | null;
  start_month: number | null;
  start_year: number | null;
  parent_id: string | null;
  created_at: string;
}

export interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export function useTransactions(userId: string | undefined, householdId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const fetchTransactions = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions relevant to current month
  const currentMonthTransactions = transactions.filter((t) => {
    // Once: show if created this month
    if (t.recurrence === "once") {
      const d = new Date(t.created_at);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    }
    // Fixed: always show (jan-dec)
    if (t.recurrence === "fixed") {
      return true;
    }
    // Installment: show if current month is within the installment range
    if (t.recurrence === "installment" && t.start_month && t.start_year && t.installments_total) {
      const startDate = new Date(t.start_year, t.start_month - 1, 1);
      const currentDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(t.start_year, t.start_month - 1 + t.installments_total, 1);
      return currentDate >= startDate && currentDate < endDate;
    }
    return true;
  });

  const addTransaction = useCallback(
    async (parsed: ParsedTransaction) => {
      if (!userId || !householdId) return;
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          household_id: householdId,
          type: parsed.type,
          amount: parsed.amount,
          description: parsed.description,
          category: parsed.category,
          recurrence: "once",
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding transaction:", error);
        return;
      }
      if (data) {
        setTransactions((prev) => [data, ...prev]);
      }
    },
    [userId, householdId]
  );

  const addManualTransaction = useCallback(
    async (newTx: NewTransaction) => {
      if (!userId || !householdId) return;

      if (newTx.recurrence === "installment" && newTx.installments_total) {
        // Create individual installment entries
        const entries = [];
        for (let i = 1; i <= newTx.installments_total; i++) {
          const month = ((newTx.start_month - 1 + (i - 1)) % 12) + 1;
          const year = newTx.start_year + Math.floor((newTx.start_month - 1 + (i - 1)) / 12);
          entries.push({
            user_id: userId,
            household_id: householdId,
            type: newTx.type,
            amount: newTx.amount,
            description: `${newTx.description} (${i}/${newTx.installments_total})`,
            category: newTx.category,
            recurrence: "installment" as const,
            installments_total: newTx.installments_total,
            installment_current: i,
            start_month: month,
            start_year: year,
            created_at: new Date(year, month - 1, 1).toISOString(),
          });
        }
        const { data, error } = await supabase
          .from("transactions")
          .insert(entries)
          .select();

        if (error) {
          console.error("Error adding installments:", error);
          return;
        }
        if (data) {
          setTransactions((prev) => [...data.reverse(), ...prev]);
        }
      } else {
        // Fixed or once
        const { data, error } = await supabase
          .from("transactions")
          .insert({
            user_id: userId,
            household_id: householdId,
            type: newTx.type,
            amount: newTx.amount,
            description: newTx.description,
            category: newTx.category,
            recurrence: newTx.recurrence,
            start_month: newTx.start_month,
            start_year: newTx.start_year,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding transaction:", error);
          return;
        }
        if (data) {
          setTransactions((prev) => [data, ...prev]);
        }
      }
    },
    [userId, householdId]
  );

  const editTransaction = useCallback(
    async (id: string, updates: { description: string; amount: number; category: string }) => {
      const { error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id);

      if (!error) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
      }
    },
    []
  );

  const editInstallment = useCallback(
    async (baseDescription: string, updates: {
      description: string;
      amount: number;
      category: string;
      installments_total: number;
      start_month: number;
      start_year: number;
    }) => {
      if (!userId || !householdId) return;

      // Find and delete all existing installments with this base description
      const matchingIds = transactions
        .filter((t) => t.recurrence === "installment" && t.description.replace(/\s*\(\d+\/\d+\)\s*$/, "") === baseDescription)
        .map((t) => t.id);

      if (matchingIds.length > 0) {
        await supabase.from("transactions").delete().in("id", matchingIds);
      }

      // Recreate with new params
      const entries = [];
      for (let i = 1; i <= updates.installments_total; i++) {
        const month = ((updates.start_month - 1 + (i - 1)) % 12) + 1;
        const year = updates.start_year + Math.floor((updates.start_month - 1 + (i - 1)) / 12);
        entries.push({
          user_id: userId,
          household_id: householdId,
          type: transactions.find((t) => t.description.includes(baseDescription))?.type || "expense",
          amount: updates.amount,
          description: `${updates.description} (${i}/${updates.installments_total})`,
          category: updates.category,
          recurrence: "installment" as const,
          installments_total: updates.installments_total,
          installment_current: i,
          start_month: month,
          start_year: year,
          created_at: new Date(year, month - 1, 1).toISOString(),
        });
      }

      const { data } = await supabase.from("transactions").insert(entries).select();

      // Update local state
      setTransactions((prev) => {
        const filtered = prev.filter((t) => !matchingIds.includes(t.id));
        return [...(data || []).reverse(), ...filtered];
      });
    },
    [userId, householdId, transactions]
  );

  const deleteAllInstallments = useCallback(
    async (baseDescription: string) => {
      const matchingIds = transactions
        .filter((t) => t.recurrence === "installment" && t.description.replace(/\s*\(\d+\/\d+\)\s*$/, "") === baseDescription)
        .map((t) => t.id);

      if (matchingIds.length > 0) {
        await supabase.from("transactions").delete().in("id", matchingIds);
        setTransactions((prev) => prev.filter((t) => !matchingIds.includes(t.id)));
      }
    },
    [transactions]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const summary: Summary = currentMonthTransactions.reduce(
    (acc, t) => {
      if (t.type === "income") {
        acc.income += t.amount;
      } else {
        acc.expenses += t.amount;
      }
      acc.balance = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, balance: 0 }
  );

  const categorySummary: CategorySummary[] = (() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === "expense");
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const grouped: Record<string, { total: number; count: number }> = {};

    expenses.forEach((t) => {
      if (!grouped[t.category]) {
        grouped[t.category] = { total: 0, count: 0 };
      }
      grouped[t.category].total += t.amount;
      grouped[t.category].count += 1;
    });

    return Object.entries(grouped)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  })();

  return {
    transactions: currentMonthTransactions,
    allTransactions: transactions,
    addTransaction,
    addManualTransaction,
    editTransaction,
    editInstallment,
    deleteTransaction,
    deleteAllInstallments,
    summary,
    categorySummary,
    loading,
    refetch: fetchTransactions,
  };
}
