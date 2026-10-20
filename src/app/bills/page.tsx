"use client";

import React, { useState } from "react";
import {
  Receipt,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  List,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { Bill } from "@/types";
import { toast } from "sonner";

export default function BillsPage() {
  const { bills, markBillAsPaid } = useFinance();
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [viewTab, setViewTab] = useState<"upcoming" | "calendar" | "paid">("upcoming");

  const todayDay = new Date().getDate();

  const unpaidBills = bills.filter((b) => b.status !== "paid");
  const paidBills = bills.filter((b) => b.status === "paid");
  const totalUnpaid = unpaidBills.reduce((s, b) => s + b.amount, 0);

  const handlePay = (bill: Bill) => {
    markBillAsPaid(bill.id);
    toast.success(`Marked ${bill.name} as paid! Expense logged in activity.`);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Receipt className="h-7 w-7 text-amber-600" />
              Bills & Payment Deadlines
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Never miss electricity, water, internet, or loan obligations before your next payday.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switcher */}
            <div className="flex rounded-xl border border-border bg-card p-1">
              <button
                onClick={() => setViewTab("upcoming")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewTab === "upcoming"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Upcoming
              </button>
              <button
                onClick={() => setViewTab("calendar")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewTab === "calendar"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setViewTab("paid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewTab === "paid"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Paid
              </button>
            </div>

            <button
              onClick={() => setIsAddBillOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              Add Bill
            </button>
          </div>
        </div>

        {/* Unpaid Bills Summary Hero */}
        <div className="rounded-3xl border border-amber-500/20 bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Unpaid Obligations
            </p>
            <div className="mt-1">
              <CurrencyDisplay amount={totalUnpaid} size="3xl" weight="bold" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unpaidBills.length} pending bill{unpaidBills.length === 1 ? "" : "s"} reserved from your spendable balance
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-amber-500/10 text-amber-600 px-3 py-1 font-semibold">
              Automatic payday reservations active
            </span>
          </div>
        </div>

        {/* UPCOMING VIEW */}
        {viewTab === "upcoming" && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs">
              <div className="divide-y divide-border/60">
                {unpaidBills.map((bill) => {
                  const daysDiff = bill.due_day - todayDay;
                  const isOverdue = daysDiff < 0;
                  const isDueToday = daysDiff === 0;
                  const isDueSoon = daysDiff > 0 && daysDiff <= 3;

                  return (
                    <div
                      key={bill.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                          isOverdue
                            ? "bg-rose-500/10 text-rose-600"
                            : isDueSoon || isDueToday
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}>
                          <Receipt className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground">{bill.name}</h3>
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isOverdue
                                ? "bg-rose-500/15 text-rose-600"
                                : isDueToday
                                ? "bg-amber-500/15 text-amber-600"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {isOverdue ? "Overdue" : isDueToday ? "Due Today" : `Due Day ${bill.due_day}`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {bill.category} • {bill.recurrence} {bill.notes && `• "${bill.notes}"`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0">
                        <CurrencyDisplay amount={bill.amount} size="lg" weight="bold" />

                        <button
                          onClick={() => handlePay(bill)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
                        >
                          <Check className="h-4 w-4" />
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  );
                })}

                {unpaidBills.length === 0 && (
                  <p className="py-12 text-center text-xs text-muted-foreground">
                    All upcoming bills are paid!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {viewTab === "calendar" && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground mb-4">
              Monthly Due Dates Calendar (Days 1 to 31)
            </h2>

            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const dayBills = bills.filter((b) => b.due_day === day);
                const hasUnpaid = dayBills.some((b) => b.status !== "paid");
                const isToday = day === todayDay;

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border p-2 sm:p-3 min-h-[70px] sm:min-h-[85px] flex flex-col justify-between transition-all ${
                      isToday
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : dayBills.length > 0
                        ? "border-amber-500/30 bg-card"
                        : "border-border/60 bg-muted/10 text-muted-foreground"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day} {isToday && "• Today"}
                    </span>

                    <div className="mt-1 space-y-1">
                      {dayBills.map((b) => (
                        <div
                          key={b.id}
                          className={`rounded px-1 py-0.5 text-[9px] sm:text-[10px] font-semibold truncate ${
                            b.status === "paid"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          ₱{b.amount.toLocaleString()} ({b.name})
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAID HISTORY VIEW */}
        {viewTab === "paid" && (
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs">
            <div className="divide-y divide-border/60">
              {paidBills.map((bill) => (
                <div key={bill.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bill.category} • Due Day {bill.due_day}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <CurrencyDisplay amount={bill.amount} size="base" weight="bold" />
                    <span className="block text-[11px] font-semibold text-emerald-600">
                      Paid
                    </span>
                  </div>
                </div>
              ))}

              {paidBills.length === 0 && (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  No bills marked as paid yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <BillFormModal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
      />
    </AppShell>
  );
}
