"use client";

import React, { useState } from "react";
import { X, Check, ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { TransactionType, PaymentMethod } from "@/types";
import { CurrencyInput } from "../common/CurrencyInput";
import { toast } from "sonner";

interface TransactionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

const NEED_CATEGORIES = [
  "Groceries",
  "Transportation",
  "Electricity",
  "Water",
  "Internet",
  "Rent",
  "Healthcare",
  "Insurance",
  "Family Support",
  "Other Needs",
];

const WANT_CATEGORIES = [
  "Dining Out",
  "Online Shopping",
  "Entertainment",
  "Coffee & Milk Tea",
  "Subscriptions",
  "Travel",
  "Gadgets",
  "Gaming",
  "Other Wants",
];

export function TransactionBottomSheet({
  isOpen,
  onClose,
  defaultType = "need",
}: TransactionBottomSheetProps) {
  const { addTransaction, accounts, nextPayday } = useFinance();

  const [amount, setAmount] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState<string>("Groceries");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");

  React.useEffect(() => {
    if (accounts.length > 0 && (!accountId || !accounts.some((a) => a.id === accountId))) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  React.useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
      setType(defaultType);
      if (defaultType === "income") {
        setCategory("Salary");
      } else if (defaultType === "want") {
        setCategory("Dining Out");
      } else if (defaultType === "loan_payment") {
        setCategory("Debt & Loans");
      } else {
        setCategory("Groceries");
      }
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Please enter a valid transaction amount");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a description or merchant");
      return;
    }

    addTransaction({
      title: title.trim(),
      amount,
      type,
      category,
      payment_method: paymentMethod,
      account_id: accountId || accounts[0]?.id,
      payday_period: nextPayday.period,
      date,
      notes: notes.trim() || undefined,
    });

    toast.success("Transaction added successfully");
    // Reset and close
    setAmount(0);
    setTitle("");
    setNotes("");
    onClose();
  };

  const categories =
    type === "need"
      ? NEED_CATEGORIES
      : type === "want"
      ? WANT_CATEGORIES
      : type === "loan_payment"
      ? ["Credit Card", "Personal Loan", "SSS / Pag-IBIG", "Family Support", "Other Debt"]
      : ["Salary", "Bonus", "Overtime", "Side Hustle", "General"];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200 select-none touch-manipulation cursor-pointer"
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Add Transaction</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Amount
            </label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              autoFocus
              className="py-1"
            />
          </div>

          {/* Type Toggle: Need vs Want vs Debt vs Income */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Category Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType("need");
                  setCategory("Groceries");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-colors min-h-[44px] ${
                  type === "need"
                    ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Need
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("want");
                  setCategory("Dining Out");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-colors min-h-[44px] ${
                  type === "want"
                    ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/20"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Want
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("loan_payment");
                  setCategory("Credit Card");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-colors min-h-[44px] ${
                  type === "loan_payment"
                    ? "bg-teal-600 text-white shadow-xs ring-2 ring-teal-500/20"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Debt & Loans
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setCategory("Salary");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-colors min-h-[44px] ${
                  type === "income"
                    ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Income
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Description / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SM Supermarket Groceries, Grab, Jollibee"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-border/60 rounded-xl bg-muted/20">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-card border border-border text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="debit_card">Debit Card</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Paid From Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (₱{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shared with roommates, receipt saved"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Action buttons */}
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
              disabled={amount <= 0 || !title.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-opacity disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
