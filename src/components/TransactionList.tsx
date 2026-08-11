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
  em_dia: { label: "Em dia", color: "text-green-600", bg: "bg-green-100" },
  alerta: { label: "Vence em breve", color: "text-yellow-600", bg: "bg-yellow-100" },
  pago: { label: "Pago ✓", color: "text-blue-600", bg: "bg-blue-100" },
  atrasado: { label: "Atrasado", color: "text-red-600", bg: "bg-red-100" },
  pendente: { label: "Pendente", color: "text-gray-600", bg: "bg-gray-100" },
  recebido: { label: "Recebido ✓", color: "text-green-600", bg: "bg-green-100" },
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
          const displayStatus = t.recurrence !== "once" ? getDisplayStatus(t) : null;
          const statusConfig = displayStatus ? STATUS_CONFIG[displayStatus] : null;
          const canConfirm = displayStatus && !["pago", "recebido"].includes(displayStatus);

          return (
            <div key={t.id} className="card p-3">
              <div className="flex items-center gap-3">
                {/* Icon */}
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">
                    {t.category}
                    {label && <span className="ml-1 text-primary-600 font-medium">• {label}</span>}
                    {t.due_day && t.recurrence !== "once" && (
                      <span className="ml-1">• Venc. dia {t.due_day}</span>
                    )}
                  </p>
                </div>

                {/* Amount */}
                <p
                  className={`font-semibold text-sm whitespace-nowrap ${
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                </p>
              </div>

              {/* Status bar + actions */}
              {t.recurrence !== "once" && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  {/* Status badge */}
                  {statusConfig && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {canConfirm && (
                      <button
                        onClick={() => onConfirmPayment(t.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg transition-colors ${
                          t.type === "income"
                            ? "text-green-700 bg-green-50 hover:bg-green-100"
                            : "text-blue-700 bg-blue-50 hover:bg-blue-100"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {t.type === "income" ? "Recebido" : "Pago"}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTransaction(t)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>
              )}

              {/* Once transactions - simple edit */}
              {t.recurrence === "once" && (
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => setEditingTransaction(t)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <Pencil className="w-3 h-3" />
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
