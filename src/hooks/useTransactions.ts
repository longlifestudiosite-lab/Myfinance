"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ParsedTransaction } from "@/lib/parseVoiceCommand";

export interface Transaction {
  id: string;
  user_id: string;
  household_id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
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

  const fetchTransactions = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(100);

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

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const summary: Summary = transactions.reduce(
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
    const expenses = transactions.filter((t) => t.type === "expense");
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
    transactions,
    addTransaction,
    deleteTransaction,
    summary,
    categorySummary,
    loading,
    refetch: fetchTransactions,
  };
}
