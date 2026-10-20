"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import { formatDate } from "@/lib/utils";
import { TransactionType } from "@/types";

export default function TransactionsPage() {
  const { transactions, deleteTransaction, accounts } = useFinance();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const matchesSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Type filter
      if (selectedType !== "all" && tx.type !== selectedType) {
        return false;
      }

      // Method filter
      if (selectedMethod !== "all" && tx.payment_method !== selectedMethod) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, selectedType, selectedMethod]);

  const totalFilteredAmount = filteredTransactions.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0
  );

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <ArrowLeftRight className="h-7 w-7 text-primary" />
              Transactions & Activity
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Track everyday spending, Needs vs Wants, and income logs.
            </p>
          </div>

          <button
            onClick={() => setIsAddTxOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or note..."
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground mr-1">Type:</span>
            {["all", "need", "want", "income", "bill_payment"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                  selectedType === t
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t === "all" ? "All Types" : t.replace("_", " ").toUpperCase()}
              </button>
            ))}

            <div className="hidden sm:block h-4 w-px bg-border mx-1" />

            <span className="font-semibold text-muted-foreground mr-1 hidden sm:inline">Method:</span>
            {["all", "gcash", "maya", "cash", "bank"].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                  selectedMethod === m
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {m === "all" ? "All Methods" : m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">
              {filteredTransactions.length} Record{filteredTransactions.length === 1 ? "" : "s"}
            </h2>
            <div className="text-xs text-muted-foreground">
              Net:{" "}
              <CurrencyDisplay
                amount={totalFilteredAmount}
                colored
                size="sm"
                weight="bold"
              />
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {filteredTransactions.map((tx) => {
              const typeColor =
                tx.type === "need"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : tx.type === "want"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  : tx.type === "income"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${typeColor}`}
                    >
                      {tx.type.replace("_", " ")}
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {tx.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDate(tx.date)} • {tx.payment_method.toUpperCase()} • {tx.category}
                        {tx.notes && ` • "${tx.notes}"`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <CurrencyDisplay
                      amount={tx.amount}
                      type={tx.type === "income" ? "income" : "expense"}
                      size="base"
                      weight="bold"
                    />

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Delete transaction"
                      className="opacity-60 hover:opacity-100 text-muted-foreground hover:text-rose-600 p-1 rounded-lg transition-all active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No transactions match your current search or filter.
              </p>
            )}
          </div>
        </div>
      </div>

      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
    </AppShell>
  );
}
