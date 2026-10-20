"use client";

import React, { useState } from "react";
import { X, Check, CalendarDays, AlertTriangle, ShieldCheck, Receipt } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "../common/CurrencyDisplay";
import { CurrencyInput } from "../common/CurrencyInput";
import { roundMoney } from "@/lib/utils";

interface PaydayPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaydayPlannerModal({ isOpen, onClose }: PaydayPlannerModalProps) {
  const {
    salarySettings,
    budgetRules,
    nextPayday,
    bills,
    planPayday,
  } = useFinance();

  const [receivedAmount, setReceivedAmount] = useState<number>(nextPayday.expectedAmount || 15000);

  // Unpaid bills before next payday
  const upcomingBills = bills.filter((b) => b.status !== "paid");
  const upcomingBillsTotal = upcomingBills.reduce((sum, b) => sum + b.amount, 0);

  // Suggested 50/30/20 split
  const defaultNeeds = roundMoney((receivedAmount * (budgetRules.needs_percent || 50)) / 100);
  const defaultWants = roundMoney((receivedAmount * (budgetRules.wants_percent || 30)) / 100);
  const defaultSavings = roundMoney((receivedAmount * (budgetRules.savings_percent || 20)) / 100);

  const [needsAlloc, setNeedsAlloc] = useState<number>(defaultNeeds);
  const [wantsAlloc, setWantsAlloc] = useState<number>(defaultWants);
  const [savingsAlloc, setSavingsAlloc] = useState<number>(defaultSavings);

  if (!isOpen) return null;

  const totalAllocated = roundMoney(needsAlloc + wantsAlloc + savingsAlloc);
  const remainingUnallocated = roundMoney(receivedAmount - totalAllocated);

  // Remaining flexible spending after reserving upcoming bills
  const flexibleAfterBills = roundMoney(receivedAmount - upcomingBillsTotal - savingsAlloc);
  const isDeficit = flexibleAfterBills < 0;

  const handleSave = () => {
    planPayday({
      needs: needsAlloc,
      wants: wantsAlloc,
      savings: savingsAlloc,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Smart Payday Planner</h2>
              <p className="text-xs text-muted-foreground">{nextPayday.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Salary received input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Salary Received for this Payday
            </label>
            <CurrencyInput
              value={receivedAmount}
              onChange={(val) => {
                setReceivedAmount(val);
                setNeedsAlloc(roundMoney((val * (budgetRules.needs_percent || 50)) / 100));
                setWantsAlloc(roundMoney((val * (budgetRules.wants_percent || 30)) / 100));
                setSavingsAlloc(roundMoney((val * (budgetRules.savings_percent || 20)) / 100));
              }}
            />
          </div>

          {/* Reserved Upcoming Bills Card */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-foreground">
                  Upcoming Unpaid Bills Before Next Payday
                </span>
              </div>
              <CurrencyDisplay amount={upcomingBillsTotal} size="sm" weight="bold" />
            </div>

            <div className="mt-2.5 space-y-1.5 max-h-28 overflow-y-auto">
              {upcomingBills.map((b) => (
                <div key={b.id} className="flex justify-between text-xs text-muted-foreground">
                  <span>{b.name} (Due day {b.due_day})</span>
                  <span className="font-mono font-medium text-foreground">₱{b.amount.toLocaleString()}</span>
                </div>
              ))}
              {upcomingBills.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No upcoming unpaid bills in this cycle.</p>
              )}
            </div>
          </div>

          {/* Flexible Cash Forecast */}
          <div className={`rounded-2xl border p-4 ${
            isDeficit
              ? "border-rose-500/25 bg-rose-500/5"
              : "border-emerald-500/25 bg-emerald-500/5"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDeficit ? (
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                )}
                <span className="text-xs font-bold text-foreground">
                  Flexible Spendable Money After Bills & Savings
                </span>
              </div>
              <CurrencyDisplay
                amount={flexibleAfterBills}
                size="base"
                weight="bold"
                type={isDeficit ? "expense" : "income"}
              />
            </div>
            {isDeficit && (
              <p className="mt-2 text-xs font-medium text-rose-600">
                Warning: Your upcoming bills and savings target exceed this payday&apos;s payout by ₱{Math.abs(flexibleAfterBills).toLocaleString()}. Adjust savings or postpone non-urgent bills.
              </p>
            )}
          </div>

          {/* Allocation Breakdown */}
          <div className="space-y-3 pt-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Payday Distribution</span>
              <span>
                Remaining: <span className="font-mono">₱{remainingUnallocated.toLocaleString()}</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-blue-500/20 bg-card p-3 text-center">
                <span className="text-[11px] font-bold text-blue-600">Needs (50%)</span>
                <input
                  type="number"
                  value={needsAlloc}
                  onChange={(e) => setNeedsAlloc(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent tabular-nums text-center text-sm font-bold text-foreground focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-card p-3 text-center">
                <span className="text-[11px] font-bold text-amber-700">Wants (30%)</span>
                <input
                  type="number"
                  value={wantsAlloc}
                  onChange={(e) => setWantsAlloc(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent tabular-nums text-center text-sm font-bold text-foreground focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-card p-3 text-center">
                <span className="text-[11px] font-bold text-emerald-600">Savings (20%)</span>
                <input
                  type="number"
                  value={savingsAlloc}
                  onChange={(e) => setSavingsAlloc(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent tabular-nums text-center text-sm font-bold text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              Activate Payday Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
