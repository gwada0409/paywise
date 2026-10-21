"use client";

import React, { useState } from "react";
import { X, Check, Receipt } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyInput } from "../common/CurrencyInput";
import { BillRecurrence } from "@/types";

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillFormModal({ isOpen, onClose }: BillFormModalProps) {
  const { addBill, accounts } = useFinance();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [dueDay, setDueDay] = useState<number>(15);
  const [recurrence, setRecurrence] = useState<BillRecurrence>("monthly");
  const [category, setCategory] = useState("Electricity");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0) return;

    addBill({
      name: name.trim(),
      amount,
      due_day: dueDay,
      recurrence,
      category,
      account_id: accounts[0]?.id,
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Receipt className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-foreground">Add Upcoming Bill</h2>
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
              Bill Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meralco, PLDT, Manila Water"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Bill Amount
            </label>
            <CurrencyInput value={amount} onChange={setAmount} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Due Day of Month
              </label>
              <div className="flex items-center rounded-xl border border-input bg-card px-3 py-2 min-h-[44px]">
                <span className="text-xs font-semibold text-muted-foreground mr-1.5">Day</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                  className="w-full bg-transparent tabular-nums text-sm font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as BillRecurrence)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
                <option value="one_time">One-Time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Internet">Internet & Telecom</option>
              <option value="Rent">Rent & Housing</option>
              <option value="Insurance">Insurance</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Credit Card">Credit Card Bill</option>
              <option value="Other">Other Bill</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Notes (Account Number, Plan, etc.)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Account # 0123456789"
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
              disabled={amount <= 0 || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-opacity min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              Save Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
