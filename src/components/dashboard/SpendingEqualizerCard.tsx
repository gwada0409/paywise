"use client";

import React from "react";
import Link from "next/link";
import { Utensils, Plane, ShoppingBag, Sparkles } from "lucide-react";
import { CurrencyDisplay } from "../common/CurrencyDisplay";

interface SpendingEqualizerCardProps {
  category: string;
  amount: number;
  status: "NORMAL" | "MODERATE" | "OVER LIMIT";
  colorTheme: "yellow" | "coral" | "green";
  bars?: number[];
  href?: string;
  onClick?: () => void;
}

export function SpendingEqualizerCard({
  category,
  amount,
  status,
  colorTheme,
  bars = [40, 65, 85, 50, 70, 95, 60, 45, 80, 55, 90, 75],
  href,
  onClick,
}: SpendingEqualizerCardProps) {
  const themeColors = {
    yellow: {
      bar: "bg-amber-400 dark:bg-amber-500",
      bg: "bg-white/95 dark:bg-slate-900/90",
      badge: "text-amber-800 bg-amber-500/15 border-amber-500/20 dark:text-amber-300",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    coral: {
      bar: "bg-rose-400 dark:bg-rose-500",
      bg: "bg-white/95 dark:bg-slate-900/90",
      badge: "text-rose-800 bg-rose-500/15 border-rose-500/20 dark:text-rose-300",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    green: {
      bar: "bg-emerald-400 dark:bg-emerald-500",
      bg: "bg-white/95 dark:bg-slate-900/90",
      badge: "text-emerald-800 bg-emerald-500/15 border-emerald-500/20 dark:text-emerald-300",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  }[colorTheme];

  const getIcon = () => {
    const cat = category.toLowerCase();
    if (cat.includes("food") || cat.includes("dining")) return <Utensils className="h-3.5 w-3.5" />;
    if (cat.includes("travel") || cat.includes("transport")) return <Plane className="h-3.5 w-3.5" />;
    return <ShoppingBag className="h-3.5 w-3.5" />;
  };

  const content = (
    <div className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-full ${themeColors.bg} transition-all duration-200 group-hover:border-primary/40`}>
      {/* Category Header with Icon */}
      <div className="flex items-center justify-center gap-1.5">
        <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg ${themeColors.iconBg}`}>
          {getIcon()}
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
          {category}
        </span>
      </div>

      {/* Mini Equalizer Waveform Chart */}
      <div className="my-2.5 sm:my-3.5 flex items-end justify-center gap-0.5 sm:gap-1 h-9 sm:h-11 px-1">
        {bars.map((heightPct, idx) => (
          <div
            key={idx}
            className={`w-1 sm:w-1.5 rounded-full ${themeColors.bar} transition-all duration-300 opacity-90 group-hover:opacity-100`}
            style={{ height: `${Math.max(12, heightPct)}%` }}
          />
        ))}
      </div>

      {/* Amount and Status Badge */}
      <div className="text-center pt-1.5 border-t border-slate-100 dark:border-slate-800">
        <div className="tabular-nums text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
          <CurrencyDisplay amount={amount} size="sm" weight="bold" />
        </div>
        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold border ${themeColors.badge}`}>
          {status}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block active:scale-95 transition-transform touch-manipulation cursor-pointer group"
      >
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left w-full active:scale-95 transition-transform touch-manipulation cursor-pointer group"
      >
        {content}
      </button>
    );
  }

  return content;
}
