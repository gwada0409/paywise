"use client";

import React, { useState } from "react";
import { X, Check, CreditCard } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyInput } from "../common/CurrencyInput";

interface LoanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoanFormModal({ isOpen, onClose }: LoanFormModalProps) {
  const { addLoan } = useFinance();

  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [principal, setPrincipal] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [nextDueDate, setNextDueDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !lender.trim() || principal <= 0) return;

    addLoan({
      name: name.trim(),
      lender: lender.trim(),
      principal,
      current_balance: currentBalance > 0 ? currentBalance : principal,
      interest_rate: interestRate,
      interest_type: interestRate > 0 ? "fixed" : "zero",
      monthly_payment: monthlyPayment,
      next_due_date: nextDueDate || undefined,
      payment_frequency: "monthly",
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-foreground">Add Loan / Debt</h2>
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
              Loan / Debt Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SSS Salary Loan, Home Credit, Bank Loan"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Lender / Institution
            </label>
            <input
              type="text"
              required
              value={lender}
              onChange={(e) => setLender(e.target.value)}
              placeholder="e.g. SSS, BDO, Family, Store"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Original Principal
              </label>
              <CurrencyInput value={principal} onChange={setPrincipal} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Current Balance
              </label>
              <CurrencyInput
                value={currentBalance === 0 && principal > 0 ? principal : currentBalance}
                onChange={setCurrentBalance}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Monthly Installment
              </label>
              <CurrencyInput value={monthlyPayment} onChange={setMonthlyPayment} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm tabular-nums font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Next Due Date
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
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
              disabled={principal <= 0 || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-opacity min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              Save Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
