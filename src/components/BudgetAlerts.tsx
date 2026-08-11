"use client";

import { useState } from "react";
import { AlertTriangle, Bell, Plus, Trash2 } from "lucide-react";
import type { BudgetAlert } from "@/hooks/useBudgetAlerts";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const CATEGORIES = [
  "alimentação",
  "transporte",
  "moradia",
  "saúde",
  "educação",
  "lazer",
  "vestuário",
  "outros",
];

interface BudgetAlertsProps {
  alerts: BudgetAlert[];
  onSetLimit: (category: string, amount: number) => void;
  onRemoveLimit: (category: string) => void;
  limits: { id: string; category: string; limit_amount: number }[];
}

export function BudgetAlerts({
  alerts,
  onSetLimit,
  onRemoveLimit,
  limits,
}: BudgetAlertsProps) {
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newAmount, setNewAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmount);
    if (amount > 0) {
      onSetLimit(newCategory, amount);
      setNewAmount("");
      setShowForm(false);
    }
  };

  const exceededAlerts = alerts.filter((a) => a.exceeded);
  const warningAlerts = alerts.filter(
    (a) => !a.exceeded && a.percentage >= 80
  );

  return (
    <div className="space-y-3">
      {/* Exceeded alerts */}
      {exceededAlerts.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700">
              Limite ultrapassado!
            </span>
          </div>
          {exceededAlerts.map((alert) => (
            <p key={alert.category} className="text-xs text-red-600 capitalize">
              {alert.category}: {formatCurrency(alert.spent)} de{" "}
              {formatCurrency(alert.limit)} ({alert.percentage.toFixed(0)}%)
            </p>
          ))}
        </div>
      )}

      {/* Warning alerts */}
      {warningAlerts.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">
              Atenção
            </span>
          </div>
          {warningAlerts.map((alert) => (
            <p key={alert.category} className="text-xs text-yellow-700 capitalize">
              {alert.category}: {alert.percentage.toFixed(0)}% do limite usado
            </p>
          ))}
        </div>
      )}

      {/* Limits list */}
      {limits.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Limites configurados
          </h3>
          <div className="space-y-2">
            {limits.map((limit) => {
              const alert = alerts.find((a) => a.category === limit.category);
              return (
                <div
                  key={limit.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm capitalize text-gray-700">
                      {limit.category}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatCurrency(limit.limit_amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert && (
                      <span
                        className={`text-xs font-medium ${
                          alert.exceeded
                            ? "text-red-600"
                            : alert.percentage >= 80
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {alert.percentage.toFixed(0)}%
                      </span>
                    )}
                    <button
                      onClick={() => onRemoveLimit(limit.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      aria-label={`Remover limite de ${limit.category}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add limit form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Limite em R$"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            min="1"
            step="0.01"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 text-sm">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full card flex items-center justify-center gap-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar limite
        </button>
      )}
    </div>
  );
}
