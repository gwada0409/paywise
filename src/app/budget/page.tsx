"use client";

import React, { useState } from "react";
import {
  PieChart,
  Edit2,
  Check,
  AlertTriangle,
  ChevronRight,
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
  const allocatedNeeds = roundMoney(budgetSummary.allocated_needs * multiplier);
  const allocatedWants = roundMoney(budgetSummary.allocated_wants * multiplier);
  const allocatedSavings = roundMoney(budgetSummary.allocated_savings * multiplier);

  // Group spending
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
      <div className="space-y-6 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17212F] dark:text-white">
              Budget Management (50/30/20)
            </h1>
            <p className="text-xs text-[#788493] dark:text-slate-400 mt-0.5">
              Keep Needs, Wants, and Savings within targets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full glass-pill p-1">
              <button
                onClick={() => setViewMode("monthly")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  viewMode === "monthly"
                    ? "bg-[#4A90FF] text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode("payday")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  viewMode === "payday"
                    ? "bg-[#4A90FF] text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Per Payday
              </button>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 rounded-full glass-pill px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white/90 active:scale-95"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* Threshold Alert Warning Banner */}
        {thresholdAlerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-3xl p-4 flex items-start gap-3 ${
              alert.severity === "danger"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider">{alert.message}</p>
            </div>
          </div>
        ))}

        {/* Custom Allocation Editor */}
        {isEditing && (
          <div className="rounded-4xl p-6 bg-white/95 dark:bg-slate-800/95 border border-sky-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#17212F] dark:text-white">
              Adjust Allocation Percentages
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#DDF3FF] p-3 text-center">
                <span className="text-xs font-bold text-ref-blue">Needs (%)</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={needsP}
                  onChange={(e) => setNeedsP(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent tabular-nums text-center text-xl font-extrabold text-ref-navy focus:outline-none"
                />
              </div>

              <div className="rounded-2xl bg-amber-50 p-3 text-center">
                <span className="text-xs font-bold text-amber-700">Wants (%)</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={wantsP}
                  onChange={(e) => setWantsP(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent tabular-nums text-center text-xl font-extrabold text-ref-navy focus:outline-none"
                />
              </div>

              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <span className="text-xs font-bold text-ref-green">Savings (%)</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={savingsP}
                  onChange={(e) => setSavingsP(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent tabular-nums text-center text-xl font-extrabold text-ref-navy focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className={`text-xs font-bold ${totalP === 100 ? "text-ref-green" : "text-rose-500"}`}>
                Total: {totalP}% {totalP !== 100 && "(Must equal 100%)"}
              </span>

              <button
                onClick={handleSave}
                disabled={totalP !== 100}
                className="inline-flex items-center gap-1.5 rounded-full bg-ref-blue px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-ref-blue/90 disabled:opacity-50 transition-transform active:scale-95"
              >
                <Check className="h-4 w-4" />
                Save Allocations
              </button>
            </div>
          </div>
        )}

        {/* 3 Main Pillars Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NEEDS */}
          <div className="rounded-4xl p-5 bg-white/95 dark:bg-slate-800/95 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ref-blue">
                  Needs ({budgetRules.needs_percent}%)
                </span>
                <span className="tabular-nums text-xs font-bold text-ref-blue">
                  {budgetSummary.percent_needs}%
                </span>
              </div>

              <div className="mt-3">
                <CurrencyDisplay amount={budgetSummary.spent_needs} size="2xl" weight="bold" />
                <p className="text-[11px] text-[#788493] mt-0.5">
                  of ₱{allocatedNeeds.toLocaleString()} {viewMode === "monthly" ? "monthly budget" : "payday budget"}
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ref-blue transition-[width] duration-300"
                  style={{ width: `${Math.min(100, budgetSummary.percent_needs)}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-[#788493]">
                Remaining: <span className="font-bold text-slate-900 dark:text-white tabular-nums">₱{allocatedNeeds - budgetSummary.spent_needs}</span>
              </p>
            </div>
          </div>

          {/* WANTS */}
          <div className="rounded-4xl p-5 bg-white/95 dark:bg-slate-800/95 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700">
                  Wants ({budgetRules.wants_percent}%)
                </span>
                <span className="tabular-nums text-xs font-bold text-amber-700">
                  {budgetSummary.percent_wants}%
                </span>
              </div>

              <div className="mt-3">
                <CurrencyDisplay amount={budgetSummary.spent_wants} size="2xl" weight="bold" />
                <p className="text-[11px] text-[#788493] mt-0.5">
                  of ₱{allocatedWants.toLocaleString()} {viewMode === "monthly" ? "monthly budget" : "payday budget"}
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
                  style={{ width: `${Math.min(100, budgetSummary.percent_wants)}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-[#788493]">
                Remaining: <span className="font-bold text-slate-900 dark:text-white tabular-nums">₱{allocatedWants - budgetSummary.spent_wants}</span>
              </p>
            </div>
          </div>

          {/* SAVINGS */}
          <div className="rounded-4xl p-5 bg-white/95 dark:bg-slate-800/95 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ref-green">
                  Savings ({budgetRules.savings_percent}%)
                </span>
                <span className="tabular-nums text-xs font-bold text-ref-green">
                  {budgetSummary.percent_savings}%
                </span>
              </div>

              <div className="mt-3">
                <CurrencyDisplay amount={budgetSummary.saved_amount} size="2xl" weight="bold" />
                <p className="text-[11px] text-[#788493] mt-0.5">
                  target ₱{allocatedSavings.toLocaleString()} {viewMode === "monthly" ? "monthly target" : "payday target"}
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ref-green transition-[width] duration-300"
                  style={{ width: `${Math.min(100, budgetSummary.percent_savings)}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-[#788493]">
                Total Saved: <span className="font-bold text-slate-900 dark:text-white tabular-nums">₱{budgetSummary.saved_amount}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
