"use client";

import { useState } from "react";
import { ShoppingCart, Car, Home, Heart, BookOpen, Gamepad2, Shirt, Briefcase, HelpCircle, Repeat, CreditCard, Pencil, Check } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactions";
import { getDisplayStatus } from "@/hooks/useTransactions";
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  em_dia: { label: "Em dia", color: "text-emerald-400", bg: "bg-emerald-950 border border-emerald-800" },
  alerta: { label: "Vence em breve", color: "text-yellow-400", bg: "bg-yellow-950 border border-yellow-800" },
  pago: { label: "Pago ✓", color: "text-blue-400", bg: "bg-blue-950 border border-blue-800" },
  atrasado: { label: "Atrasado", color: "text-red-400", bg: "bg-red-950 border border-red-800" },
  pendente: { label: "Pendente", color: "text-gray-400", bg: "bg-gray-800 border border-gray-700" },
  recebido: { label: "Recebido ✓", color: "text-emerald-400", bg: "bg-emerald-950 border border-emerald-800" },
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getRecurrenceLabel(t: Transaction): string | null {
  if (t.recurrence === "fixed") return "Fixa";
  if (t.recurrence === "installment" && t.installment_current && t.installments_total) {
    return `${t.installment_current}/${t.installments_total}`;
  }
  return null;
}

function getCardClass(t: Transaction): string {
  if (t.type === "income") return "card-glow-green";
  if (t.recurrence === "installment") return "card-glow-purple";
  if (t.recurrence === "fixed") return "card-glow-red";
  return "card-glow-yellow";
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (id: string, updates: { description: string; amount: number; category: string; due_day?: number }) => void;
  onEditInstallment: (baseDescription: string, updates: {
    description: string;
    amount: number;
    category: string;
    installments_total: number;
    start_month: number;
    start_year: number;
    due_day?: number;
  }) => void;
  onDelete: (id: string) => void;
  onDeleteAllInstallments: (baseDescription: string) => void;
  onConfirmPayment: (id: string) => void;
}

export function TransactionList({
  transactions,
  loading,
  onEdit,
  onEditInstallment,
  onDelete,
  onDeleteAllInstallments,
  onConfirmPayment,
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/3" />
            </div>
            <div className="h-4 bg-gray-800 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500 text-sm">
          Nenhuma transação ainda. Use o microfone ou o botão + para adicionar!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {transactions.map((t) => {
          const label = getRecurrenceLabel(t);
          const displayStatus = t.recurrence !== "once" ? getDisplayStatus(t) : null;
          const statusConfig = displayStatus ? STATUS_CONFIG[displayStatus] : null;
          const canConfirm = displayStatus && !["pago", "recebido"].includes(displayStatus);
          const cardClass = getCardClass(t);

          return (
            <div key={t.id} className={cardClass}>
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    t.type === "income"
                      ? "bg-emerald-900/50 text-emerald-400"
                      : "bg-red-900/50 text-red-400"
                  }`}
                >
                  {t.recurrence === "fixed" ? (
                    <Repeat className="w-5 h-5" />
                  ) : (
                    CATEGORY_ICONS[t.category] || CATEGORY_ICONS["outros"]
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-100 truncate">{t.description}</p>
                  <p className="text-xs text-gray-500">
                    {t.category}
                    {label && <span className="ml-1 text-purple-400 font-medium">• {label}</span>}
                    {t.due_day && t.recurrence !== "once" && (
                      <span className="ml-1">• Venc. dia {t.due_day}</span>
                    )}
                  </p>
                </div>

                {/* Amount */}
                <p
                  className={`font-bold text-sm whitespace-nowrap ${
                    t.type === "income" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                </p>
              </div>

              {/* Status bar + actions */}
              {t.recurrence !== "once" && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                  {statusConfig && (
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    {canConfirm && (
                      <button
                        onClick={() => onConfirmPayment(t.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          t.type === "income"
                            ? "text-emerald-400 bg-emerald-950 border border-emerald-800 hover:bg-emerald-900"
                            : "text-blue-400 bg-blue-950 border border-blue-800 hover:bg-blue-900"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t.type === "income" ? "Recebido" : "Pago"}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTransaction(t)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </div>
                </div>
              )}

              {/* Once transactions - simple edit */}
              {t.recurrence === "once" && (
                <div className="flex justify-end mt-3 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => setEditingTransaction(t)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
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
