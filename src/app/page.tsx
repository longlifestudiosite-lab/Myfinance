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
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseVoiceCommand } from "@/lib/parseVoiceCommand";
import { Mic, Plus } from "lucide-react";

type Tab = "home" | "dashboard" | "alerts";

export default function HomePage() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { householdId, loading: householdLoading } = useHousehold(user?.id);
  const {
    transactions,
    allTransactions,
    addTransaction,
    addManualTransaction,
    editTransaction,
    editInstallment,
    confirmPayment,
    deleteTransaction,
    deleteAllInstallments,
    summary,
    categorySummary,
    loading,
    refetch,
  } = useTransactions(user?.id, householdId);
  const { alerts, limits, setLimit, removeLimit } = useBudgetAlerts(
    householdId,
    categorySummary
  );
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [homeSubTab, setHomeSubTab] = useState<"expenses" | "income">("expenses");
  const [showAddForm, setShowAddForm] = useState(false);

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
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  // Loading state
  if (authLoading || householdLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </main>
    );
  }

  return (
    <PullToRefresh onRefresh={refetch}>
    <main className="max-w-md mx-auto px-4 py-6 pb-24 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">MyFinance</h1>
          <p className="text-sm text-gray-500">
            Olá, {user?.email?.split("@")[0] || "usuário"}
          </p>
        </div>
        <UserMenu avatarUrl={undefined} onSignOut={signOut} />
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
            <div className="sticky top-0 z-10 bg-gray-950 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-100">Este mês</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950 border border-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {/* Sub-tabs: Saídas / Entradas */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 border border-gray-800 rounded-xl mt-3">
                <button
                  onClick={() => setHomeSubTab("expenses")}
                  className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                    homeSubTab === "expenses"
                      ? "bg-gray-800 text-red-400 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  💸 Saídas ({transactions.filter(t => t.type === "expense").length})
                </button>
                <button
                  onClick={() => setHomeSubTab("income")}
                  className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                    homeSubTab === "income"
                      ? "bg-gray-800 text-emerald-400 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  💰 Entradas ({transactions.filter(t => t.type === "income").length})
                </button>
              </div>
            </div>

            <TransactionList
              transactions={transactions.filter(t =>
                homeSubTab === "expenses" ? t.type === "expense" : t.type === "income"
              )}
              loading={loading}
              onEdit={editTransaction}
              onEditInstallment={editInstallment}
              onDelete={deleteTransaction}
              onDeleteAllInstallments={deleteAllInstallments}
              onConfirmPayment={confirmPayment}
            />
          </section>
        </>
      )}

      {activeTab === "dashboard" && (
        <section>
          <div className="sticky top-0 z-10 bg-gray-950 pb-3">
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Dashboard</h2>
          </div>
          <Dashboard allTransactions={allTransactions} />
        </section>
      )}

      {activeTab === "alerts" && (
        <section>
          <div className="sticky top-0 z-10 bg-gray-950 pb-3">
            <h2 className="text-lg font-semibold text-gray-100">Limites e Alertas</h2>
          </div>
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

      {/* Add Transaction Form Modal */}
      {showAddForm && (
        <AddTransactionForm
          onSubmit={(data) => {
            addManualTransaction(data);
            setShowAddForm(false);
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </main>
    </PullToRefresh>
  );
}
