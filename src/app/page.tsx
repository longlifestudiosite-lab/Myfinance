"use client";

import { VoiceButton } from "@/components/VoiceButton";
import { TransactionList } from "@/components/TransactionList";
import { BalanceSummary } from "@/components/BalanceSummary";
import { useTransactions } from "@/hooks/useTransactions";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseVoiceCommand } from "@/lib/parseVoiceCommand";
import { Mic } from "lucide-react";

export default function HomePage() {
  const { transactions, addTransaction, summary, loading } = useTransactions();
  const { isListening, transcript, startListening, stopListening } =
    useSpeechRecognition({
      onResult: (text) => {
        const parsed = parseVoiceCommand(text);
        if (parsed) {
          addTransaction(parsed);
        }
      },
    });

  return (
    <main className="max-w-md mx-auto px-4 py-6 pb-32 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">MyFinance</h1>
        <p className="text-sm text-gray-500">Controle financeiro por voz</p>
      </header>

      {/* Balance */}
      <BalanceSummary summary={summary} loading={loading} />

      {/* Voice feedback */}
      {transcript && (
        <div className="card mt-4 bg-primary-50 border-primary-200">
          <p className="text-sm text-primary-800">
            <Mic className="inline w-4 h-4 mr-1" />
            &quot;{transcript}&quot;
          </p>
        </div>
      )}

      {/* Transactions */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Últimas transações</h2>
        <TransactionList transactions={transactions} loading={loading} />
      </section>

      {/* Voice FAB */}
      <VoiceButton
        isListening={isListening}
        onStart={startListening}
        onStop={stopListening}
      />
    </main>
  );
}
