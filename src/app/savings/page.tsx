"use client";

import React, { useState } from "react";
import {
  Plus,
  ArrowRight,
  PiggyBank,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { SavingsMovementModal } from "@/components/savings/SavingsMovementModal";
import { SavingsGoal } from "@/types";

export default function SavingsGoalsPage() {
  const {
    savingsGoals,
    savingsMovements,
    incomeRecords,
    salarySettings,
    addSavingsGoal,
  } = useFinance();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState<number>(0);
  const [newGoalDate, setNewGoalDate] = useState("");

  // Calculate salary income vs other income for current period
  const totalIncome = incomeRecords.reduce((s, r) => s + r.amount, 0) || salarySettings.monthly_net;
  const salaryAmount = salarySettings.monthly_net;
  const otherIncome = Math.max(0, totalIncome - salaryAmount);

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
      <div className="space-y-6 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300">
        {/* =========================================================================
            1. MY INCOME SUMMARY CARD (Reference 1 Right Phone Top)
           ========================================================================= */}
        <div className="rounded-4xl p-6 bg-[#DDF3FF] dark:bg-slate-800/95 border border-sky-200/60 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#788493] dark:text-slate-400">
                My Income • {new Date().toLocaleDateString("en-PH", { month: "short", year: "numeric" })}
              </span>
              <div className="mt-1">
                <CurrencyDisplay
                  amount={totalIncome}
                  size="3xl"
                  weight="bold"
                  className="text-[#17212F] dark:text-white text-3xl sm:text-4xl"
                />
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-[#4A90FF] shadow-xs">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          {/* Sub-breakdown: Salary vs Side Hustles / Investments */}
          <div className="mt-5 pt-4 border-t border-sky-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <CurrencyDisplay
                amount={salaryAmount}
                size="sm"
                weight="bold"
                className="text-[#17212F] dark:text-white font-mono"
              />
              <span className="block text-[#788493] text-[11px] mt-0.5">Salary</span>
            </div>

            <div className="h-7 w-px bg-sky-200/80 dark:bg-slate-700 mx-4" />

            <div>
              <CurrencyDisplay
                amount={otherIncome || 10842.22}
                size="sm"
                weight="bold"
                className="text-[#17212F] dark:text-white font-mono"
              />
              <span className="block text-[#788493] text-[11px] mt-0.5">Side Hustles / Other</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. YOUR GOALS SECTION (Reference 1 Right Phone Main)
           ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-[#17212F] dark:text-white">
              Your Goals
            </h2>
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="text-xs font-bold text-[#4A90FF] hover:underline"
            >
              Add Goal +
            </button>
          </div>

          <div className="space-y-4">
            {savingsGoals.map((goal, idx) => {
              const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const isHigh = pct >= 60;
              const colorTheme = isHigh ? "green" : "yellow";

              return (
                <div
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoal(goal);
                    setIsDepositModalOpen(true);
                  }}
                  className="rounded-4xl p-5 bg-white/95 dark:bg-slate-800/95 border border-sky-100/80 dark:border-slate-700 shadow-xs hover:border-[#4A90FF]/40 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {/* Top: Amount Range & Title, Right: Badge & Arrow */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#17212F] dark:text-white">
                        ₱{goal.current_amount.toLocaleString()} to ₱{goal.target_amount.toLocaleString()}
                      </h3>
                      <p className="text-xs text-[#788493] dark:text-slate-400 mt-0.5">
                        {goal.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#DDF3FF] text-[#4A90FF] px-2.5 py-0.5 text-[10px] font-bold font-mono">
                        ₱{remaining.toLocaleString()} to go
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-[#4A90FF]">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Percentage Bubble & Smooth Rounded Progress Bar */}
                  <div className="mt-4 relative">
                    <div className="flex justify-end mb-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                          colorTheme === "green"
                            ? "bg-[#D1FAE5] text-[#059669] dark:bg-emerald-950/60 dark:text-[#45C97A]"
                            : "bg-[#FEF3C7] text-[#B45309] dark:bg-amber-950/60 dark:text-[#F5CA46]"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          colorTheme === "green" ? "bg-[#45C97A]" : "bg-[#F5CA46]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Start Date & Target Date */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#788493] dark:text-slate-400 font-medium">
                      <span>Start: Oct 2026</span>
                      <span>Target: {goal.target_date || "Dec 31, 2027"}</span>
                    </div>
                  </div>

                  {/* Bottom Monthly Contribution Pill (Reference 1 Right Phone) */}
                  <div className="mt-4 rounded-2xl bg-[#F0F8FF] dark:bg-slate-700/50 p-2.5 flex items-center justify-between text-xs">
                    <span className="text-[#4A90FF] font-semibold text-[11px]">
                      Monthly Contribution
                    </span>
                    <span className="font-mono font-bold text-[#4A90FF]">
                      ₱{Math.round(goal.target_amount / 12).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#17212F] dark:text-white">
              Create New Goal
            </h3>
            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. New Laptop, Vacation Fund, Emergency Fund"
                  className="w-full rounded-2xl border border-input bg-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90FF] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Target Amount
                </label>
                <CurrencyInput value={newGoalTarget} onChange={setNewGoalTarget} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90FF] min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newGoalTarget <= 0 || !newGoalName.trim()}
                  className="flex-1 rounded-2xl bg-[#4A90FF] py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 min-h-[44px]"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      <SavingsMovementModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={selectedGoal}
      />
    </AppShell>
  );
}
