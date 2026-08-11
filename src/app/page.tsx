"use client";

import { useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { VoiceButton } from "@/components/VoiceButton";
import { TransactionList } from "@/components/TransactionList";
import { BalanceSummary } from "@/components/BalanceSummary";
import { Dashboard } from "@/components/Dashboard";
import { BudgetAlerts } from "@/components/BudgetAlerts";
import { BottomNav } from "@/components/BottomNav";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseVoiceCommand } from "@/lib/parseVoiceCommand";
import { Mic } from "lucide-react";

type Tab = "home" | "dashboard" | "alerts";

export default function HomePage() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { transactions, addTransaction, summary, categorySummary, loading } =
    useTransactions(user?.id);
  const { alerts, limits, setLimit, removeLimit } = useBudgetAlerts(
    user?.id,
    categorySummary
  );
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const { isListening, transcript, startListening, stopListening } =
    useSpeechRecognition({
      onResult: (text) => {
        const parsed = parseVoiceCommand(text);
        if (parsed) {
          addTransaction(parsed);
        }
      },
    });

  // Show login screen if not authenticated
  if (!user && !authLoading) {
    return <LoginScreen onLogin={signInWithGoogle} loading={authLoading} />;
  }

  // Loading state
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-6 pb-24 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-700">MyFinance</h1>
          <p className="text-sm text-gray-500">
            Olá, {user?.user_metadata?.full_name?.split(" ")[0] || "usuário"}
          </p>
        </div>
        <UserMenu
          avatarUrl={user?.user_metadata?.avatar_url}
          onSignOut={signOut}
        />
      </header>

      {/* Tab content */}
      {activeTab === "home" && (
        <>
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

          {/* Budget alerts (exceeded only) */}
          {alerts.some((a) => a.exceeded) && (
            <div className="mt-4">
              <BudgetAlerts
                alerts={alerts.filter((a) => a.exceeded)}
                onSetLimit={setLimit}
                onRemoveLimit={(id) => removeLimit(id)}
                limits={[]}
              />
            </div>
          )}

          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Últimas transações</h2>
            <TransactionList transactions={transactions} loading={loading} />
          </section>
        </>
      )}

      {activeTab === "dashboard" && (
        <>
          <BalanceSummary summary={summary} loading={loading} />
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Dashboard</h2>
            <Dashboard
              categorySummary={categorySummary}
              totalExpenses={summary.expenses}
            />
          </section>
        </>
      )}

      {activeTab === "alerts" && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Limites e Alertas</h2>
          <BudgetAlerts
            alerts={alerts}
            onSetLimit={setLimit}
            onRemoveLimit={(id) => removeLimit(id)}
            limits={limits}
          />
        </section>
      )}

      {/* Voice FAB - only on home tab */}
      {activeTab === "home" && (
        <VoiceButton
          isListening={isListening}
          onStart={startListening}
          onStop={stopListening}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
