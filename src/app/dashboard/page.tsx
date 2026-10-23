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
  Receipt,
  LayoutGrid,
  Plus,
  Check,
  Camera,
  Wallet,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { SpendingEqualizerCard } from "@/components/dashboard/SpendingEqualizerCard";
import { CanIAffordThisCard } from "@/components/dashboard/CanIAffordThisCard";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";
import { ReceiptScannerModal } from "@/components/receipts/ReceiptScannerModal";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import { PaydayPlannerModal } from "@/components/payday/PaydayPlannerModal";
import { IncomeFormModal } from "@/components/income/IncomeFormModal";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { QuickActionsModal } from "@/components/dashboard/QuickActionsModal";
import { TransactionDetailModal } from "@/components/transactions/TransactionDetailModal";
import { FinancialTransaction, TransactionType } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const {
    accounts,
    spendableBreakdown,
    nextPayday,
    budgetSummary,
    transactions,
    bills,
    markBillAsPaid,
    salarySettings,
    isDemoMode,
    resetAllData,
  } = useFinance();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<TransactionType>("need");
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<FinancialTransaction | null>(null);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);

  // Group spending for Food, Travel, Shopping
  const foodSpending = transactions
    .filter((t) => {
      const c = t.category.toLowerCase();
      return c.includes("grocer") || c.includes("dining") || c.includes("food") || c.includes("coffee") || c.includes("tea");
    })
    .reduce((s, t) => s + t.amount, 0);

  const travelSpending = transactions
    .filter((t) => {
      const c = t.category.toLowerCase();
      return c.includes("transport") || c.includes("travel") || c.includes("commute") || c.includes("grab") || c.includes("gas");
    })
    .reduce((s, t) => s + t.amount, 0);

  const shoppingSpending = transactions
    .filter((t) => {
      const c = t.category.toLowerCase();
      return c.includes("shop") || c.includes("gadget") || c.includes("hobbies") || c.includes("lazada") || c.includes("shopee");
    })
    .reduce((s, t) => s + t.amount, 0);

  const upcomingBills = bills.filter((b) => b.status !== "paid").slice(0, 3);
  const recentTransactions = transactions.slice(0, 5);

  const daysRemaining = Math.max(1, nextPayday.daysRemaining);
  const dailyPace = Math.round(spendableBreakdown.availableToSpend / daysRemaining);

  // Approximate 15-day cycle progress
  const cycleDaysTotal = 15;
  const daysElapsed = Math.min(cycleDaysTotal, Math.max(0, cycleDaysTotal - nextPayday.daysRemaining));
  const cyclePercent = Math.min(100, Math.max(5, Math.round((daysElapsed / cycleDaysTotal) * 100)));

  const handleOpenSend = () => {
    setTxDefaultType("need");
    setIsAddTxOpen(true);
  };

  const handleOpenReceive = () => {
    setIsIncomeModalOpen(true);
  };

  const handleOpenBill = () => {
    setIsBillModalOpen(true);
  };

  const handleOpenPlanner = () => {
    setIsPlannerOpen(true);
  };

  // Helper for payment method styling
  const getMethodBadge = (method: string) => {
    const m = (method || "").toLowerCase();
    if (m.includes("gcash")) {
      return { label: "GCash", bg: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20" };
    }
    if (m.includes("maya")) {
      return { label: "Maya", bg: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/20" };
    }
    if (m.includes("mari")) {
      return { label: "MariBank", bg: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20" };
    }
    if (m.includes("sea")) {
      return { label: "SeaBank", bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20" };
    }
    if (m.includes("cash")) {
      return { label: "Cash", bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" };
    }
    return { label: method.toUpperCase(), bg: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20" };
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300">
        {/* =========================================================================
            0. DEMO MODE BANNER (When viewing Philippine sample data)
           ========================================================================= */}
        {isDemoMode && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/40 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Philippine Demo Dataset Active
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Viewing Juan Dela Cruz sample transactions. Ready to record your own paydays?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  toast.success("Demo records cleared! Your personal dashboard is ready.");
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-full bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                Clear Demo & Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* PWA Home Screen Install Banner */}
        <PWAInstallBanner />

        {/* =========================================================================
            1. MASTER SPENDABLE WALLET HERO CARD
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-[30px] p-5 sm:p-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-xl">
          {/* Subtle top atmospheric background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          {/* Top Row: Hero Title + Privacy Toggle */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Safe to Spend
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                (Liquid cash minus upcoming bills)
              </span>
            </div>

            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 active:scale-95 transition-all cursor-pointer"
              title={isBalanceHidden ? "Show balance" : "Hide balance for privacy"}
            >
              {isBalanceHidden ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Show</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Hide</span>
                </>
              )}
            </button>
          </div>

          {/* Big Spendable Currency Balance */}
          <div className="mt-2 flex items-baseline justify-between relative z-10">
            {isBalanceHidden ? (
              <span className="tabular-nums text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                ₱••••••••
              </span>
            ) : (
              <CurrencyDisplay
                amount={spendableBreakdown.availableToSpend || 0}
                size="4xl"
                weight="bold"
                className="text-slate-900 dark:text-white text-4xl sm:text-5xl"
              />
            )}
          </div>

          {/* Daily Allowance Pace Context Chip */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 relative z-10">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                dailyPace > 400
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                  : dailyPace > 150
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>
                ₱{isBalanceHidden ? "•••" : dailyPace.toLocaleString()} / day
              </span>
              <span className="text-[11px] font-normal opacity-85">
                until {nextPayday.label} ({daysRemaining}d left)
              </span>
            </div>

            <Link
              href="/savings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer"
            >
              <span>Saved ₱{isBalanceHidden ? "•••" : budgetSummary.saved_amount.toLocaleString()} this cycle</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* 3-Column Breakdown Strip: Liquid Total, Reserved Bills, Next Payday */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center sm:text-left relative z-10">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Total Liquid
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5 block">
                ₱{isBalanceHidden ? "••••" : (spendableBreakdown.liquidCashTotal || 0).toLocaleString()}
              </span>
            </div>

            <div className="border-x border-slate-100 dark:border-slate-800/80 px-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Reserved Bills
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5 block">
                ₱{isBalanceHidden ? "••••" : (spendableBreakdown.reservedBillsTotal || 0).toLocaleString()}
              </span>
            </div>

            <div className="pl-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Expected Pay
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-primary tabular-nums mt-0.5 block truncate">
                ₱{isBalanceHidden ? "••••" : (nextPayday.expectedAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Active Accounts & Wallets Carousel Chips */}
          {accounts.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Active Wallets & Accounts
                </span>
                <Link
                  href="/settings"
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  Manage →
                </Link>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {accounts
                  .filter((a) => !a.is_archived)
                  .map((acc) => (
                    <div
                      key={acc.id}
                      className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs shadow-2xs"
                    >
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {acc.name}
                      </span>
                      <span className="font-extrabold tabular-nums text-slate-900 dark:text-white">
                        ₱{isBalanceHidden ? "••••" : acc.balance.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            2. THUMB-ZONE PRIMARY ACTIONS (Send / Scan OCR / Receive / Quick Hub)
           ========================================================================= */}
        <div className="grid grid-cols-4 gap-2.5 select-none">
          {/* Send / Expense Pill */}
          <button
            type="button"
            onClick={handleOpenSend}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 py-3 px-2 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs active:scale-95 transition-all min-h-[58px] touch-manipulation cursor-pointer group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
            <span className="text-[11px] tracking-tight">Expense</span>
          </button>

          {/* Scan Receipt OCR (AI Superpower) */}
          <button
            type="button"
            onClick={() => setIsReceiptScannerOpen(true)}
            className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-tr from-sky-500/15 via-indigo-500/15 to-purple-500/15 dark:bg-slate-900 border border-sky-400/30 dark:border-sky-500/30 py-3 px-2 text-xs font-bold text-sky-900 dark:text-sky-200 shadow-2xs active:scale-95 transition-all min-h-[58px] touch-manipulation cursor-pointer group"
          >
            <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[9px] font-extrabold tracking-tight shadow-xs">
              AI OCR
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="h-4.5 w-4.5" />
            </div>
            <span className="text-[11px] tracking-tight">Scan Receipt</span>
          </button>

          {/* Receive / Income Pill */}
          <button
            type="button"
            onClick={handleOpenReceive}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 py-3 px-2 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs active:scale-95 transition-all min-h-[58px] touch-manipulation cursor-pointer group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <ArrowDownLeft className="h-4.5 w-4.5" />
            </div>
            <span className="text-[11px] tracking-tight">Income</span>
          </button>

          {/* Quick Hub Button */}
          <button
            type="button"
            onClick={() => setIsQuickActionsOpen(true)}
            aria-label="Open Quick Financial Hub"
            title="Quick Financial Actions Hub"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-primary text-white py-3 px-2 text-xs font-bold shadow-xs active:scale-95 transition-all min-h-[58px] touch-manipulation cursor-pointer group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white group-hover:scale-105 transition-transform">
              <LayoutGrid className="h-4.5 w-4.5" />
            </div>
            <span className="text-[11px] tracking-tight">More</span>
          </button>
        </div>

        {/* =========================================================================
            3. PAYDAY COUNTDOWN & CUTOFF PROGRESS TIMELINE
           ========================================================================= */}
        <div className="rounded-[28px] p-4.5 sm:p-5 bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-primary dark:bg-slate-800 shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Payday Cutoff Cycle
                  </h3>
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                    {nextPayday.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Day {daysElapsed} of {cycleDaysTotal} • {daysRemaining} days remaining
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenPlanner}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer touch-manipulation"
            >
              <span>Plan Payday</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Progress bar of current cutoff */}
          <div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-primary transition-all duration-500"
                style={{ width: `${cyclePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1.5">
              <span>Cutoff Start</span>
              <span>{nextPayday.daysRemaining} days until salary credit</span>
              <span>Payday</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. AI COPILOT INSIGHT BANNER
           ========================================================================= */}
        <Link
          href="/ai"
          prefetch={true}
          className="rounded-[28px] p-4 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 hover:from-sky-500/15 hover:via-indigo-500/15 hover:to-purple-500/15 dark:bg-slate-900/90 border border-sky-300/40 dark:border-sky-700/40 shadow-2xs flex items-center justify-between active:scale-[0.98] transition-all block touch-manipulation select-none cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 text-white shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  PayWise AI Copilot
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {budgetSummary.percent_needs > 75
                  ? `You've used ${budgetSummary.percent_needs}% of your Needs budget this cutoff.`
                  : "You're pacing well! Tap to run an affordability reality check."}
              </p>
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-2xs text-slate-700 dark:text-slate-300 shrink-0 ml-3 group-hover:text-primary transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        {/* =========================================================================
            5. MONTHLY SPENDING VELOCITY (Equalizer Waveforms: Food, Travel, Shopping)
           ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Spending Velocity
            </h2>
            <Link
              href="/reports"
              prefetch={true}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 touch-manipulation cursor-pointer"
            >
              <span>Detailed Breakdown</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <SpendingEqualizerCard
              category="Food"
              amount={foodSpending}
              status={foodSpending > 5000 ? "OVER LIMIT" : foodSpending > 2500 ? "MODERATE" : "NORMAL"}
              colorTheme="yellow"
              bars={foodSpending === 0 ? [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15] : [40, 60, 85, 55, 75, 95, 60, 45, 80, 70, 90, 75]}
              href="/transactions"
            />

            <SpendingEqualizerCard
              category="Travel"
              amount={travelSpending}
              status={travelSpending > 3000 ? "OVER LIMIT" : travelSpending > 1500 ? "MODERATE" : "NORMAL"}
              colorTheme="coral"
              bars={travelSpending === 0 ? [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15] : [30, 45, 60, 75, 90, 100, 85, 95, 80, 70, 65, 50]}
              href="/transactions"
            />

            <SpendingEqualizerCard
              category="Shopping"
              amount={shoppingSpending}
              status={shoppingSpending > 2000 ? "OVER LIMIT" : shoppingSpending > 1000 ? "MODERATE" : "NORMAL"}
              colorTheme="green"
              bars={shoppingSpending === 0 ? [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15] : [20, 35, 50, 40, 60, 45, 55, 70, 50, 40, 35, 25]}
              href="/transactions"
            />
          </div>
        </div>

        {/* =========================================================================
            6. "CAN I AFFORD THIS?" REALITY CHECK WIDGET
           ========================================================================= */}
        <CanIAffordThisCard />

        {/* =========================================================================
            7. UPCOMING BILLS & OBLIGATIONS
           ========================================================================= */}
        <div className="rounded-[28px] p-4.5 sm:p-5 bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Upcoming Bills
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Reserved from your liquid cash
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleOpenBill}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2.5 py-1 text-xs font-bold hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Bill
              </button>
              <Link
                href="/bills"
                prefetch={true}
                className="text-xs font-bold text-primary hover:underline active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                See All →
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingBills.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {b.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Due Day {b.due_day} • {b.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CurrencyDisplay amount={b.amount} size="sm" weight="bold" />
                  <button
                    type="button"
                    onClick={() => {
                      markBillAsPaid(b.id);
                      toast.success(`Marked ${b.name} as paid`);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-bold hover:bg-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    Pay
                  </button>
                </div>
              </div>
            ))}
            {upcomingBills.length === 0 && (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No unpaid bills due in this cutoff. All clear!
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            8. RECENT TRANSACTIONS (High-Density Fintech Ledger)
           ========================================================================= */}
        <div className="rounded-[28px] p-4.5 sm:p-5 bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                Recent Transactions
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Tap any transaction to view details or edit
              </p>
            </div>
            <Link
              href="/transactions"
              prefetch={true}
              className="text-xs font-bold text-primary hover:underline active:scale-95 transition-all touch-manipulation cursor-pointer"
            >
              See All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-1">
            {recentTransactions.map((tx) => {
              const badge = getMethodBadge(tx.payment_method);
              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelectedTxForDetail(tx)}
                  className="w-full text-left py-3 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-2xl active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(tx.date)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className={`inline-block px-1.5 py-0.2 rounded-md text-[9px] font-extrabold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {tx.category}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <CurrencyDisplay
                      amount={tx.amount}
                      type={tx.type === "income" ? "income" : "expense"}
                      size="sm"
                      weight="bold"
                    />
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                  </div>
                </button>
              );
            })}

            {recentTransactions.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No transactions recorded yet. Tap + Expense or Scan OCR above!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Functional Modals */}
      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        defaultType={txDefaultType}
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
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onOpenSend={handleOpenSend}
        onOpenReceive={handleOpenReceive}
        onOpenBill={handleOpenBill}
        onOpenPlanner={handleOpenPlanner}
        onOpenScanReceipt={() => setIsReceiptScannerOpen(true)}
      />
      <TransactionDetailModal
        transaction={selectedTxForDetail}
        isOpen={Boolean(selectedTxForDetail)}
        onClose={() => setSelectedTxForDetail(null)}
      />
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
      />
    </AppShell>
  );
}
