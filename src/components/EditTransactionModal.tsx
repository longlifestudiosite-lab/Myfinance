"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactions";

interface EditTransactionModalProps {
  transaction: Transaction;
  onSave: (id: string, updates: { description: string; amount: number; category: string }) => void;
  onClose: () => void;
}

const CATEGORIES = [
  "alimentação", "transporte", "moradia", "saúde", "educação",
  "lazer", "vestuário", "assinaturas", "salário", "freelance",
  "investimentos", "outros",
];

export function EditTransactionModal({ transaction, onSave, onClose }: EditTransactionModalProps) {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !description.trim()) return;
    onSave(transaction.id, {
      description: description.trim(),
      amount: numAmount,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Editar</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Fechar">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label htmlFor="edit-amount" className="text-sm font-medium text-gray-700">Valor (R$)</label>
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
          <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
