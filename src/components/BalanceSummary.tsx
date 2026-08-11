"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { Summary } from "@/hooks/useTransactions";

interface BalanceSummaryProps {
  summary: Summary;
  loading: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function BalanceSummary({ summary, loading }: BalanceSummaryProps) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="flex gap-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-5 h-5 text-primary-600" />
        <span className="text-sm text-gray-500">Saldo atual</span>
      </div>
      <p
        className={`text-3xl font-bold ${
          summary.balance >= 0 ? "text-primary-700" : "text-red-600"
        }`}
      >
        {formatCurrency(summary.balance)}
      </p>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">
            {formatCurrency(summary.income)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">
            {formatCurrency(summary.expenses)}
          </span>
        </div>
      </div>
    </div>
  );
}
