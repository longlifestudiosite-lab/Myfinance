"use client";

import { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactions";

interface EditTransactionModalProps {
  transaction: Transaction;
  onSave: (id: string, updates: { description: string; amount: number; category: string; due_day?: number }) => void;
  onSaveInstallment: (baseDescription: string, updates: {
    description: string;
    amount: number;
    category: string;
    installments_total: number;
    start_month: number;
    start_year: number;
  }) => void;
  onDelete: (id: string) => void;
  onDeleteAllInstallments: (baseDescription: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  "alimentação", "transporte", "moradia", "saúde", "educação",
  "lazer", "vestuário", "assinaturas", "salário", "freelance",
  "investimentos", "outros",
];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function EditTransactionModal({
  transaction,
  onSave,
  onSaveInstallment,
  onDelete,
  onDeleteAllInstallments,
  onClose,
}: EditTransactionModalProps) {
  const baseDescription = transaction.description.replace(/\s*\(\d+\/\d+\)\s*$/, "");

  const [description, setDescription] = useState(baseDescription);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [dueDay, setDueDay] = useState((transaction.due_day || 10).toString());
  const [installments, setInstallments] = useState(
    (transaction.installments_total || 10).toString()
  );
  const [startMonth, setStartMonth] = useState(transaction.start_month || 1);
  const [startYear, setStartYear] = useState(transaction.start_year || 2026);

  const isInstallment = transaction.recurrence === "installment";
  const isFixed = transaction.recurrence === "fixed";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !description.trim()) return;

    if (isInstallment) {
      // Delete old installments and recreate with new params
      onSaveInstallment(baseDescription, {
        description: description.trim(),
        amount: numAmount,
        category,
        installments_total: parseInt(installments),
        start_month: startMonth,
        start_year: startYear,
      });
    } else {
      onSave(transaction.id, {
        description: description.trim(),
        amount: numAmount,
        category,
        due_day: parseInt(dueDay) || 10,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Editar</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Fechar">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Type badge */}
        {isInstallment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
            <p className="text-xs text-blue-700 font-medium">🔢 Parcelas Definidas</p>
          </div>
        )}
        {isFixed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
            <p className="text-xs text-blue-700 font-medium">📅 Fixa Anual (Jan a Dez)</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="edit-desc" className="text-sm font-medium text-gray-700">Descrição</label>
            <input
              id="edit-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="edit-amount" className="text-sm font-medium text-gray-700">
              Valor (R$) {isInstallment && "por parcela"}
            </label>
            <input
              id="edit-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Installment-specific fields */}
          {isInstallment && (
            <>
              <div>
                <label htmlFor="edit-installments" className="text-sm font-medium text-gray-700">
                  Número de parcelas
                </label>
                <input
                  id="edit-installments"
                  type="number"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  required
                  min="2"
                  max="72"
                  className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Data de início do pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Due day - for fixed transactions */}
          {isFixed && (
            <div>
              <label htmlFor="edit-dueday" className="text-sm font-medium text-gray-700">
                Dia de vencimento
              </label>
              <input
                id="edit-dueday"
                type="number"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
                min="1"
                max="31"
                className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="edit-cat" className="text-sm font-medium text-gray-700">Categoria</label>
            <select
              id="edit-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Save button */}
          <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {isInstallment ? "Salvar (recria parcelas)" : "Salvar"}
          </button>
        </form>

        {/* Delete section */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => { onDelete(transaction.id); onClose(); }}
            className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
            {isInstallment ? "Excluir só esta parcela" : "Excluir"}
          </button>
          {isInstallment && (
            <button
              onClick={() => { onDeleteAllInstallments(baseDescription); onClose(); }}
              className="w-full py-2 text-sm text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              Excluir TODAS as parcelas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
