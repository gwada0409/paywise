"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  TrendingUp,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Clock,
  Edit2,
  ShieldCheck,
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
    savingsGoals,
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

  // Bills due between 1st-15th (Payday 1) and 16th-end (Payday 2)
  const p1Bills = bills.filter((b) => b.due_day <= 15);
  const p2Bills = bills.filter((b) => b.due_day > 15);
  const p1BillsTotal = p1Bills.reduce((s, b) => s + b.amount, 0);
  const p2BillsTotal = p2Bills.reduce((s, b) => s + b.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <CalendarDays className="h-7 w-7 text-primary" />
              Salary & Payday Tracker
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Manage your semi-monthly paydays, expected payouts, and cash allocations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlannerOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 active:scale-95 transition-all min-h-[44px]"
            >
              Plan This Payday
            </button>
            <button
              onClick={() => setIsRecordIncomeOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              Record Received Salary
            </button>
          </div>
        </div>

        {/* Schedule Configuration Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-foreground">Semi-Monthly Payroll Schedule</h2>
              <p className="text-xs text-muted-foreground">
                Configured take-home net earnings and cutoff dates.
              </p>
            </div>
            <button
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-95"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditingSettings ? "Cancel" : "Edit Schedule"}
            </button>
          </div>

          {isEditingSettings ? (
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Monthly Net Take-Home Salary
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    1st Payday (Day of Month)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={p1Day}
                    onChange={(e) => setP1Day(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    2nd Payday (Day of Month)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={p2Day}
                    onChange={(e) => setP2Day(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    1st Payday Payout
                  </label>
                  <CurrencyInput value={p1Expected} onChange={setP1Expected} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    2nd Payday Payout
                  </label>
                  <CurrencyInput value={p2Expected} onChange={setP2Expected} />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Net Salary</p>
                <CurrencyDisplay amount={salarySettings.monthly_net} size="lg" weight="bold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">1st Payday Schedule</p>
                <p className="font-semibold text-foreground">
                  Day {salarySettings.payday_1_day} (₱{salarySettings.payday_1_expected.toLocaleString()})
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">2nd Payday Schedule</p>
                <p className="font-semibold text-foreground">
                  Day {salarySettings.payday_2_day} (₱{salarySettings.payday_2_expected.toLocaleString()})
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Scheduled Payday</p>
                <p className="font-semibold text-primary">{nextPayday.label} ({nextPayday.daysRemaining} days)</p>
              </div>
            </div>
          )}
        </div>

        {/* PAYDAY 1 VS PAYDAY 2 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payday 1 Card */}
          <div className="rounded-3xl border border-blue-500/20 bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                1st Payday Cutoff (Day {salarySettings.payday_1_day})
              </span>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                1st Half of Month
              </span>
            </div>

            <div className="mt-3">
              <p className="text-xs text-muted-foreground">Expected Salary</p>
              <CurrencyDisplay amount={salarySettings.payday_1_expected} size="2xl" weight="bold" />
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Needs (50%):</span>
                <span className="font-mono font-semibold">₱{(salarySettings.payday_1_expected * 0.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Wants (30%):</span>
                <span className="font-mono font-semibold">₱{(salarySettings.payday_1_expected * 0.3).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Savings (20%):</span>
                <span className="font-mono font-semibold">₱{(salarySettings.payday_1_expected * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Bills Due in 1st Half:</span>
                <span className="font-mono font-bold text-amber-600">₱{p1BillsTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payday 2 Card */}
          <div className="rounded-3xl border border-purple-500/20 bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                2nd Payday Cutoff (Day {salarySettings.payday_2_day})
              </span>
              <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-600">
                2nd Half of Month
              </span>
            </div>

            <div className="mt-3">
              <p className="text-xs text-muted-foreground">Expected Salary</p>
              <CurrencyDisplay amount={salarySettings.payday_2_expected} size="2xl" weight="bold" />
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Needs (50%):</span>
                <span className="font-mono font-semibold">₱{(salarySettings.payday_2_expected * 0.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Wants (30%):</span>
                <span className="font-mono font-semibold">₱{(salarySettings.payday_2_expected * 0.3).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Savings (20%):</span>
                <span className="font-mono font-semibold">₱{(salarySettings.payday_2_expected * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Bills Due in 2nd Half:</span>
                <span className="font-mono font-bold text-amber-600">₱{p2BillsTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary History Table */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-base font-bold text-foreground mb-4">Received Salary History</h2>

          <div className="divide-y divide-border/60">
            {incomeRecords.map((inc) => (
              <div key={inc.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {inc.type === "salary" ? "Regular Salary" : inc.type} ({inc.payday_period})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(inc.date)} {inc.notes && `• ${inc.notes}`}
                    </p>
                  </div>
                </div>

                <CurrencyDisplay amount={inc.amount} size="base" weight="bold" type="income" />
              </div>
            ))}

            {incomeRecords.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No received salary logged yet. Click &quot;Record Received Salary&quot; when your paycheck credits.
              </p>
            )}
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
