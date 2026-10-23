"use client";

import React, { useState, useMemo } from "react";
import { X, Check, CalendarDays, Coins, Plus, Landmark, Wallet } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyInput } from "../common/CurrencyInput";
import { PaydayPeriod, AccountType } from "@/types";
import { toast } from "sonner";

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
  const { recordSalaryIncome, accounts, addAccount } = useFinance();

  const [amount, setAmount] = useState<number>(defaultAmount);
  const [period, setPeriod] = useState<PaydayPeriod>(defaultPeriod);
  const [type, setType] = useState<"salary" | "bonus" | "overtime" | "other">("salary");
  const [accountId, setAccountId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");

  // Quick inline add new account
  const [isAddingNewAccount, setIsAddingNewAccount] = useState<boolean>(false);
  const [newAccountName, setNewAccountName] = useState<string>("");
  const [newAccountType, setNewAccountType] = useState<AccountType>("bank");

  // Deduplicate accounts by clean name (guarantees zero duplicate "Cash on Hand")
  const uniqueAccounts = useMemo(() => {
    const seen = new Set<string>();
    return accounts.filter((a) => {
      const key = (a.name || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [accounts]);

  React.useEffect(() => {
    if (uniqueAccounts.length > 0 && (!accountId || !uniqueAccounts.some((a) => a.id === accountId))) {
      // Prioritize MariBank, Bank accounts, or GCash/Maya for salary deposits
      const preferred = uniqueAccounts.find(
        (a) =>
          a.name.toLowerCase().includes("mari") ||
          a.name.toLowerCase().includes("gcash") ||
          a.name.toLowerCase().includes("maya") ||
          a.type === "bank"
      );
      setAccountId(preferred?.id || uniqueAccounts[0].id);
    }
  }, [uniqueAccounts, accountId]);

  if (!isOpen) return null;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newAccountName.trim()) {
      toast.error("Please enter an account name");
      return;
    }

    addAccount({
      name: newAccountName.trim(),
      type: newAccountType,
      balance: 0,
      is_default: false,
    });

    toast.success(`Added ${newAccountName.trim()} to your accounts!`);
    setNewAccountName("");
    setIsAddingNewAccount(false);
  };

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Credited To Account
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewAccount(!isAddingNewAccount)}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" />
                  New
                </button>
              </div>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                {uniqueAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
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

          {/* Inline Add New Account Mini-Form */}
          {isAddingNewAccount && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5" />
                  Add New E-Wallet or Bank
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNewAccount(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. MariBank, GoTyme, GrabPay"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value as AccountType)}
                  className="w-full rounded-xl border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bank">Digital / Traditional Bank</option>
                  <option value="gcash">GCash E-Wallet</option>
                  <option value="maya">Maya E-Wallet</option>
                  <option value="cash">Physical Cash</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCreateAccount}
                className="w-full py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs active:scale-98 transition-transform"
              >
                Save & Select Account
              </button>
            </div>
          )}

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
