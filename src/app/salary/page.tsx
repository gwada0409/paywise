"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  TrendingUp,
  Edit2,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { PaydayPlannerModal } from "@/components/payday/PaydayPlannerModal";
import { IncomeFormModal } from "@/components/income/IncomeFormModal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function SalaryPage() {
  const {
    salarySettings,
    updateSalarySettings,
    incomeRecords,
    nextPayday,
    bills,
  } = useFinance();

  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isRecordIncomeOpen, setIsRecordIncomeOpen] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const [monthlyNet, setMonthlyNet] = useState(salarySettings.monthly_net);
  const [p1Day, setP1Day] = useState(salarySettings.payday_1_day);
  const [p2Day, setP2Day] = useState(salarySettings.payday_2_day);
  const [p1Expected, setP1Expected] = useState(salarySettings.payday_1_expected);
  const [p2Expected, setP2Expected] = useState(salarySettings.payday_2_expected);

  const handleSaveSettings = () => {
    updateSalarySettings({
      monthly_net: monthlyNet,
      payday_1_day: p1Day,
      payday_2_day: p2Day,
      payday_1_expected: p1Expected,
      payday_2_expected: p2Expected,
    });
    setIsEditingSettings(false);
    toast.success("Payday schedule updated.");
  };

  const p1Bills = bills.filter((b) => b.due_day <= 15);
  const p2Bills = bills.filter((b) => b.due_day > 15);
  const p1BillsTotal = p1Bills.reduce((s, b) => s + b.amount, 0);
  const p2BillsTotal = p2Bills.reduce((s, b) => s + b.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17212F] dark:text-white">
              Salary & Payday Tracker
            </h1>
            <p className="text-xs text-[#788493] dark:text-slate-400 mt-0.5">
              15th & 30th semi-monthly schedule management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlannerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full glass-pill px-3.5 py-1.5 text-xs font-bold text-[#4A90FF] hover:bg-white/90 dark:hover:bg-slate-700 active:scale-95"
            >
              Plan Payday
            </button>
            <button
              onClick={() => setIsRecordIncomeOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#4A90FF] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Record Salary
            </button>
          </div>
        </div>

        {/* Schedule Overview Card */}
        <div className="rounded-4xl p-6 bg-white/95 dark:bg-slate-800/95 border border-sky-100/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h2 className="text-sm font-bold text-[#17212F] dark:text-white">
                Semi-Monthly Schedule
              </h2>
              <p className="text-xs text-[#788493]">Configured take-home earnings & cutoff dates</p>
            </div>
            <button
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className="text-xs font-bold text-[#4A90FF] hover:underline flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" />
              {isEditingSettings ? "Cancel" : "Edit"}
            </button>
          </div>

          {isEditingSettings ? (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Monthly Net Salary
                </label>
                <CurrencyInput
                  value={monthlyNet}
                  onChange={(val) => {
                    setMonthlyNet(val);
                    setP1Expected(Math.round(val / 2));
                    setP2Expected(Math.round(val / 2));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    1st Payday (Day)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={p1Day}
                    onChange={(e) => setP1Day(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-3 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    2nd Payday (Day)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={p2Day}
                    onChange={(e) => setP2Day(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-3 py-2 text-sm font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-full bg-[#4A90FF] px-5 py-2 text-xs font-bold text-white shadow-xs"
              >
                Save Schedule
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] text-[#788493]">Monthly Take-Home</span>
                <div className="mt-0.5">
                  <CurrencyDisplay amount={salarySettings.monthly_net} size="base" weight="bold" />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#788493]">1st Cutoff</span>
                <p className="font-bold text-sm text-[#17212F] dark:text-white mt-0.5">
                  Day {salarySettings.payday_1_day} (₱{salarySettings.payday_1_expected.toLocaleString()})
                </p>
              </div>

              <div>
                <span className="text-[11px] text-[#788493]">2nd Cutoff</span>
                <p className="font-bold text-sm text-[#17212F] dark:text-white mt-0.5">
                  Day {salarySettings.payday_2_day} (₱{salarySettings.payday_2_expected.toLocaleString()})
                </p>
              </div>

              <div>
                <span className="text-[11px] text-[#788493]">Next Payday</span>
                <p className="font-bold text-sm text-[#4A90FF] mt-0.5">
                  {nextPayday.daysRemaining} Days ({nextPayday.label})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PAYDAY 1 VS PAYDAY 2 CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-4xl p-5 bg-[#DDF3FF] dark:bg-slate-800/95 border border-sky-200/60 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-bold text-ref-blue">
              1st Payday (Day {salarySettings.payday_1_day})
            </span>
            <div className="mt-2">
              <CurrencyDisplay amount={salarySettings.payday_1_expected} size="2xl" weight="bold" />
            </div>
            <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-slate-700 text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Needs (50%):</span>
                <span className="tabular-nums font-bold">₱{(salarySettings.payday_1_expected * 0.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Wants (30%):</span>
                <span className="tabular-nums font-bold">₱{(salarySettings.payday_1_expected * 0.3).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Savings (20%):</span>
                <span className="tabular-nums font-bold">₱{(salarySettings.payday_1_expected * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold pt-1">
                <span>Bills in 1st Half:</span>
                <span className="tabular-nums font-bold">₱{p1BillsTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-4xl p-5 bg-[#DDF3FF] dark:bg-slate-800/95 border border-sky-200/60 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-bold text-ref-blue">
              2nd Payday (Day {salarySettings.payday_2_day})
            </span>
            <div className="mt-2">
              <CurrencyDisplay amount={salarySettings.payday_2_expected} size="2xl" weight="bold" />
            </div>
            <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-slate-700 text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Needs (50%):</span>
                <span className="tabular-nums font-bold">₱{(salarySettings.payday_2_expected * 0.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Wants (30%):</span>
                <span className="tabular-nums font-bold">₱{(salarySettings.payday_2_expected * 0.3).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Savings (20%):</span>
                <span className="tabular-nums font-bold">₱{(salarySettings.payday_2_expected * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold pt-1">
                <span>Bills in 2nd Half:</span>
                <span className="tabular-nums font-bold">₱{p2BillsTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Received Salary History */}
        <div className="rounded-4xl p-5 bg-white/95 dark:bg-slate-800/95 border border-sky-100/80 dark:border-slate-700 shadow-xs">
          <h2 className="text-xs font-semibold text-ref-muted mb-3">
            Received Salary History
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {incomeRecords.map((inc) => (
              <div key={inc.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#17212F] dark:text-white">
                    {inc.type === "salary" ? "Regular Salary" : inc.type} ({inc.payday_period})
                  </p>
                  <p className="text-xs text-[#788493]">
                    {formatDate(inc.date)} {inc.notes && `• ${inc.notes}`}
                  </p>
                </div>
                <CurrencyDisplay amount={inc.amount} size="sm" weight="bold" type="income" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <PaydayPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
      />
      <IncomeFormModal
        isOpen={isRecordIncomeOpen}
        onClose={() => setIsRecordIncomeOpen(false)}
      />
    </AppShell>
  );
}
