"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

export interface NewTransaction {
  type: "expense" | "income";
  recurrence: "once" | "fixed" | "installment";
  amount: number;
  description: string;
  category: string;
  installments_total?: number;
  start_month: number;
  start_year: number;
}

interface AddTransactionFormProps {
  onSubmit: (data: NewTransaction) => void;
  onClose: () => void;
}

const EXPENSE_CATEGORIES = [
  "alimentação",
  "transporte",
  "moradia",
  "saúde",
  "educação",
  "lazer",
  "vestuário",
  "assinaturas",
  "outros",
];

const INCOME_CATEGORIES = ["salário", "freelance", "investimentos", "outros"];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function AddTransactionForm({ onSubmit, onClose }: AddTransactionFormProps) {
  const now = new Date();
  const [type, setType] = useState<"expense" | "income">("expense");
  const [recurrence, setRecurrence] = useState<"once" | "fixed" | "installment">("once");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("outros");
  const [installments, setInstallments] = useState("2");
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [startYear, setStartYear] = useState(now.getFullYear());

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !description.trim()) return;

    onSubmit({
      type,
      recurrence: type === "income" ? "fixed" : recurrence,
      amount: numAmount,
      description: description.trim(),
      category,
      installments_total: recurrence === "installment" ? parseInt(installments) : undefined,
      start_month: startMonth,
      start_year: startYear,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Novo lançamento</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setType("expense"); setCategory("outros"); setRecurrence("once"); }}
              className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                type === "expense"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => { setType("income"); setCategory("salário"); setRecurrence("fixed"); }}
              className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                type === "income"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Entrada
            </button>
          </div>

          {/* Recurrence type - only for expenses */}
          {type === "expense" && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de despesa
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRecurrence("once")}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors ${
                    recurrence === "once"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  Avulsa
                </button>
                <button
                  type="button"
                  onClick={() => setRecurrence("fixed")}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors ${
                    recurrence === "fixed"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  Fixa mensal
                </button>
                <button
                  type="button"
                  onClick={() => setRecurrence("installment")}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors ${
                    recurrence === "installment"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  Parcelada
                </button>
              </div>
            </div>
          )}

          {/* Income note */}
          {type === "income" && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              Entradas fixas aparecem todo mês automaticamente (jan-dez).
            </p>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={type === "expense" ? "Ex: Aluguel, Netflix, TV Samsung" : "Ex: Salário, Freelance"}
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Valor (R$) {recurrence === "installment" && "por parcela"}
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0,00"
            />
          </div>

          {/* Installments */}
          {recurrence === "installment" && (
            <div>
              <label htmlFor="installments" className="text-sm font-medium text-gray-700">
                Número de parcelas
              </label>
              <input
                id="installments"
                type="number"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                required
                min="2"
                max="72"
                className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Start month/year - for fixed and installment */}
          {(recurrence === "fixed" || recurrence === "installment" || type === "income") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Mês início</label>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(parseInt(e.target.value))}
                  className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ano</label>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            {recurrence === "fixed" || type === "income"
              ? "Adicionar (fixa mensal)"
              : recurrence === "installment"
              ? `Adicionar (${installments}x)`
              : "Adicionar"
            }
          </button>
        </form>
      </div>
    </div>
  );
}
