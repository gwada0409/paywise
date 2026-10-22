"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Edit2,
  Check,
  AlertTriangle,
  Plus,
  Sliders,
  Sparkles,
  Layers,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Percent,
  TrendingDown,
  CheckCircle2,
  CreditCard,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { CategoryBudgetModal } from "@/components/budget/CategoryBudgetModal";
import {
  BUDGET_PRESETS,
  DEFAULT_CATEGORY_ALLOCATIONS,
  calculateCategoryProgressList,
  CategoryProgress,
} from "@/lib/calculations/budget";
import { BudgetPreset } from "@/types";
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
    incomeRecords,
  } = useFinance();

  const [isEditingPillars, setIsEditingPillars] = useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "payday">("monthly");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "need" | "want" | "alert">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<{
    category: string;
    type: "need" | "want";
    amount: number;
  } | null>(null);

  // 4 Pillar percentages state
  const [needsP, setNeedsP] = useState(budgetRules.needs_percent ?? 50);
  const [wantsP, setWantsP] = useState(budgetRules.wants_percent ?? 20);
  const [savingsP, setSavingsP] = useState(budgetRules.savings_percent ?? 20);
  const [debtP, setDebtP] = useState(budgetRules.debt_percent ?? 10);
  const [fourthPillarName, setFourthPillarName] = useState(budgetRules.fourth_pillar_name || "Debt & Loans");

  useEffect(() => {
    setNeedsP(budgetRules.needs_percent ?? 50);
    setWantsP(budgetRules.wants_percent ?? 20);
    setSavingsP(budgetRules.savings_percent ?? 20);
    setDebtP(budgetRules.debt_percent ?? 10);
    setFourthPillarName(budgetRules.fourth_pillar_name || "Debt & Loans");
  }, [budgetRules]);

  const totalP = needsP + wantsP + savingsP + debtP;

  // Monthly base income
  const currentMonthIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const monthlyBase = currentMonthIncome > 0 ? currentMonthIncome : salarySettings.monthly_net;

  const multiplier = viewMode === "payday" ? 0.5 : 1;
  const allocatedNeeds = roundMoney(budgetSummary.allocated_needs * multiplier);
  const allocatedWants = roundMoney(budgetSummary.allocated_wants * multiplier);
  const allocatedSavings = roundMoney(budgetSummary.allocated_savings * multiplier);
  const allocatedDebt = roundMoney(budgetSummary.allocated_debt * multiplier);

  // Category progress list
  const categoryAllocations = budgetRules.category_allocations || DEFAULT_CATEGORY_ALLOCATIONS;
  const categoryProgressList = useMemo(() => {
    return calculateCategoryProgressList(transactions, categoryAllocations, multiplier);
  }, [transactions, categoryAllocations, multiplier]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categoryProgressList.filter((item) => {
      if (categoryFilter === "need" && item.type !== "need") return false;
      if (categoryFilter === "want" && item.type !== "want") return false;
      if (categoryFilter === "alert" && item.percentage < 80) return false;
      if (searchQuery && !item.category.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [categoryProgressList, categoryFilter, searchQuery]);

  // Apply a preset
  const handleApplyPreset = (presetKey: BudgetPreset) => {
    if (presetKey === "custom") {
      setIsEditingPillars(true);
      return;
    }
    const preset = BUDGET_PRESETS[presetKey as keyof typeof BUDGET_PRESETS];
    if (!preset) return;

    setNeedsP(preset.needs);
    setWantsP(preset.wants);
    setSavingsP(preset.savings);
    setDebtP(preset.debt);

    updateBudgetRules({
      preset_name: presetKey,
      needs_percent: preset.needs,
      wants_percent: preset.wants,
      savings_percent: preset.savings,
      debt_percent: preset.debt,
      fourth_pillar_name: preset.debt > 0 ? (fourthPillarName || "Debt & Loans") : "Debt & Loans",
    });
    toast.success(`Applied ${preset.name} (${preset.needs}/${preset.wants}/${preset.savings}/${preset.debt})`);
  };

  // Auto-balance percentages to 100%
  const handleAutoBalance = () => {
    const diff = 100 - totalP;
    if (diff === 0) return;

    // Distribute remainder prioritizing savings
    if (diff > 0) {
      setSavingsP((prev) => prev + diff);
    } else {
      // Scale down proportionally
      const reduction = Math.abs(diff);
      if (wantsP > 10) {
        const cut = Math.min(wantsP - 10, reduction);
        setWantsP((prev) => prev - cut);
        const rem = reduction - cut;
        if (rem > 0 && debtP > 5) {
          setDebtP((prev) => Math.max(5, prev - rem));
        }
      } else {
        setSavingsP((prev) => Math.max(10, prev - reduction));
      }
    }
    toast.info("Balanced allocation to 100%");
  };

  // Save custom macro percentages
  const handleSavePillars = () => {
    if (totalP !== 100) {
      toast.error("Allocation must sum to exactly 100%");
      return;
    }

    updateBudgetRules({
      preset_name: "custom",
      needs_percent: needsP,
      wants_percent: wantsP,
      savings_percent: savingsP,
      debt_percent: debtP,
      fourth_pillar_name: fourthPillarName.trim() || "Debt & Loans",
    });
    setIsEditingPillars(false);
    toast.success("Custom 4-pillar budget allocation saved.");
  };

  // Reset category allocations to recommended defaults
  const handleResetCategoriesToDefault = () => {
    if (confirm("Reset all category budget limits to standard recommended defaults?")) {
      updateBudgetRules({
        category_allocations: DEFAULT_CATEGORY_ALLOCATIONS,
      });
      toast.success("Restored standard Philippine category budget allocations.");
    }
  };

  // Open modal to add category
  const handleAddCategory = () => {
    setSelectedCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  // Open modal to edit existing category
  const handleEditCategory = (item: CategoryProgress) => {
    const rawMonthly = categoryAllocations[item.category] ?? item.allocated;
    setSelectedCategoryToEdit({
      category: item.category,
      type: item.type,
      amount: rawMonthly,
    });
    setIsCategoryModalOpen(true);
  };

  // Toggle threshold alert settings
  const handleToggleAlert = (threshold: "80" | "90" | "100") => {
    const key = `alert_threshold_${threshold}` as keyof typeof budgetRules;
    const current = Boolean(budgetRules[key]);
    updateBudgetRules({ [key]: !current });
    toast.success(`${threshold}% warning alerts ${!current ? "enabled" : "disabled"}`);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300 select-none">
        {/* =========================================================================
            1. HEADER & VIEW MODE (Monthly vs Per-Payday)
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17212F] dark:text-white flex items-center gap-2">
              <PieChart className="h-6 w-6 text-ref-blue" />
              Customizable 4-Pillar Budget Allocation
            </h1>
            <p className="text-xs text-[#788493] dark:text-slate-400 mt-0.5 text-pretty">
              Customize macro rules across Needs, Wants, Savings, and Debt/Loan Repayment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full glass-pill p-1 border border-border/50 bg-white/80 dark:bg-slate-800/80">
              <button
                onClick={() => setViewMode("monthly")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors touch-manipulation cursor-pointer t-press ${
                  viewMode === "monthly"
                    ? "bg-ref-blue text-white shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode("payday")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors touch-manipulation cursor-pointer t-press ${
                  viewMode === "payday"
                    ? "bg-ref-blue text-white shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Per Payday
              </button>
            </div>

            <button
              onClick={() => setIsEditingPillars(!isEditingPillars)}
              className="inline-flex items-center gap-1.5 rounded-full glass-pill px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-border/60 hover:bg-white dark:hover:bg-slate-700 active:scale-[0.96] transition-transform touch-manipulation cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5 text-ref-blue" />
              <span>{isEditingPillars ? "Close Sliders" : "Customize 4-Way Split"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. PRESET STRATEGY CAROUSEL / PILLS
           ========================================================================= */}
        <div className="rounded-3xl p-5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-ref-navy">
                4-Pillar Budget Strategy Presets
              </span>
              <p className="text-[11px] text-ref-muted">
                One-tap tested strategies tailored for Philippine salaries and debt freedom.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-ref-muted shrink-0">
              Active: <span className="font-bold text-ref-blue">{budgetRules.preset_name || "50/20/20/10"}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(Object.keys(BUDGET_PRESETS) as (keyof typeof BUDGET_PRESETS)[]).map((key) => {
              const preset = BUDGET_PRESETS[key];
              const isSelected = budgetRules.preset_name === key;
              return (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className={`p-3.5 rounded-2xl text-left border transition-[border-color,background-color,box-shadow] touch-manipulation cursor-pointer t-press ${
                    isSelected
                      ? "border-ref-blue bg-[#EBF5FF] dark:bg-sky-950/40 text-ref-navy shadow-xs ring-1 ring-ref-blue/30"
                      : "border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-ref-navy tracking-tight">
                      {key}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-ref-blue shrink-0" />
                    ) : (
                      <span className="text-[10px] font-semibold text-ref-muted uppercase tracking-wider">
                        Select
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-ref-blue mt-1 line-clamp-1">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-ref-muted mt-1 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      {preset.needs}% Needs
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      {preset.wants}% Wants
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      {preset.savings}% Savings
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                      {preset.debt}% Debt
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Threshold Alert Warning Banner if any */}
        {thresholdAlerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-3xl p-4 flex items-start gap-3 ${
              alert.severity === "danger"
                ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            }`}
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">{alert.message}</p>
            </div>
          </div>
        ))}

        {/* =========================================================================
            3. CUSTOM PERCENTAGE SLIDERS & LIVE AUTO-BALANCE (4 PILLARS)
           ========================================================================= */}
        {isEditingPillars && (
          <div className="rounded-3xl p-6 bg-white/95 dark:bg-slate-800/95 border border-sky-200/80 dark:border-slate-700 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div>
                <h2 className="text-sm font-bold text-ref-navy flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-ref-blue" />
                  Interactive 4-Way Allocation Sliders
                </h2>
                <p className="text-xs text-ref-muted">
                  Drag each slider to balance your income across 4 strategic pillars.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {totalP !== 100 && (
                  <button
                    onClick={handleAutoBalance}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs font-bold hover:bg-amber-500/25 active:scale-[0.96] transition-transform touch-manipulation cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Auto-Balance to 100%
                  </button>
                )}
              </div>
            </div>

            {/* Needs Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-ref-blue flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ref-blue" />
                  Needs (Rent, Groceries, Utilities, Commute)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-ref-muted font-normal text-[11px] tabular-nums">
                    ≈ ₱{roundMoney((monthlyBase * needsP) / 100).toLocaleString()} / mo
                  </span>
                  <span className="tabular-nums font-extrabold text-ref-navy text-sm">
                    {needsP}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={needsP}
                onChange={(e) => setNeedsP(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#4A90FF]"
              />
            </div>

            {/* Wants Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Wants (Dining Out, Shopping, Subscriptions)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-ref-muted font-normal text-[11px] tabular-nums">
                    ≈ ₱{roundMoney((monthlyBase * wantsP) / 100).toLocaleString()} / mo
                  </span>
                  <span className="tabular-nums font-extrabold text-ref-navy text-sm">
                    {wantsP}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={wantsP}
                onChange={(e) => setWantsP(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Savings Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-ref-green flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ref-green" />
                  Savings & Goals (Emergency Fund, MP2)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-ref-muted font-normal text-[11px] tabular-nums">
                    ≈ ₱{roundMoney((monthlyBase * savingsP) / 100).toLocaleString()} / mo
                  </span>
                  <span className="tabular-nums font-extrabold text-ref-navy text-sm">
                    {savingsP}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={savingsP}
                onChange={(e) => setSavingsP(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#45C97A]"
              />
            </div>

            {/* 4th Pillar: Debt / Loan Repayment / Investments Slider */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                  <span className="text-teal-700 dark:text-teal-400">
                    4th Pillar:
                  </span>
                  <input
                    type="text"
                    value={fourthPillarName}
                    onChange={(e) => setFourthPillarName(e.target.value)}
                    placeholder="e.g. Debt & Loans"
                    className="rounded-lg border border-teal-200 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/30 px-2 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ref-muted font-normal text-[11px] tabular-nums">
                    ≈ ₱{roundMoney((monthlyBase * debtP) / 100).toLocaleString()} / mo
                  </span>
                  <span className="tabular-nums font-extrabold text-ref-navy text-sm">
                    {debtP}%
                  </span>
                </div>
              </div>

              {/* Quick labels for 4th pillar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-ref-muted font-medium">Quick presets:</span>
                {[
                  "Debt & Loans",
                  "Investments & Wealth",
                  "Family Support / Remittance",
                  "Emergency Buffer",
                ].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFourthPillarName(name)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors touch-manipulation cursor-pointer ${
                      fourthPillarName === name
                        ? "bg-teal-600 text-white"
                        : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={0}
                max={50}
                value={debtP}
                onChange={(e) => setDebtP(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            {/* Total Balance Indicator & Save Button */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span>Total Split Sum:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold tabular-nums ${
                    totalP === 100
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {totalP}%
                </span>
                {totalP !== 100 && (
                  <span className="text-rose-500 text-[11px] font-semibold">
                    Must equal 100%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPillars(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50 active:scale-[0.96] transition-transform touch-manipulation cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePillars}
                  disabled={totalP !== 100}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ref-blue px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-ref-blue/90 disabled:opacity-50 transition-opacity active:scale-[0.96] touch-manipulation cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  Save Custom 4-Pillar Split
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. FOUR MACRO PILLARS PROGRESS CARDS
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. NEEDS */}
          <div className="rounded-3xl p-5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ref-blue">
                  Needs ({budgetRules.needs_percent}%)
                </span>
                <span className={`tabular-nums text-xs font-bold ${
                  budgetSummary.percent_needs >= 100 ? "text-rose-600" : "text-ref-blue"
                }`}>
                  {budgetSummary.percent_needs}%
                </span>
              </div>

              <div className="mt-3">
                <CurrencyDisplay amount={budgetSummary.spent_needs} size="2xl" weight="bold" />
                <p className="text-[11px] text-[#788493] dark:text-slate-400 mt-0.5 tabular-nums">
                  of ₱{allocatedNeeds.toLocaleString()} {viewMode === "monthly" ? "monthly budget" : "payday budget"}
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    budgetSummary.percent_needs >= 100
                      ? "bg-rose-500"
                      : budgetSummary.percent_needs >= 80
                      ? "bg-amber-500"
                      : "bg-ref-blue"
                  }`}
                  style={{ width: `${Math.min(100, budgetSummary.percent_needs)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#788493] dark:text-slate-400">
                <span>Remaining:</span>
                <span className={`font-bold tabular-nums ${
                  allocatedNeeds - budgetSummary.spent_needs < 0 ? "text-rose-600" : "text-slate-900 dark:text-white"
                }`}>
                  ₱{(allocatedNeeds - budgetSummary.spent_needs).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 2. WANTS */}
          <div className="rounded-3xl p-5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Wants ({budgetRules.wants_percent}%)
                </span>
                <span className={`tabular-nums text-xs font-bold ${
                  budgetSummary.percent_wants >= 100 ? "text-rose-600" : "text-amber-600 dark:text-amber-400"
                }`}>
                  {budgetSummary.percent_wants}%
                </span>
              </div>

              <div className="mt-3">
                <CurrencyDisplay amount={budgetSummary.spent_wants} size="2xl" weight="bold" />
                <p className="text-[11px] text-[#788493] dark:text-slate-400 mt-0.5 tabular-nums">
                  of ₱{allocatedWants.toLocaleString()} {viewMode === "monthly" ? "monthly budget" : "payday budget"}
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    budgetSummary.percent_wants >= 100
                      ? "bg-rose-500"
                      : budgetSummary.percent_wants >= 80
                      ? "bg-amber-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, budgetSummary.percent_wants)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#788493] dark:text-slate-400">
                <span>Remaining:</span>
                <span className={`font-bold tabular-nums ${
                  allocatedWants - budgetSummary.spent_wants < 0 ? "text-rose-600" : "text-slate-900 dark:text-white"
                }`}>
                  ₱{(allocatedWants - budgetSummary.spent_wants).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 3. SAVINGS */}
          <div className="rounded-3xl p-5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
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
                <p className="text-[11px] text-[#788493] dark:text-slate-400 mt-0.5 tabular-nums">
                  target ₱{allocatedSavings.toLocaleString()} {viewMode === "monthly" ? "monthly target" : "payday target"}
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ref-green transition-[width] duration-300"
                  style={{ width: `${Math.min(100, budgetSummary.percent_savings)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#788493] dark:text-slate-400">
                <span>Total Saved:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  ₱{budgetSummary.saved_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 4. DEBT / LOAN REPAYMENT / INVESTMENTS */}
          <div className="rounded-3xl p-5 bg-white/95 dark:bg-slate-800/90 border border-teal-100/80 dark:border-teal-900/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 truncate max-w-[130px]">
                  {budgetRules.fourth_pillar_name || "Debt & Loans"} ({budgetRules.debt_percent ?? 10}%)
                </span>
                <span className={`tabular-nums text-xs font-bold ${
                  budgetSummary.percent_debt >= 100 ? "text-teal-700" : "text-teal-700 dark:text-teal-400"
                }`}>
                  {budgetSummary.percent_debt}%
                </span>
              </div>

              <div className="mt-3">
                <CurrencyDisplay amount={budgetSummary.spent_debt} size="2xl" weight="bold" />
                <p className="text-[11px] text-[#788493] dark:text-slate-400 mt-0.5 tabular-nums">
                  of ₱{allocatedDebt.toLocaleString()} {viewMode === "monthly" ? "monthly budget" : "payday budget"}
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-600 transition-[width] duration-300"
                  style={{ width: `${Math.min(100, budgetSummary.percent_debt)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#788493] dark:text-slate-400">
                <span>Remaining:</span>
                <span className={`font-bold tabular-nums ${
                  allocatedDebt - budgetSummary.spent_debt < 0 ? "text-rose-600" : "text-slate-900 dark:text-white"
                }`}>
                  ₱{(allocatedDebt - budgetSummary.spent_debt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. CUSTOMIZABLE CATEGORY BUDGETS MANAGER
           ========================================================================= */}
        <div className="rounded-3xl p-6 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-ref-blue" />
                <h2 className="text-base font-bold text-ref-navy">
                  Category Spending Allocations
                </h2>
              </div>
              <p className="text-xs text-ref-muted mt-0.5">
                Set individual budget limits for everyday spending categories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCategoriesToDefault}
                title="Reset to standard allocations"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center gap-1.5 rounded-full bg-ref-blue px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-ref-blue/90 active:opacity-75 transition-opacity touch-manipulation cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category Limit
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Categories" },
                { id: "need", label: "Needs Only" },
                { id: "want", label: "Wants Only" },
                { id: "alert", label: "Near / Over Limit" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors touch-manipulation cursor-pointer whitespace-nowrap ${
                    categoryFilter === f.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-48">
              <input
                type="text"
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border/60 bg-slate-50 dark:bg-slate-900/50 px-3.5 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ref-blue"
              />
            </div>
          </div>

          {/* Category Cards List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 pt-1">
            {filteredCategories.map((item) => {
              const isOver = item.percentage >= 100;
              const isNear = item.percentage >= 80 && !isOver;

              return (
                <div
                  key={item.category}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-700/20 px-2 rounded-2xl transition-colors"
                >
                  {/* Left: Category info & Progress bar */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ref-navy truncate">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.type === "need"
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {item.type}
                      </span>
                      {isOver && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                          Over Limit
                        </span>
                      )}
                      {isNear && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          Near Limit
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 flex items-center gap-2.5">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${
                            isOver
                              ? "bg-rose-500"
                              : isNear
                              ? "bg-amber-500"
                              : item.type === "need"
                              ? "bg-ref-blue"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold tabular-nums text-ref-muted w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Right: Amounts & Quick Edit */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-ref-navy tabular-nums">
                        ₱{item.spent.toLocaleString()} / ₱{item.allocated.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-ref-muted tabular-nums mt-0.5">
                        {item.remaining >= 0 ? (
                          <span>₱{item.remaining.toLocaleString()} left</span>
                        ) : (
                          <span className="text-rose-600 font-semibold">
                            ₱{Math.abs(item.remaining).toLocaleString()} over
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEditCategory(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-ref-navy hover:bg-slate-100 dark:hover:bg-slate-600 active:opacity-75 transition-opacity touch-manipulation cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3 text-ref-blue" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="py-8 text-center text-xs text-ref-muted">
                No categories match the filter. Tap &ldquo;Add Category Limit&rdquo; to add a custom allocation.
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            6. THRESHOLD ALERTS PREFERENCES
           ========================================================================= */}
        <div className="rounded-3xl p-6 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-ref-blue" />
            <h2 className="text-base font-bold text-ref-navy">
              Budget Alert Thresholds
            </h2>
          </div>
          <p className="text-xs text-ref-muted">
            Receive in-app and notification warnings when spending reaches critical thresholds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { id: "80", label: "80% Warning", desc: "Early warning when approaching budget." },
              { id: "90", label: "90% Caution", desc: "Urgent notice to pause non-essential spending." },
              { id: "100", label: "100% Limit Alert", desc: "Instant alert when category or pillar is exhausted." },
            ].map((thresh) => {
              const key = `alert_threshold_${thresh.id}` as keyof typeof budgetRules;
              const isEnabled = Boolean(budgetRules[key]);

              return (
                <div
                  key={thresh.id}
                  onClick={() => handleToggleAlert(thresh.id as any)}
                  className={`p-3.5 rounded-2xl border flex items-start justify-between cursor-pointer transition-colors touch-manipulation ${
                    isEnabled
                      ? "border-ref-blue/60 bg-[#EBF5FF] dark:bg-sky-950/40"
                      : "border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-ref-navy">
                      {thresh.label}
                    </span>
                    <p className="text-[10px] text-ref-muted mt-0.5">
                      {thresh.desc}
                    </p>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isEnabled
                        ? "bg-ref-blue text-white"
                        : "border border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isEnabled && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Budget Modal */}
      <CategoryBudgetModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={selectedCategoryToEdit}
      />
    </AppShell>
  );
}
