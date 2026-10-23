"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Coffee,
  ShoppingBag,
  TrendingDown,
  X,
  ChevronRight,
  Info,
} from "lucide-react";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";

interface PetsaDePeligroCardProps {
  daysRemaining: number;
  dailyAllowance: number;
  availableToSpend: number;
  reservedBillsTotal: number;
  nextPaydayLabel: string;
}

export function PetsaDePeligroCard({
  daysRemaining,
  dailyAllowance,
  availableToSpend,
  reservedBillsTotal,
  nextPaydayLabel,
}: PetsaDePeligroCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Trigger conditions:
  // 1. Within 7 days of payday AND daily allowance is tight (< 250) or negative
  // 2. Or available cash is smaller than reserved bills
  const isDangerZone =
    daysRemaining <= 7 && (dailyAllowance < 250 || availableToSpend < 500);

  if (isDismissed || !isDangerZone) {
    return null;
  }

  const isCritical = dailyAllowance < 120 || availableToSpend <= 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 border transition-all duration-300 shadow-sm ${
        isCritical
          ? "border-rose-400/50 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-amber-500/10 dark:from-rose-950/40 dark:to-slate-900/80"
          : "border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-950/40 dark:to-slate-900/80"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
              isCritical
                ? "bg-rose-500 text-white shadow-xs shadow-rose-500/30"
                : "bg-amber-500 text-white shadow-xs shadow-amber-500/30"
            }`}
          >
            <Flame className="h-5 w-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  isCritical
                    ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                    : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                }`}
              >
                🚨 Petsa de Peligro Mode
              </span>
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"} until {nextPaydayLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Tight runway detected before your next salary credit.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Runway Stats Grid */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 p-3 border border-slate-200/50 dark:border-slate-800/60">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Daily Cap
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg sm:text-xl font-black tabular-nums ${
                dailyAllowance <= 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              ₱{Math.max(0, dailyAllowance).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">/ day</span>
          </div>
        </div>

        <div className="border-l border-slate-200/60 dark:border-slate-800/60 pl-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Untouchable Bills Guard
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-200 tabular-nums">
              ₱{(reservedBillsTotal || 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              shielded
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Filipino Survival Tips Toggle */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            3 Quick Levers to Reach Payday Safely
          </span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${showTips ? "rotate-90" : ""}`}
          />
        </button>

        {showTips && (
          <div className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-200/40 dark:border-slate-800/40 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <Coffee className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Lutong-Bahay & Karinderya Only
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pause GrabFood / FoodPanda deliveries. Est. saves ₱350 to ₱500/day.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShoppingBag className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Freeze Online Shopping Carts
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Leave Shopee & Lazada items in cart until the {nextPaydayLabel} salary lands.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Zero Guilt On Non-Essentials
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Delay social outings or coffee shop catchups until next cutoff.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
