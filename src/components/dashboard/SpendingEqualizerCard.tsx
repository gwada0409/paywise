"use client";

import React from "react";
import Link from "next/link";
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
      bar: "bg-[#F5CA46]",
      bg: "bg-white/90 dark:bg-slate-800/90",
      badge: "text-[#B48408] bg-[#FEF3C7] dark:bg-[#785406]/30 dark:text-[#FDE68A]",
    },
    coral: {
      bar: "bg-[#EF6B6B]",
      bg: "bg-white/90 dark:bg-slate-800/90",
      badge: "text-[#DC2626] bg-[#FEE2E2] dark:bg-[#991B1B]/30 dark:text-[#FCA5A5]",
    },
    green: {
      bar: "bg-[#45C97A]",
      bg: "bg-white/90 dark:bg-slate-800/90",
      badge: "text-[#059669] bg-[#D1FAE5] dark:bg-[#065F46]/30 dark:text-[#6EE7B7]",
    },
  }[colorTheme];

  const content = (
    <div className={`rounded-3xl p-4.5 border border-sky-100/70 dark:border-slate-700/60 shadow-xs flex flex-col justify-between h-full ${themeColors.bg} transition-[border-color,box-shadow,transform]`}>
      {/* Category Name */}
      <div className="text-center">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {category}
        </span>
      </div>

      {/* Mini Equalizer Waveform Chart */}
      <div className="my-3.5 flex items-end justify-center gap-1 h-12 px-1">
        {bars.map((heightPct, idx) => (
          <div
            key={idx}
            className={`w-1 sm:w-1.5 rounded-full ${themeColors.bar} transition-[height] duration-300`}
            style={{ height: `${heightPct}%` }}
          />
        ))}
      </div>

      {/* Amount and Status Badge */}
      <div className="text-center pt-1 border-t border-slate-100/60 dark:border-slate-700/60">
        <div className="tabular-nums text-sm font-extrabold text-ref-navy">
          <CurrencyDisplay amount={amount} size="sm" weight="bold" />
        </div>
        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${themeColors.badge}`}>
          {status}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block active:scale-[0.96] transition-transform touch-manipulation cursor-pointer group"
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
        className="text-left w-full active:scale-[0.96] transition-transform touch-manipulation cursor-pointer group"
      >
        {content}
      </button>
    );
  }

  return content;
}
