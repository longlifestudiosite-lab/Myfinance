"use client";

import { useState } from "react";
import type { Transaction } from "@/hooks/useTransactions";

type Period = "daily" | "weekly" | "monthly" | "yearly";

const CATEGORY_COLORS: Record<string, string> = {
  alimentação: "#ef4444",
  transporte: "#f97316",
  moradia: "#eab308",
  saúde: "#22c55e",
  educação: "#3b82f6",
  lazer: "#8b5cf6",
  vestuário: "#ec4899",
  assinaturas: "#6366f1",
  salário: "#10b981",
  freelance: "#14b8a6",
  investimentos: "#0ea5e9",
  outros: "#6b7280",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface DashboardProps {
  allTransactions: Transaction[];
}

export function Dashboard({ allTransactions }: DashboardProps) {
  const [period, setPeriod] = useState<Period>("monthly");
  const now = new Date();

  // Filter transactions by period
  const filtered = allTransactions.filter((t) => {
    if (period === "daily") {
      // Daily: only "once" transactions from today
      if (t.recurrence !== "once") return false;
      const d = new Date(t.created_at);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }
    if (period === "weekly") {
      // Weekly: "once" transactions from this week only
      if (t.recurrence !== "once") return false;
      const d = new Date(t.created_at);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return d >= startOfWeek && d < endOfWeek;
    }
    if (period === "monthly") {
      // Monthly: fixed + installments for this month + once from this month
      if (t.recurrence === "fixed") return true;
      if (t.recurrence === "installment" && t.start_month && t.start_year) {
        return t.start_month === now.getMonth() + 1 && t.start_year === now.getFullYear();
      }
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (period === "yearly") {
      // Yearly: fixed (x12 handled below) + all installments for this year + once from this year
      if (t.recurrence === "fixed") return true;
      if (t.recurrence === "installment" && t.start_year) {
        return t.start_year === now.getFullYear();
      }
      const d = new Date(t.created_at);
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Calculate totals
  const getAmount = (t: Transaction) => {
    // In yearly view, fixed transactions count as 12 months
    if (period === "yearly" && t.recurrence === "fixed") return t.amount * 12;
    return t.amount;
  };

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + getAmount(t), 0);

  const totalExpenses = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + getAmount(t), 0);

  const confirmedIncome = filtered
    .filter((t) => t.type === "income" && (t.status === "received" || t.recurrence === "once"))
    .reduce((sum, t) => sum + getAmount(t), 0);

  const confirmedExpenses = filtered
    .filter((t) => t.type === "expense" && (t.status === "paid" || t.recurrence === "once"))
    .reduce((sum, t) => sum + getAmount(t), 0);

  const balance = totalIncome - totalExpenses;

  // Category breakdown for expenses
  const expensesByCategory: Record<string, { total: number; confirmed: number; count: number }> = {};
  filtered
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!expensesByCategory[t.category]) {
        expensesByCategory[t.category] = { total: 0, confirmed: 0, count: 0 };
      }
      const amt = getAmount(t);
      expensesByCategory[t.category].total += amt;
      expensesByCategory[t.category].count += 1;
      if (t.status === "paid" || t.recurrence === "once") {
        expensesByCategory[t.category].confirmed += amt;
      }
    });

  const categoryList = Object.entries(expensesByCategory)
    .map(([category, data]) => ({
      category,
      ...data,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Monthly breakdown for yearly view
  const monthlyBreakdown = period === "yearly" ? getMonthlyBreakdown(allTransactions, now.getFullYear()) : [];

  const periodLabel = {
    daily: "Hoje",
    weekly: "Esta semana",
    monthly: "Este mês",
    yearly: "Este ano",
  }[period];

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="sticky top-12 z-10 bg-gray-950 pb-3">
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl">
          {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                period === p
                  ? "bg-gray-800 text-emerald-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p === "daily" && "Dia"}
              {p === "weekly" && "Semana"}
              {p === "monthly" && "Mês"}
              {p === "yearly" && "Ano"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="card-bordered">
        <p className="text-xs text-gray-500 mb-1">{periodLabel}</p>
        <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {formatCurrency(balance)}
        </p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-xs text-gray-500">Entradas previstas</p>
            <p className="text-sm font-semibold text-emerald-400">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-emerald-600">Confirmado: {formatCurrency(confirmedIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Saídas previstas</p>
            <p className="text-sm font-semibold text-red-400">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-red-600">Confirmado: {formatCurrency(confirmedExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Category chart */}
      {categoryList.length > 0 && (
        <div className="card-glow-red">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">
            Despesas por categoria
          </h3>
          <div className="space-y-3">
            {categoryList.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-300 capitalize">
                    {cat.category} ({cat.count})
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatCurrency(cat.total)} ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-40"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS["outros"],
                    }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalExpenses > 0 ? (cat.confirmed / totalExpenses) * 100 : 0}%`,
                      backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS["outros"],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            Barra sólida = confirmado | Barra clara = previsto
          </p>
        </div>
      )}

      {/* Monthly breakdown for yearly view */}
      {period === "yearly" && monthlyBreakdown.length > 0 && (
        <div className="card-glow-blue">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">
            Visão mensal ({now.getFullYear()})
          </h3>
          <div className="space-y-2">
            {monthlyBreakdown.map((m) => (
              <div key={m.month} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-400 font-medium">{m.label}</span>
                <div className="flex-1 flex gap-1 h-4">
                  {m.income > 0 && (
                    <div
                      className="bg-emerald-500 rounded-sm h-full"
                      style={{ width: `${(m.income / Math.max(...monthlyBreakdown.map(x => Math.max(x.income, x.expenses)))) * 100}%` }}
                      title={`Entrada: ${formatCurrency(m.income)}`}
                    />
                  )}
                  {m.expenses > 0 && (
                    <div
                      className="bg-red-500 rounded-sm h-full"
                      style={{ width: `${(m.expenses / Math.max(...monthlyBreakdown.map(x => Math.max(x.income, x.expenses)))) * 100}%` }}
                      title={`Saída: ${formatCurrency(m.expenses)}`}
                    />
                  )}
                </div>
                <span className={`w-20 text-right font-medium ${m.income - m.expenses >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(m.income - m.expenses)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-emerald-500 rounded-sm inline-block" /> Entradas</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-500 rounded-sm inline-block" /> Saídas</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {categoryList.length === 0 && (
        <div className="card text-center py-6">
          <p className="text-gray-500 text-sm">
            Sem dados para {periodLabel.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
}

function getMonthlyBreakdown(allTransactions: Transaction[], year: number) {
  const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    let income = 0;
    let expenses = 0;

    allTransactions.forEach((t) => {
      let belongsToMonth = false;

      if (t.recurrence === "fixed") {
        belongsToMonth = true;
      } else if (t.recurrence === "installment" && t.start_month && t.start_year) {
        belongsToMonth = t.start_month === month && t.start_year === year;
      } else if (t.recurrence === "once") {
        const d = new Date(t.created_at);
        belongsToMonth = d.getMonth() + 1 === month && d.getFullYear() === year;
      }

      if (belongsToMonth) {
        if (t.type === "income") income += t.amount;
        else expenses += t.amount;
      }
    });

    return { month, label, income, expenses };
  });
}
