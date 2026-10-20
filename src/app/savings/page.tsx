"use client";

import React, { useState } from "react";
import {
  PiggyBank,
  Plus,
  ArrowDownRight,
  Shield,
  Plane,
  Laptop,
  Heart,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { SavingsMovementModal } from "@/components/savings/SavingsMovementModal";
import { formatDate } from "@/lib/utils";
import { SavingsGoal } from "@/types";

export default function SavingsPage() {
  const {
    savingsGoals,
    savingsMovements,
    addSavingsGoal,
  } = useFinance();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState<number>(0);
  const [newGoalDate, setNewGoalDate] = useState("");

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || newGoalTarget <= 0) return;

    addSavingsGoal({
      name: newGoalName.trim(),
      target_amount: newGoalTarget,
      target_date: newGoalDate || undefined,
      color: "emerald",
      icon: "piggy-bank",
    });

    setNewGoalName("");
    setNewGoalTarget(0);
    setNewGoalDate("");
    setIsAddGoalOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <PiggyBank className="h-7 w-7 text-emerald-600" />
              Savings & Goal Tracker
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Build your Emergency Fund and allocate 20% of each payday toward your targets.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setSelectedGoal(savingsGoals[0] || null);
                setIsDepositModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              <ArrowDownRight className="h-4 w-4" />
              Deposit to Goal
            </button>
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              New Goal
            </button>
          </div>
        </div>

        {/* Overall Savings Progress Summary */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Accumulated Savings
              </p>
              <div className="mt-1">
                <CurrencyDisplay amount={totalSaved} size="3xl" weight="bold" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                across {savingsGoals.length} goals (Target: ₱{totalTarget.toLocaleString()})
              </p>
            </div>

            <div className="sm:text-right">
              <span className="font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {overallProgress}%
              </span>
              <p className="text-xs text-muted-foreground">Overall Goal Completion</p>
            </div>
          </div>

          <div className="mt-4 h-3 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);

            return (
              <div
                key={goal.id}
                className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-600">
                      {pct}%
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-foreground">{goal.name}</h3>
                  {goal.target_date && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target by {formatDate(goal.target_date)}
                    </p>
                  )}

                  <div className="mt-4">
                    <CurrencyDisplay amount={goal.current_amount} size="xl" weight="bold" />
                    <span className="text-xs text-muted-foreground font-mono block">
                      of ₱{goal.target_amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Remaining: <span className="font-semibold text-foreground font-mono">₱{remaining.toLocaleString()}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsDepositModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 active:scale-95 transition-all min-h-[44px]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Deposit / Transfer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Savings Movement History */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-base font-bold text-foreground mb-4">Savings Activity History</h2>

          <div className="divide-y divide-border/60">
            {savingsMovements.map((sm) => {
              const goal = savingsGoals.find((g) => g.id === sm.goal_id);
              return (
                <div key={sm.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {sm.type === "deposit" ? "Deposit to" : "Withdrawal from"} {goal?.name || "Savings Goal"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sm.date)} {sm.notes && `• ${sm.notes}`}
                      </p>
                    </div>
                  </div>

                  <CurrencyDisplay
                    amount={sm.amount}
                    type={sm.type === "deposit" ? "income" : "expense"}
                    size="sm"
                    weight="bold"
                  />
                </div>
              );
            })}

            {savingsMovements.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No savings deposits logged yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">Create New Savings Goal</h3>
            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. Wedding Fund, Car Downpayment"
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Target Amount
                </label>
                <CurrencyInput value={newGoalTarget} onChange={setNewGoalTarget} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newGoalTarget <= 0 || !newGoalName.trim()}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50 min-h-[44px]"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SavingsMovementModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={selectedGoal}
      />
    </AppShell>
  );
}
