"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface BudgetLimit {
  id: string;
  household_id: string;
  category: string;
  limit_amount: number;
  created_at: string;
}

export interface BudgetAlert {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  exceeded: boolean;
}

export function useBudgetAlerts(
  householdId: string | null,
  categorySummary: { category: string; total: number }[]
) {
  const [limits, setLimits] = useState<BudgetLimit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLimits = useCallback(async () => {
    if (!householdId) return;
    const { data, error } = await supabase
      .from("budget_limits")
      .select("*")
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching limits:", error);
    } else {
      setLimits(data || []);
    }
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const setLimit = useCallback(
    async (category: string, limitAmount: number) => {
      if (!householdId) return;

      const existing = limits.find((l) => l.category === category);
      if (existing) {
        const { error } = await supabase
          .from("budget_limits")
          .update({ limit_amount: limitAmount })
          .eq("id", existing.id);
        if (!error) {
          setLimits((prev) =>
            prev.map((l) =>
              l.id === existing.id ? { ...l, limit_amount: limitAmount } : l
            )
          );
        }
      } else {
        const { data, error } = await supabase
          .from("budget_limits")
          .insert({ household_id: householdId, category, limit_amount: limitAmount })
          .select()
          .single();
        if (!error && data) {
          setLimits((prev) => [...prev, data]);
        }
      }
    },
    [householdId, limits]
  );

  const removeLimit = useCallback(async (id: string) => {
    const { error } = await supabase.from("budget_limits").delete().eq("id", id);
    if (!error) {
      setLimits((prev) => prev.filter((l) => l.id !== id));
    }
  }, []);

  const alerts: BudgetAlert[] = limits
    .map((limit) => {
      const catData = categorySummary.find((c) => c.category === limit.category);
      const spent = catData?.total || 0;
      const percentage =
        limit.limit_amount > 0 ? (spent / limit.limit_amount) * 100 : 0;
      return {
        category: limit.category,
        limit: limit.limit_amount,
        spent,
        percentage,
        exceeded: spent >= limit.limit_amount,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  return { limits, alerts, setLimit, removeLimit, loading };
}
