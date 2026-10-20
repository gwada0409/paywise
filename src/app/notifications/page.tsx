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
        return <Sparkles className="h-5 w-5 text-indigo-600" />;
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Bell className="h-7 w-7 text-primary" />
              Notifications Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Payday reminders, upcoming bill alerts, and budget warnings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-card p-1">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === "unread"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread
              </button>
            </div>

            <button
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[38px]"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs">
          <div className="divide-y divide-border/60">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.is_read && markNotificationAsRead(item.id)}
                className={`py-4 flex items-start justify-between gap-3 transition-colors rounded-xl px-2 cursor-pointer ${
                  !item.is_read ? "bg-muted/30" : "hover:bg-muted/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${!item.is_read ? "font-bold text-foreground" : "font-semibold text-foreground/80"}`}>
                        {item.title}
                      </h3>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {item.message}
                    </p>
                    <span className="mt-1.5 block text-[10px] text-muted-foreground">
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
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No notifications to display.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
