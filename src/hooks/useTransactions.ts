"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ParsedTransaction } from "@/lib/parseVoiceCommand";
import type { NewTransaction } from "@/components/AddTransactionForm";

export type PaymentStatus = "pending" | "paid" | "received" | "overdue";
export type DisplayStatus = "em_dia" | "alerta" | "pago" | "atrasado" | "pendente" | "recebido";

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
  due_day: number | null;
  status: PaymentStatus;
  paid_at: string | null;
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

export function getDisplayStatus(t: Transaction): DisplayStatus {
  const now = new Date();
  const currentDay = now.getDate();
  const dueDay = t.due_day || 10;

  if (t.type === "income") {
    if (t.status === "received") return "recebido";
    if (currentDay > dueDay) return "atrasado";
    return "pendente";
  } else {
    if (t.status === "paid") return "pago";
    if (currentDay > dueDay) return "atrasado";
    if (dueDay - currentDay <= 5) return "alerta";
    return "em_dia";
  }
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
    if (t.recurrence === "once") {
      const d = new Date(t.created_at);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    }
    if (t.recurrence === "fixed") {
      return true;
    }
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
          status: parsed.type === "expense" ? "paid" : "received",
          paid_at: new Date().toISOString(),
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
      const dueDay = newTx.due_day || 10;

      if (newTx.recurrence === "installment" && newTx.installments_total) {
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
            due_day: dueDay,
            status: "pending" as const,
            created_at: new Date(year, month - 1, dueDay).toISOString(),
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
            due_day: dueDay,
            status: "pending" as const,
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

  const confirmPayment = useCallback(async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    const newStatus = transaction?.type === "income" ? "received" : "paid";

    const { error } = await supabase
      .from("transactions")
      .update({ status: newStatus, paid_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: newStatus as PaymentStatus, paid_at: new Date().toISOString() } : t
        )
      );
    }
  }, [transactions]);

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
      due_day?: number;
    }) => {
      if (!userId || !householdId) return;

      const matchingIds = transactions
        .filter((t) => t.recurrence === "installment" && t.description.replace(/\s*\(\d+\/\d+\)\s*$/, "") === baseDescription)
        .map((t) => t.id);

      if (matchingIds.length > 0) {
        await supabase.from("transactions").delete().in("id", matchingIds);
      }

      const dueDay = updates.due_day || 10;
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
          due_day: dueDay,
          status: "pending" as const,
          created_at: new Date(year, month - 1, dueDay).toISOString(),
        });
      }

      const { data } = await supabase.from("transactions").insert(entries).select();

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

  // Summary only counts confirmed (paid/received) transactions
  const summary: Summary = currentMonthTransactions.reduce(
    (acc, t) => {
      if (t.recurrence === "once" || t.status === "paid" || t.status === "received") {
        if (t.type === "income") {
          acc.income += t.amount;
        } else {
          acc.expenses += t.amount;
        }
      }
      acc.balance = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, balance: 0 }
  );

  const categorySummary: CategorySummary[] = (() => {
    const expenses = currentMonthTransactions.filter(
      (t) => t.type === "expense" && (t.recurrence === "once" || t.status === "paid")
    );
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
    confirmPayment,
    deleteTransaction,
    deleteAllInstallments,
    summary,
    categorySummary,
    loading,
    refetch: fetchTransactions,
  };
}
