"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Plus,
  Search,
  Trash2,
  Camera,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import { ReceiptScannerModal } from "@/components/receipts/ReceiptScannerModal";
import { formatDate } from "@/lib/utils";

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useFinance();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-sky-500/15 via-indigo-500/15 to-purple-500/15 border border-sky-500/30 px-3.5 py-2 text-xs font-bold text-sky-700 dark:text-sky-300 shadow-xs hover:bg-sky-500/20 active:scale-95 transition-all min-h-[40px]"
            >
              <Camera className="h-4 w-4 text-sky-500" />
              <span>Scan OCR</span>
            </button>
            <button
              onClick={() => setIsAddTxOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#4A90FF] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[40px]"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>
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
                    ? "bg-[#DDF3FF] dark:bg-slate-700 text-[#4A90FF] dark:text-sky-300 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t === "all" ? "All Types" : t.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="rounded-[28px] p-4.5 sm:p-5 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? "" : "s"}
            </h2>
            <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <span>Net:</span>
              <CurrencyDisplay amount={totalFilteredAmount} colored size="sm" weight="bold" />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 group">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold capitalize ${
                        tx.type === "need"
                          ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                          : tx.type === "want"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          : tx.type === "income"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          : "bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20"
                      }`}
                    >
                      {tx.type.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {formatDate(tx.date)} • <span className="font-semibold text-slate-700 dark:text-slate-300">{tx.payment_method.toUpperCase()}</span> • {tx.category}
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
                    type="button"
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 active:scale-90 transition-all cursor-pointer"
                    title="Delete transaction"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No transactions match your search or filter criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </AppShell>
  );
}
