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
  const [recurrence, setRecurrence] = useState<"fixed" | "installment">("fixed");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("outros");
  const [installments, setInstallments] = useState("12");
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [startYear, setStartYear] = useState(now.getFullYear());

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !description.trim()) return;

    onSubmit({
      type,
      recurrence,
      amount: numAmount,
      description: description.trim(),
      category,
      installments_total: recurrence === "installment" ? parseInt(installments) : undefined,
      start_month: recurrence === "fixed" ? 1 : startMonth,
      start_year: recurrence === "fixed" ? startYear : startYear,
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
          {/* Type toggle: Despesa / Entrada */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setType("expense"); setCategory("outros"); }}
              className={`py-2.5 text-sm font-medium rounded-lg transition-colors ${
                type === "expense"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              💸 Despesa
            </button>
            <button
              type="button"
              onClick={() => { setType("income"); setCategory("salário"); }}
              className={`py-2.5 text-sm font-medium rounded-lg transition-colors ${
                type === "income"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              💰 Entrada
            </button>
          </div>

          {/* Recurrence type: Fixa Anual / Parcelas Definidas */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tipo de lançamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setRecurrence("fixed"); setInstallments("12"); }}
                className={`py-3 px-3 text-sm font-medium rounded-xl border-2 transition-all ${
                  recurrence === "fixed"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-base mb-0.5">📅</div>
                <div className="font-semibold">Fixa Anual</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Jan a Dez (12 meses)</div>
              </button>
              <button
                type="button"
                onClick={() => { setRecurrence("installment"); setInstallments(""); }}
                className={`py-3 px-3 text-sm font-medium rounded-xl border-2 transition-all ${
                  recurrence === "installment"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-base mb-0.5">🔢</div>
                <div className="font-semibold">Parcelas Definidas</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Qtd e data de início</div>
              </button>
            </div>
          </div>

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
              placeholder={type === "expense" ? "Ex: Parcela Casa, Netflix, Conserto Carro" : "Ex: Salário, Comissão, Mensalidade"}
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Valor mensal (R$)
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

          {/* Installments count - only for Parcelas Definidas */}
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
                placeholder="Ex: 10"
              />
            </div>
          )}

          {/* Start date - only for Parcelas Definidas */}
          {recurrence === "installment" && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Data de início do pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Fixa Anual info */}
          {recurrence === "fixed" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700">
                📌 <strong>Fixa Anual</strong>: este valor será contabilizado todo mês, de Janeiro a Dezembro.
              </p>
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
          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            {recurrence === "fixed"
              ? `Adicionar ${type === "expense" ? "despesa" : "entrada"} fixa anual`
              : `Adicionar em ${installments || "?"} parcelas`
            }
          </button>
        </form>
      </div>
    </div>
  );
}
