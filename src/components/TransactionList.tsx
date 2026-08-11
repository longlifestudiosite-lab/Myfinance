"use client";

import { ShoppingCart, Car, Home, Heart, BookOpen, Gamepad2, Shirt, Briefcase, HelpCircle } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactions";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  alimentação: <ShoppingCart className="w-5 h-5" />,
  transporte: <Car className="w-5 h-5" />,
  moradia: <Home className="w-5 h-5" />,
  saúde: <Heart className="w-5 h-5" />,
  educação: <BookOpen className="w-5 h-5" />,
  lazer: <Gamepad2 className="w-5 h-5" />,
  vestuário: <Shirt className="w-5 h-5" />,
  salário: <Briefcase className="w-5 h-5" />,
  outros: <HelpCircle className="w-5 h-5" />,
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-400 text-sm">
          Nenhuma transação ainda. Use o botão de microfone para adicionar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => (
        <div key={t.id} className="card flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              t.type === "income"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {CATEGORY_ICONS[t.category] || CATEGORY_ICONS["outros"]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{t.description}</p>
            <p className="text-xs text-gray-400">
              {t.category} • {formatDate(t.created_at)}
            </p>
          </div>
          <p
            className={`font-semibold text-sm whitespace-nowrap ${
              t.type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
