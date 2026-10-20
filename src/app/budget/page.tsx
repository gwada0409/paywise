"use client";

import React, { useState } from "react";
import {
  PieChart,
  Edit2,
  Check,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingDown,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { toast } from "sonner";
import { roundMoney } from "@/lib/utils";

export default function BudgetPage() {
  const {
    budgetRules,
    updateBudgetRules,
    budgetSummary,
    thresholdAlerts,
    salarySettings,
    transactions,
  } = useFinance();

  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "payday">("monthly");

  const [needsP, setNeedsP] = useState(budgetRules.needs_percent);
  const [wantsP, setWantsP] = useState(budgetRules.wants_percent);
  const [savingsP, setSavingsP] = useState(budgetRules.savings_percent);

  const totalP = needsP + wantsP + savingsP;

  const handleSave = () => {
    if (totalP !== 100) {
      toast.error("Allocation must sum to exactly 100%");
      return;
    }

    updateBudgetRules({
      needs_percent: needsP,
      wants_percent: wantsP,
      savings_percent: savingsP,
    });
    setIsEditing(false);
    toast.success("Budget rules updated.");
  };

  const multiplier = viewMode === "payday" ? 0.5 : 1;
  const baseSalary = salarySettings.monthly_net * multiplier;

  const allocatedNeeds = roundMoney(budgetSummary.allocated_needs * multiplier);
  const allocatedWants = roundMoney(budgetSummary.allocated_wants * multiplier);
  const allocatedSavings = roundMoney(budgetSummary.allocated_savings * multiplier);

  // Group spending by category
  const needsByCategory: Record<string, number> = {};
  const wantsByCategory: Record<string, number> = {};

  for (const t of transactions) {
    if (t.type === "need" || t.type === "bill_payment") {
      needsByCategory[t.category] = (needsByCategory[t.category] || 0) + t.amount;
    } else if (t.type === "want") {
      wantsByCategory[t.category] = (wantsByCategory[t.category] || 0) + t.amount;
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <PieChart className="h-7 w-7 text-purple-600" />
              Budget Management (50/30/20)
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Monitor your Needs, Wants, and Savings spending limits and overspending alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Monthly vs Per-payday toggle */}
            <div className="flex rounded-xl border border-border bg-card p-1">
              <button
                onClick={() => setViewMode("monthly")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "monthly"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode("payday")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "payday"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Per Payday
              </button>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 active:scale-95"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditing ? "Cancel" : "Edit Allocation"}
            </button>
          </div>
        </div>

        {/* Threshold Alert Warning Banner */}
        {thresholdAlerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-4 flex items-start gap-3 ${
              alert.severity === "danger"
                ? "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                : alert.severity === "warning"
                ? "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400"
            }`}
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {alert.percentage >= 100 ? "Budget Depleted (100%)" : `${alert.percentage}% Limit Warning`}
              </p>
              <p className="mt-0.5 text-xs text-foreground/90">{alert.message}</p>
            </div>
          </div>
        ))}

        {/* Custom Allocation Editor */}
        {isEditing && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-md space-y-4">
            <h2 className="text-base font-bold text-foreground">Customize Allocation Percentages</h2>
            <p className="text-xs text-muted-foreground">Adjust percentages to match your living situation.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <span className="text-xs font-bold text-blue-600">Needs (%)</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={needsP}
                  onChange={(e) => setNeedsP(Number(e.target.value))}
                  className="mt-2 w-full font-mono text-2xl font-bold bg-transparent text-foreground focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <span className="text-xs font-bold text-purple-600">Wants (%)</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={wantsP}
                  onChange={(e) => setWantsP(Number(e.target.value))}
                  className="mt-2 w-full font-mono text-2xl font-bold bg-transparent text-foreground focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <span className="text-xs font-bold text-emerald-600">Savings (%)</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={savingsP}
                  onChange={(e) => setSavingsP(Number(e.target.value))}
                  className="mt-2 w-full font-mono text-2xl font-bold bg-transparent text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className={`text-xs font-bold ${totalP === 100 ? "text-emerald-600" : "text-rose-600"}`}>
                Total: {totalP}% {totalP !== 100 && "(Must equal 100%)"}
              </span>

              <button
                onClick={handleSave}
                disabled={totalP !== 100}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50 min-h-[44px]"
              >
                <Check className="h-4 w-4" />
                Save Allocations
              </button>
            </div>
          </div>
        )}

        {/* 3 Main Pillars Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* NEEDS */}
          <div className="rounded-3xl border border-blue-500/20 bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Needs ({budgetRules.needs_percent}%)
              </span>
              <span className={`font-mono text-xs font-bold ${
                budgetSummary.percent_needs >= 100 ? "text-rose-600" : "text-blue-600"
              }`}>
                {budgetSummary.percent_needs}% Used
              </span>
            </div>

            <div className="mt-3">
              <CurrencyDisplay amount={budgetSummary.spent_needs} size="2xl" weight="bold" />
              <p className="text-xs text-muted-foreground mt-0.5">
                of ₱{allocatedNeeds.toLocaleString()} {viewMode === "monthly" ? "monthly budget" : "payday budget"}
              </p>
            </div>

            <div className="mt-3 h-2.5 w-full rounded-full bg-blue-500/15 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetSummary.percent_needs >= 100
                    ? "bg-rose-500"
                    : budgetSummary.percent_needs >= 80
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{ width: `${Math.min(100, budgetSummary.percent_needs)}%` }}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining:</span>
                <CurrencyDisplay amount={allocatedNeeds - budgetSummary.spent_needs} size="sm" weight="bold" />
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Active Needs Spending:
                </span>
                {Object.entries(needsByCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between text-muted-foreground py-0.5">
                    <span>{cat}</span>
                    <span className="font-mono text-foreground">₱{amt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WANTS */}
          <div className="rounded-3xl border border-purple-500/20 bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Wants ({budgetRules.wants_percent}%)
              </span>
              <span className={`font-mono text-xs font-bold ${
                budgetSummary.percent_wants >= 100 ? "text-rose-600" : "text-purple-600"
              }`}>
                {budgetSummary.percent_wants}% Used
              </span>
            </div>

            <div className="mt-3">
              <CurrencyDisplay amount={budgetSummary.spent_wants} size="2xl" weight="bold" />
              <p className="text-xs text-muted-foreground mt-0.5">
                of ₱{allocatedWants.toLocaleString()} {viewMode === "monthly" ? "monthly budget" : "payday budget"}
              </p>
            </div>

            <div className="mt-3 h-2.5 w-full rounded-full bg-purple-500/15 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetSummary.percent_wants >= 100
                    ? "bg-rose-500"
                    : budgetSummary.percent_wants >= 80
                    ? "bg-amber-500"
                    : "bg-purple-600"
                }`}
                style={{ width: `${Math.min(100, budgetSummary.percent_wants)}%` }}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining:</span>
                <CurrencyDisplay amount={allocatedWants - budgetSummary.spent_wants} size="sm" weight="bold" />
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Active Wants Spending:
                </span>
                {Object.entries(wantsByCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between text-muted-foreground py-0.5">
                    <span>{cat}</span>
                    <span className="font-mono text-foreground">₱{amt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SAVINGS */}
          <div className="rounded-3xl border border-emerald-500/20 bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Savings Target ({budgetRules.savings_percent}%)
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600">
                {budgetSummary.percent_savings}% Reached
              </span>
            </div>

            <div className="mt-3">
              <CurrencyDisplay amount={budgetSummary.saved_amount} size="2xl" weight="bold" />
              <p className="text-xs text-muted-foreground mt-0.5">
                target ₱{allocatedSavings.toLocaleString()} {viewMode === "monthly" ? "monthly target" : "payday target"}
              </p>
            </div>

            <div className="mt-3 h-2.5 w-full rounded-full bg-emerald-500/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${Math.min(100, budgetSummary.percent_savings)}%` }}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Remaining:</span>
                <CurrencyDisplay
                  amount={Math.max(0, allocatedSavings - budgetSummary.saved_amount)}
                  size="sm"
                  weight="bold"
                />
              </div>

              <div className="pt-2 text-muted-foreground">
                <p>Transfer money into your savings goals to count towards this target without creating consumption expenses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
