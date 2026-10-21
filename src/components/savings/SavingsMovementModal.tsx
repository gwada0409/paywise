"use client";

import React, { useState } from "react";
import { X, Check, PiggyBank, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyInput } from "../common/CurrencyInput";
import { SavingsGoal } from "@/types";

interface SavingsMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
}

export function SavingsMovementModal({
  isOpen,
  onClose,
  goal,
}: SavingsMovementModalProps) {
  const { savingsGoals, recordSavingsTransfer, accounts } = useFinance();

  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goal?.id || savingsGoals[0]?.id || ""
  );
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "");

  if (!isOpen) return null;

  const activeGoal = savingsGoals.find((g) => g.id === (goal?.id || selectedGoalId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !activeGoal) return;

    recordSavingsTransfer(activeGoal.id, amount, type, accountId);
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
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {type === "deposit" ? "Deposit to Goal" : "Withdraw from Goal"}
              </h2>
              {activeGoal && (
                <p className="text-xs text-muted-foreground">{activeGoal.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Movement Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("deposit")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all min-h-[44px] ${
                type === "deposit"
                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              Deposit (Save)
            </button>
            <button
              type="button"
              onClick={() => setType("withdrawal")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all min-h-[44px] ${
                type === "withdrawal"
                  ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/20"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Withdraw
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Target Savings Goal
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              {savingsGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (Saved: ₱{g.current_amount.toLocaleString()} / ₱{g.target_amount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Transfer Amount
            </label>
            <CurrencyInput value={amount} onChange={setAmount} autoFocus />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {type === "deposit" ? "Source Account" : "Destination Account"}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: ₱{acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
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
              disabled={amount <= 0 || !activeGoal}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-opacity min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
