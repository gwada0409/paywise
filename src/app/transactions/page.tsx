"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import { formatDate } from "@/lib/utils";

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useFinance();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedType !== "all" && tx.type !== selectedType) {
        return false;
      }

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
      <div className="space-y-6 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17212F] dark:text-white">
              Transactions & Activity
            </h1>
            <p className="text-xs text-[#788493] dark:text-slate-400 mt-0.5">
              Review daily cash flow and classified spending.
            </p>
          </div>

          <button
            onClick={() => setIsAddTxOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#4A90FF] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[40px]"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-3xl p-4 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4A90FF] min-h-[40px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {["all", "need", "want", "income", "bill_payment"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-full px-3 py-1 font-semibold transition-all text-[11px] ${
                  selectedType === t
                    ? "bg-[#DDF3FF] text-[#4A90FF] font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {t === "all" ? "All Types" : t.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="rounded-4xl p-5 bg-white/95 dark:bg-slate-800/95 border border-sky-100/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-xs font-semibold text-ref-muted">
              {filteredTransactions.length} record{filteredTransactions.length === 1 ? "" : "s"}
            </h2>
            <div className="text-xs text-ref-muted">
              Net: <CurrencyDisplay amount={totalFilteredAmount} colored size="sm" weight="bold" />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-ref-navy dark:text-white truncate">
                      {tx.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                        tx.type === "need"
                          ? "bg-sky-50 text-sky-800"
                          : tx.type === "want"
                          ? "bg-amber-50 text-amber-800"
                          : tx.type === "income"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {tx.type.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-ref-muted mt-0.5 truncate">
                    {formatDate(tx.date)} • {tx.payment_method} • {tx.category}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <CurrencyDisplay
                    amount={tx.amount}
                    type={tx.type === "income" ? "income" : "expense"}
                    size="sm"
                    weight="bold"
                  />
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
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
