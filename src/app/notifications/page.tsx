"use client";

import React, { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CalendarDays,
  Receipt,
  CreditCard,
  AlertTriangle,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { formatRelativeDays } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useFinance();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const handleMarkAll = () => {
    markAllNotificationsAsRead();
    toast.success("All notifications marked as read.");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "payday":
      case "salary":
        return <CalendarDays className="h-5 w-5 text-primary" />;
      case "bill_due":
      case "bill_overdue":
        return <Receipt className="h-5 w-5 text-amber-600" />;
      case "loan_due":
        return <CreditCard className="h-5 w-5 text-rose-600" />;
      case "budget_warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "savings_milestone":
        return <PiggyBank className="h-5 w-5 text-emerald-600" />;
      default:
        return <Sparkles className="h-5 w-5 text-ref-blue" />;
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ref-navy flex items-center gap-2.5">
              <Bell className="h-7 w-7 text-ref-blue" />
              Notifications Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-ref-muted">
              Payday reminders, upcoming bill alerts, and budget warnings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border/60 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-1 shadow-xs">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  filter === "all"
                    ? "bg-ref-blue text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  filter === "unread"
                    ? "bg-ref-blue text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Unread
              </button>
            </div>

            <button
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 dark:border-slate-600 bg-white/80 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-colors min-h-[38px]"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="rounded-[28px] sm:rounded-[32px] border border-border/60 dark:border-slate-700 bg-white/95 dark:bg-slate-800/90 backdrop-blur-md p-5 sm:p-7 shadow-xs">
          <div className="divide-y divide-border/50 dark:divide-slate-700/60">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.is_read && markNotificationAsRead(item.id)}
                className={`py-4 flex items-start justify-between gap-3 transition-colors rounded-2xl px-3 cursor-pointer ${
                  !item.is_read ? "bg-sky-50/50 dark:bg-sky-950/40" : "hover:bg-slate-50/60 dark:hover:bg-slate-700/40"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 border border-sky-100 dark:border-slate-600 shadow-2xs shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${!item.is_read ? "font-bold text-ref-navy" : "font-semibold text-ref-navy/80"}`}>
                        {item.title}
                      </h3>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-ref-blue shrink-0" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ref-muted leading-relaxed">
                      {item.message}
                    </p>
                    <span className="mt-1.5 block text-[10px] text-ref-muted/80 font-medium">
                      {formatRelativeDays(item.created_at)}
                    </span>
                  </div>
                </div>

                {!item.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(item.id);
                    }}
                    title="Mark as read"
                    className="p-2 text-ref-muted hover:text-ref-navy rounded-full hover:bg-white dark:hover:bg-slate-700"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="py-12 text-center text-xs text-ref-muted font-medium">
                No notifications to display.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
