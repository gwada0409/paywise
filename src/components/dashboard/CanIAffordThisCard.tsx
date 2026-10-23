"use client";

import React, { useState } from "react";
import {
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "../common/CurrencyDisplay";
import { toast } from "sonner";

const QUICK_PRESETS = [
  { label: "Samgyup Buffet", cost: 799 },
  { label: "Sneakers", cost: 3500 },
  { label: "Weekend Trip", cost: 5000 },
  { label: "New Phone", cost: 18000 },
];

export function CanIAffordThisCard() {
  const { spendableBreakdown, nextPayday, bills, salarySettings, clientApiKey } =
    useFinance();

  const [itemName, setItemName] = useState<string>("");
  const [cost, setCost] = useState<number | "">("");
  const [isAskingAI, setIsAskingAI] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const numCost = typeof cost === "number" ? cost : 0;
  const spendable = spendableBreakdown.availableToSpend;
  const daysLeft = Math.max(1, nextPayday.daysRemaining);

  // Filter bills due before the next payday
  const upcomingBillsTotal = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  const currentDaily = spendable / daysLeft;
  const remainingAfterPurchase = spendable - numCost;
  const newDaily = remainingAfterPurchase / daysLeft;

  // Determine affordability level
  let status: "safe" | "caution" | "danger" = "safe";
  let statusLabel = "Safe Purchase";
  let statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";

  if (numCost > 0) {
    if (remainingAfterPurchase < upcomingBillsTotal || remainingAfterPurchase <= 0 || newDaily < 100) {
      status = "danger";
      statusLabel = "High Risk (Petsa de Peligro)";
      statusColor = "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (numCost > spendable * 0.35 || newDaily < 250) {
      status = "caution";
      statusLabel = "Tight Cashflow";
      statusColor = "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  }

  const handleAskAI = async () => {
    if (!itemName.trim() || numCost <= 0) {
      toast.error("Please enter an item name and cost first.");
      return;
    }

    setIsAskingAI(true);
    setAiAdvice(null);

    try {
      const res = await fetch("/api/ai/affordability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: itemName.trim(),
          itemCost: numCost,
          spendableBalance: spendable,
          daysUntilPayday: daysLeft,
          nextPaydayDate: nextPayday.isoDate,
          upcomingBillsTotal,
          currentDailyAllowance: currentDaily,
          newDailyAllowance: newDaily,
          monthlySalary: salarySettings.monthly_net,
          clientApiKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to get AI advice");
      }

      setAiAdvice(json.advice);
    } catch (err: any) {
      toast.error(err.message || "Could not fetch AI advice. Please check your Gemini API key.");
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Can I Afford This?
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Before {nextPayday.label || nextPayday.isoDate || "Next Cutoff"}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Simulate spending impact before checking out
            </p>
          </div>
        </div>

        {numCost > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor}`}
          >
            {status === "safe" && <CheckCircle2 className="h-3.5 w-3.5" />}
            {status === "caution" && <AlertTriangle className="h-3.5 w-3.5" />}
            {status === "danger" && <XCircle className="h-3.5 w-3.5" />}
            {statusLabel}
          </span>
        )}
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            What do you want to buy?
          </label>
          <input
            type="text"
            placeholder="e.g. Uniqlo jacket, weekend samgyup"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              setAiAdvice(null);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Cost (PHP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">
              ₱
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={cost}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                setCost(val);
                setAiAdvice(null);
              }}
              className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Quick Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] text-muted-foreground font-semibold mr-1">
          Quick Test:
        </span>
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setItemName(preset.label);
              setCost(preset.cost);
              setAiAdvice(null);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors font-medium active:scale-95"
          >
            {preset.label} (₱{preset.cost.toLocaleString()})
          </button>
        ))}
      </div>

      {/* Impact Simulation Bar & Metrics */}
      {numCost > 0 && (
        <div className="rounded-2xl bg-muted/30 border border-border/60 p-3.5 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-3 text-center sm:text-left">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Current Daily Allowance
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5">
                ₱{Math.max(0, Math.round(currentDaily)).toLocaleString()}
                <span className="text-[10px] font-normal text-muted-foreground">/day</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Daily Allowance If Bought
              </span>
              <p
                className={`text-sm font-bold mt-0.5 ${
                  newDaily < 100
                    ? "text-rose-600 dark:text-rose-400"
                    : newDaily < 250
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                ₱{Math.round(newDaily).toLocaleString()}
                <span className="text-[10px] font-normal text-muted-foreground">/day</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
            <span className="text-muted-foreground">
              Remaining spendable balance:
            </span>
            <span className="font-bold text-foreground">
              ₱{Math.max(0, Math.round(remainingAfterPurchase)).toLocaleString()}
            </span>
          </div>

          {/* AI Advisor Button */}
          {!aiAdvice && (
            <button
              onClick={handleAskAI}
              disabled={isAskingAI}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-sky-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {isAskingAI ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ask Gemini: Should I buy this?</span>
                </>
              )}
            </button>
          )}

          {/* AI Response Card */}
          {aiAdvice && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 dark:bg-sky-950/40 p-3 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Gemini Reality Check
                </span>
                <button
                  onClick={handleAskAI}
                  disabled={isAskingAI}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isAskingAI ? "animate-spin" : ""}`} />
                  Re-evaluate
                </button>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                {aiAdvice}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
