"use client";

import type { CategorySummary } from "@/hooks/useTransactions";

const CATEGORY_COLORS: Record<string, string> = {
  alimentação: "#ef4444",
  transporte: "#f97316",
  moradia: "#eab308",
  saúde: "#22c55e",
  educação: "#3b82f6",
  lazer: "#8b5cf6",
  vestuário: "#ec4899",
  salário: "#10b981",
  outros: "#6b7280",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

interface DashboardProps {
  categorySummary: CategorySummary[];
  totalExpenses: number;
}

export function Dashboard({ categorySummary, totalExpenses }: DashboardProps) {
  if (categorySummary.length === 0) {
    return (
      <div className="card text-center py-6">
        <p className="text-gray-400 text-sm">
          Ainda sem dados para o dashboard. Adicione transações!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Gastos por categoria
        </h3>
        <div className="space-y-3">
          {categorySummary.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {cat.category}
                </span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(cat.total)} ({cat.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor:
                      CATEGORY_COLORS[cat.category] || CATEGORY_COLORS["outros"],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-xs text-gray-500">Total gasto</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Categorias</p>
          <p className="text-lg font-bold text-gray-700">
            {categorySummary.length}
          </p>
        </div>
      </div>
    </div>
  );
}
