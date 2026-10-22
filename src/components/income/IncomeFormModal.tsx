"use client";

import React, { useState } from "react";
import { X, Check, CalendarDays, Coins } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyInput } from "../common/CurrencyInput";
import { PaydayPeriod } from "@/types";

interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPeriod?: PaydayPeriod;
  defaultAmount?: number;
}

export function IncomeFormModal({
  isOpen,
  onClose,
  defaultPeriod = "payday_1",
  defaultAmount = 15000,
}: IncomeFormModalProps) {
  const { recordSalaryIncome, accounts } = useFinance();

  const [amount, setAmount] = useState<number>(defaultAmount);
  const [period, setPeriod] = useState<PaydayPeriod>(defaultPeriod);
  const [type, setType] = useState<"salary" | "bonus" | "overtime" | "other">("salary");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");

  React.useEffect(() => {
    if (accounts.length > 0 && (!accountId || !accounts.some((a) => a.id === accountId))) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    recordSalaryIncome({
      amount,
      date,
      payday_period: period,
      type,
      account_id: accountId || accounts[0]?.id,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200 select-none touch-manipulation cursor-pointer"
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Coins className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-foreground">Record Salary Income</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Net Amount Credited
            </label>
            <CurrencyInput value={amount} onChange={setAmount} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Payday Cycle
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PaydayPeriod)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                <option value="payday_1">1st Payday (15th)</option>
                <option value="payday_2">2nd Payday (30th)</option>
                <option value="bonus">13th Month / Bonus</option>
                <option value="other">Other Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Income Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                <option value="salary">Base Salary</option>
                <option value="overtime">Overtime Pay</option>
                <option value="bonus">Bonus / Incentive</option>
                <option value="other">Side Hustle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Credited To Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Credit Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1st cutoff salary, tax deductions applied"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted/50 active:scale-95 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-opacity min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              Confirm Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
