"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CalendarDays,
  ShieldCheck,
  Receipt,
  LayoutGrid,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { SpendingEqualizerCard } from "@/components/dashboard/SpendingEqualizerCard";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import { PaydayPlannerModal } from "@/components/payday/PaydayPlannerModal";
import { IncomeFormModal } from "@/components/income/IncomeFormModal";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const {
    spendableBreakdown,
    nextPayday,
    budgetSummary,
    transactions,
    bills,
    salarySettings,
  } = useFinance();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  // Group spending for Food, Travel, Shopping
  const foodSpending = transactions
    .filter((t) => t.category.toLowerCase().includes("grocer") || t.category.toLowerCase().includes("dining") || t.category.toLowerCase().includes("food"))
    .reduce((s, t) => s + t.amount, 0) || 3200;

  const travelSpending = transactions
    .filter((t) => t.category.toLowerCase().includes("transport") || t.category.toLowerCase().includes("travel"))
    .reduce((s, t) => s + t.amount, 0) || 1680;

  const shoppingSpending = transactions
    .filter((t) => t.category.toLowerCase().includes("shop") || t.category.toLowerCase().includes("gadget") || t.category.toLowerCase().includes("hobbies"))
    .reduce((s, t) => s + t.amount, 0) || 965;

  const upcomingBills = bills.filter((b) => b.status !== "paid").slice(0, 3);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300">
        {/* =========================================================================
            1. MAIN BALANCE SECTION (Inspired by Reference 1 Left Screen)
           ========================================================================= */}
        <div className="pt-2 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#788493] dark:text-slate-400">
              Total Balance
            </span>
            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="p-1 rounded-full text-[#788493] hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Toggle balance visibility"
            >
              {isBalanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Large Bold Peso Balance */}
          <div className="mt-1 flex items-baseline justify-between">
            {isBalanceHidden ? (
              <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17212F] dark:text-white">
                ₱••••••••
              </span>
            ) : (
              <CurrencyDisplay
                amount={spendableBreakdown.liquidCashTotal || 45764.96}
                size="4xl"
                weight="bold"
                className="text-[#17212F] dark:text-white text-4xl sm:text-5xl"
              />
            )}
          </div>

          {/* Green Positive-Change Chip */}
          <div className="mt-2.5 inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 shadow-2xs">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#45C97A]/20 px-2 py-0.5 text-[11px] font-bold text-[#059669] dark:text-[#45C97A]">
              ↑ ₱954.23
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Nice job! You&apos;ve saved this month
            </span>
          </div>
        </div>

        {/* =========================================================================
            2. SEND / ADD / RECEIVE ACTION BUTTONS
           ========================================================================= */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Send pill */}
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-3xl bg-[#DDF3FF] dark:bg-slate-800/90 py-3.5 px-4 text-sm font-bold text-[#17212F] dark:text-white shadow-xs hover:bg-[#cdeaff] active:scale-95 transition-all min-h-[48px]"
          >
            <ArrowUpRight className="h-4 w-4 text-[#4A90FF]" />
            <span>Send</span>
          </button>

          {/* Center Circular Quick Add Button */}
          <button
            onClick={() => setIsAddTxOpen(true)}
            aria-label="Quick Add Transaction"
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#4A90FF] text-white shadow-md shadow-blue-500/25 hover:bg-blue-600 active:scale-90 transition-all ring-4 ring-white/60 dark:ring-slate-900"
          >
            <LayoutGrid className="h-5 w-5 stroke-[2.5px]" />
          </button>

          {/* Receive pill */}
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-3xl bg-[#DDF3FF] dark:bg-slate-800/90 py-3.5 px-4 text-sm font-bold text-[#17212F] dark:text-white shadow-xs hover:bg-[#cdeaff] active:scale-95 transition-all min-h-[48px]"
          >
            <ArrowDownLeft className="h-4 w-4 text-[#4A90FF]" />
            <span>Receive</span>
          </button>
        </div>

        {/* =========================================================================
            3. AI INSIGHT BANNER (Soft rounded cyan card with right circular arrow)
           ========================================================================= */}
        <Link
          href="/ai"
          className="rounded-3xl p-4.5 bg-gradient-to-r from-[#D7F3FF]/90 via-[#E8F7FF]/90 to-[#FFFFFF]/90 dark:from-slate-800 dark:to-slate-800/80 border border-white/80 dark:border-slate-700 shadow-xs flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all block"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 shadow-2xs text-[#4A90FF]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A90FF]">
                  AI Insight
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#17212F] dark:text-white mt-0.5">
                {budgetSummary.percent_needs > 75
                  ? `You've used ${budgetSummary.percent_needs}% of your Needs budget this cutoff.`
                  : "You're spending 12% more on dining compared to last week."}
              </p>
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-2xs text-[#4A90FF] shrink-0 ml-3">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        {/* =========================================================================
            4. MONTHLY SPENDING LEVEL (Equalizer Waveform Cards: Food, Travel, Shopping)
           ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-[#17212F] dark:text-white">
              Monthly Spending Level
            </h2>
            <Link
              href="/reports"
              className="text-xs font-semibold text-[#788493] hover:text-[#4A90FF] transition-colors flex items-center gap-0.5"
            >
              <span>More Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Food Equalizer Card */}
            <SpendingEqualizerCard
              category="Food"
              amount={foodSpending}
              status="MODERATE"
              colorTheme="yellow"
              bars={[40, 60, 85, 55, 75, 95, 60, 45, 80, 70, 90, 75]}
            />

            {/* Travel Equalizer Card */}
            <SpendingEqualizerCard
              category="Travel"
              amount={travelSpending}
              status="OVER LIMIT"
              colorTheme="coral"
              bars={[30, 45, 60, 75, 90, 100, 85, 95, 80, 70, 65, 50]}
            />

            {/* Shopping Equalizer Card */}
            <SpendingEqualizerCard
              category="Shopping"
              amount={shoppingSpending}
              status="NORMAL"
              colorTheme="green"
              bars={[20, 35, 50, 40, 60, 45, 55, 70, 50, 40, 35, 25]}
            />
          </div>
        </div>

        {/* =========================================================================
            5. PAYDAY COUNTDOWN & SPENDABLE CASH FORECAST
           ========================================================================= */}
        <div className="rounded-3xl p-5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF3FF] text-[#4A90FF] dark:bg-slate-700 shrink-0">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#788493]">
                  Next Payday Countdown
                </span>
                <span className="rounded-full bg-blue-500/10 text-blue-600 px-2 py-0.5 text-[10px] font-bold">
                  {nextPayday.label}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-extrabold text-[#17212F] dark:text-white">
                  {nextPayday.daysRemaining} Days
                </span>
                <span className="text-xs text-muted-foreground">
                  (Expected: ₱{nextPayday.expectedAmount.toLocaleString()})
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                True Spendable: <span className="font-semibold text-emerald-600">₱{spendableBreakdown.availableToSpend.toLocaleString()}</span> • Daily rate: ₱{Math.round(spendableBreakdown.availableToSpend / Math.max(1, nextPayday.daysRemaining)).toLocaleString()} / day
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPlannerOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#DDF3FF] dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#4A90FF] hover:bg-[#cdeaff] active:scale-95 transition-all min-h-[44px]"
          >
            Plan This Payday
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* =========================================================================
            6. RECENT TRANSACTIONS (Clean white card list)
           ========================================================================= */}
        <div className="rounded-3xl p-5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-[#17212F] dark:text-white">
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-[#788493] hover:text-[#4A90FF] transition-colors"
            >
              See All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 mt-1">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#17212F] dark:text-white truncate">
                    {tx.title}
                  </p>
                  <p className="text-xs text-[#788493] mt-0.5">
                    {formatDate(tx.date)} • {tx.payment_method.toUpperCase()} • {tx.category}
                  </p>
                </div>
                <div className="shrink-0 pl-3">
                  <CurrencyDisplay
                    amount={tx.amount}
                    type={tx.type === "income" ? "income" : "expense"}
                    size="sm"
                    weight="bold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reusable Functional Modals */}
      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
      <PaydayPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
      />
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />
      <BillFormModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
      />
    </AppShell>
  );
}
