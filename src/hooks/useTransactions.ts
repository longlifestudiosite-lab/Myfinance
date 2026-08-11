"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ParsedTransaction } from "@/lib/parseVoiceCommand";

export interface Transaction {
  id: string;
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

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (parsed: ParsedTransaction) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
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
    []
  );

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

  return { transactions, addTransaction, summary, loading, refetch: fetchTransactions };
}
