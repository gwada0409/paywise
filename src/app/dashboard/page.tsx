"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Receipt,
  Sparkles,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import { PaydayPlannerModal } from "@/components/payday/PaydayPlannerModal";
import { IncomeFormModal } from "@/components/income/IncomeFormModal";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { SavingsMovementModal } from "@/components/savings/SavingsMovementModal";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const {
    spendableBreakdown,
    nextPayday,
    budgetSummary,
    thresholdAlerts,
    salarySettings,
    transactions,
    bills,
    savingsGoals,
    loans,
    aiPreferences,
    financialContext,
  } = useFinance();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isPaydayPlannerOpen, setIsPaydayPlannerOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);

  // Daily spendable money calculation until next payday
  const daysRemaining = Math.max(1, nextPayday.daysRemaining);
  const dailySpendable = Math.round(spendableBreakdown.availableToSpend / daysRemaining);

  // Upcoming unpaid bills
  const upcomingBills = bills.filter((b) => b.status !== "paid").slice(0, 3);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Welcome & Threshold Alert Banner */}
        {thresholdAlerts.length > 0 && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Budget Threshold Alert
                </h4>
                <p className="mt-0.5 text-xs text-foreground/90">
                  {thresholdAlerts[0].message}
                </p>
              </div>
              <Link
                href="/budget"
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
              >
                View
              </Link>
            </div>
          </div>
        )}

        {/* HERO CARD: Available to Spend */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>True Available Balance</span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available to Spend (Until Next Payday)
                </p>
                <div className="mt-1">
                  <CurrencyDisplay
                    amount={spendableBreakdown.availableToSpend}
                    size="4xl"
                    weight="bold"
                  />
                </div>
              </div>

              {/* Sub-breakdown: Liquid Cash vs Reserved Bills */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Total Liquid Cash: </span>
                  <CurrencyDisplay
                    amount={spendableBreakdown.liquidCashTotal}
                    size="xs"
                    weight="semibold"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Reserved Unpaid Bills: </span>
                  <span className="font-mono font-semibold text-amber-600">
                    -₱{spendableBreakdown.reservedBillsTotal.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground">Flexible Daily Rate: </span>
                  <span className="font-mono font-bold text-foreground">
                    ₱{dailySpendable.toLocaleString()} / day
                  </span>
                </div>
              </div>
            </div>

            {/* Next Payday Countdown Badge */}
            <div className="rounded-2xl border border-border bg-background/80 backdrop-blur-xs p-4 sm:min-w-[220px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Next Payday</span>
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">
                  {nextPayday.daysRemaining}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  days to go
                </span>
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{nextPayday.label}</span>
                <span className="block mt-0.5">
                  Expected: ₱{nextPayday.expectedAmount.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPaydayPlannerOpen(true)}
                className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
              >
                Plan This Payday
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setIsAddTxOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-3 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>

            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 px-3 text-xs font-bold text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px]"
            >
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Record Salary
            </button>

            <button
              onClick={() => setIsSavingsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 px-3 text-xs font-bold text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px]"
            >
              <PiggyBank className="h-4 w-4 text-emerald-600" />
              Save Money
            </button>

            <button
              onClick={() => setIsBillModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 px-3 text-xs font-bold text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px]"
            >
              <Receipt className="h-4 w-4 text-amber-600" />
              Add Bill
            </button>
          </div>
        </div>

        {/* 50/30/20 BUDGET PROGRESS CARDS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Budget Allocation (50 / 30 / 20)
            </h3>
            <Link
              href="/budget"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              Details
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Needs Card */}
            <div className="rounded-2xl border border-blue-500/20 bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                  Needs (50%)
                </span>
                <span className="font-mono text-xs font-bold text-blue-600">
                  {budgetSummary.percent_needs}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <CurrencyDisplay amount={budgetSummary.spent_needs} size="lg" weight="bold" />
                <span className="text-xs text-muted-foreground font-mono">
                  of ₱{budgetSummary.allocated_needs.toLocaleString()}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-blue-500/15 overflow-hidden">
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
              <p className="mt-2 text-[11px] text-muted-foreground">
                Remaining: <span className="font-semibold text-foreground">₱{budgetSummary.remaining_needs.toLocaleString()}</span>
              </p>
            </div>

            {/* Wants Card */}
            <div className="rounded-2xl border border-purple-500/20 bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">
                  Wants (30%)
                </span>
                <span className="font-mono text-xs font-bold text-purple-600">
                  {budgetSummary.percent_wants}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <CurrencyDisplay amount={budgetSummary.spent_wants} size="lg" weight="bold" />
                <span className="text-xs text-muted-foreground font-mono">
                  of ₱{budgetSummary.allocated_wants.toLocaleString()}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-purple-500/15 overflow-hidden">
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
              <p className="mt-2 text-[11px] text-muted-foreground">
                Remaining: <span className="font-semibold text-foreground">₱{budgetSummary.remaining_wants.toLocaleString()}</span>
              </p>
            </div>

            {/* Savings Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Savings (20%)
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600">
                  {budgetSummary.percent_savings}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <CurrencyDisplay amount={budgetSummary.saved_amount} size="lg" weight="bold" />
                <span className="text-xs text-muted-foreground font-mono">
                  target ₱{budgetSummary.allocated_savings.toLocaleString()}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-emerald-500/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${Math.min(100, budgetSummary.percent_savings)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Saved so far this cycle
              </p>
            </div>
          </div>
        </div>

        {/* AI FINANCIAL INSIGHT BANNER */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-card to-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  PayWise AI Financial Coach
                  <span className="rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 font-bold">
                    Gemini
                  </span>
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {budgetSummary.percent_needs > 80
                    ? `You've used ${budgetSummary.percent_needs}% of your Needs budget. With ₱${spendableBreakdown.availableToSpend.toLocaleString()} remaining until payday on ${nextPayday.isoDate}, keep daily spending under ₱${dailySpendable.toLocaleString()}.`
                    : `Your finances are in good health this cycle! You have ₱${spendableBreakdown.availableToSpend.toLocaleString()} spendable across the next ${nextPayday.daysRemaining} days after reserving upcoming bills.`}
                </p>
              </div>
            </div>

            <Link
              href="/ai"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all shrink-0 min-h-[38px]"
            >
              Ask Gemini
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* TWO-COLUMN GRID: Upcoming Bills & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Bills */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-600" />
                Upcoming Unpaid Bills
              </h3>
              <Link
                href="/bills"
                className="text-xs font-bold text-primary hover:underline"
              >
                View All ({bills.filter((b) => b.status !== "paid").length})
              </Link>
            </div>

            <div className="mt-3 divide-y divide-border/60">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">Due on Day {bill.due_day} • {bill.category}</p>
                  </div>
                  <CurrencyDisplay amount={bill.amount} size="sm" weight="bold" />
                </div>
              ))}

              {upcomingBills.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  All bills for this cycle are paid!
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Recent Activity
              </h3>
              <Link
                href="/transactions"
                className="text-xs font-bold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="mt-3 divide-y divide-border/60">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.date)} • {tx.payment_method.toUpperCase()} • {tx.category}
                    </p>
                  </div>
                  <CurrencyDisplay
                    amount={tx.amount}
                    type={tx.type === "income" ? "income" : "expense"}
                    size="sm"
                    weight="bold"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
      <PaydayPlannerModal
        isOpen={isPaydayPlannerOpen}
        onClose={() => setIsPaydayPlannerOpen(false)}
      />
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />
      <BillFormModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
      />
      <SavingsMovementModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
      />
    </AppShell>
  );
}
