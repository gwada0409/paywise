"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CurrencyDisplay } from "../common/CurrencyDisplay";

interface DonutSegment {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface AIFinancialDonutCardProps {
  totalAmount: number;
  segments?: DonutSegment[];
  caption?: string;
}

const DEFAULT_SEGMENTS: DonutSegment[] = [
  { name: "Available Cash", value: 30, percentage: 30, color: "#2F7A45" }, // deep green
  { name: "Needs (Bills & Food)", value: 25, percentage: 25, color: "#45C97A" }, // reference green
  { name: "Savings Goals", value: 15, percentage: 15, color: "#70D6F7" }, // cyan
  { name: "Wants & Dining", value: 15, percentage: 15, color: "#BCE7FF" }, // soft blue
  { name: "Obligations / Debt", value: 10, percentage: 10, color: "#A3E635" }, // lime green
  { name: "Emergency Buffer", value: 5, percentage: 5, color: "#D9F99D" }, // soft lime
];

export function AIFinancialDonutCard({
  totalAmount = 8278,
  segments = DEFAULT_SEGMENTS,
  caption = "And this is an explanation of the graphic above regarding the distribution of your funds.",
}: AIFinancialDonutCardProps) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-xs my-3">
      {/* Donut Chart with Centered Total Funds */}
      <div className="relative h-60 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={95}
              paddingAngle={2}
            >
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Funds Text (Reference 2 Left Phone) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] font-semibold text-slate-400">Total Funds</span>
          <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
            <CurrencyDisplay amount={totalAmount} size="base" weight="bold" />
          </span>
        </div>
      </div>

      {/* Percentage Indicators Breakdown */}
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px]">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="tabular-nums font-bold">{s.percentage}%</span>
            <span className="truncate max-w-[70px]">{s.name}</span>
          </div>
        ))}
      </div>

      {/* Caption text below */}
      <p className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {caption}
      </p>
    </div>
  );
}
