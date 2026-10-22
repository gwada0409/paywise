"use client";

import React from "react";
import { X, Trash2, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Tag, FileText, CheckCircle2 } from "lucide-react";
import { FinancialTransaction } from "@/types";
import { CurrencyDisplay } from "../common/CurrencyDisplay";
import { formatDate } from "@/lib/utils";
import { useFinance } from "@/lib/store/finance-context";
import { toast } from "sonner";

interface TransactionDetailModalProps {
  transaction: FinancialTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  const { deleteTransaction, accounts } = useFinance();

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === "income";
  const account = accounts.find((a) => a.id === transaction.account_id);

  const handleDelete = () => {
    if (confirm(`Delete transaction "${transaction.title}"?`)) {
      deleteTransaction(transaction.id);
      toast.success("Transaction deleted");
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 select-none touch-manipulation cursor-pointer"
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe cursor-default space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isIncome
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-500/15 text-ref-blue"
              }`}
            >
              {isIncome ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Transaction Details</h2>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                {transaction.type.replace("_", " ")}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 active:scale-[0.96] transition-transform"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount & Title Hero */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 text-center border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Amount</p>
          <CurrencyDisplay
            amount={transaction.amount}
            type={isIncome ? "income" : "expense"}
            size="3xl"
            weight="bold"
            className="text-2xl sm:text-3xl font-extrabold"
          />
          <h3 className="mt-2 text-base font-bold text-foreground truncate px-2">
            {transaction.title}
          </h3>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-ref-blue" /> Date
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Tag className="h-3.5 w-3.5 text-amber-500" /> Category
            </span>
            <span className="font-bold text-foreground">
              {transaction.category}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <CreditCard className="h-3.5 w-3.5 text-emerald-500" /> Payment Method
            </span>
            <span className="font-bold text-foreground uppercase tracking-wider">
              {transaction.payment_method.replace("_", " ")}
            </span>
          </div>

          {account && (
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" /> Account
              </span>
              <span className="font-bold text-foreground">
                {account.name} (₱{account.balance.toLocaleString()})
              </span>
            </div>
          )}

          {transaction.notes && (
            <div className="py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium mb-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> Notes
              </span>
              <p className="font-medium text-foreground text-xs bg-muted/40 p-2.5 rounded-xl">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-4 py-2.5 text-xs font-bold hover:bg-rose-100/50 active:scale-[0.96] transition-transform min-h-[44px]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 text-xs font-bold active:scale-[0.96] transition-transform min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
