"use client";

import { useState } from "react";
import { ShoppingCart, Car, Home, Heart, BookOpen, Gamepad2, Shirt, Briefcase, HelpCircle, Repeat, CreditCard, Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactions";
import { EditTransactionModal } from "./EditTransactionModal";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  alimentação: <ShoppingCart className="w-5 h-5" />,
  transporte: <Car className="w-5 h-5" />,
  moradia: <Home className="w-5 h-5" />,
  saúde: <Heart className="w-5 h-5" />,
  educação: <BookOpen className="w-5 h-5" />,
  lazer: <Gamepad2 className="w-5 h-5" />,
  vestuário: <Shirt className="w-5 h-5" />,
  salário: <Briefcase className="w-5 h-5" />,
  freelance: <Briefcase className="w-5 h-5" />,
  investimentos: <Briefcase className="w-5 h-5" />,
  assinaturas: <CreditCard className="w-5 h-5" />,
  outros: <HelpCircle className="w-5 h-5" />,
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getRecurrenceLabel(t: Transaction): string | null {
  if (t.recurrence === "fixed") return "Fixa";
  if (t.recurrence === "installment" && t.installment_current && t.installments_total) {
    return `${t.installment_current}/${t.installments_total}`;
  }
  return null;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (id: string, updates: { description: string; amount: number; category: string }) => void;
  onEditInstallment: (baseDescription: string, updates: {
    description: string;
    amount: number;
    category: string;
    installments_total: number;
    start_month: number;
    start_year: number;
  }) => void;
  onDelete: (id: string) => void;
  onDeleteAllInstallments: (baseDescription: string) => void;
}

export function TransactionList({ transactions, loading, onEdit, onEditInstallment, onDelete, onDeleteAllInstallments }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);

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
          Nenhuma transação ainda. Use o microfone ou o botão + para adicionar!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((t) => {
          const label = getRecurrenceLabel(t);
          const isOpen = swipedId === t.id;

          return (
            <div key={t.id} className="relative">
              <div
                className="card flex items-center gap-3 cursor-pointer"
                onClick={() => setSwipedId(isOpen ? null : t.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === "income"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {t.recurrence === "fixed" ? (
                    <Repeat className="w-5 h-5" />
                  ) : (
                    CATEGORY_ICONS[t.category] || CATEGORY_ICONS["outros"]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">
                    {t.category}
                    {label && <span className="ml-1 text-primary-600 font-medium">• {label}</span>}
                    {" • "}{formatDate(t.created_at)}
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

              {/* Action buttons */}
              {isOpen && (
                <div className="flex gap-2 mt-1 px-2 pb-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingTransaction(t); setSwipedId(null); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); setSwipedId(null); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={onEdit}
          onSaveInstallment={onEditInstallment}
          onDelete={onDelete}
          onDeleteAllInstallments={onDeleteAllInstallments}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
}
