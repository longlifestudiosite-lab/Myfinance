"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useHousehold(userId: string | undefined) {
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHousehold = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching household:", error);
    } else {
      setHouseholdId(data?.household_id ?? null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  return { householdId, loading };
}
