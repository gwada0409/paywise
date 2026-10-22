"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  CalendarDays,
  PiggyBank,
  CreditCard,
  BarChart3,
  Sparkles,
} from "lucide-react";

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSend: () => void;
  onOpenReceive: () => void;
  onOpenBill: () => void;
  onOpenPlanner: () => void;
}

export function QuickActionsModal({
  isOpen,
  onClose,
  onOpenSend,
  onOpenReceive,
  onOpenBill,
  onOpenPlanner,
}: QuickActionsModalProps) {
  if (!isOpen) return null;

  const actions = [
    {
      title: "Send / Expense",
      desc: "Log daily spending",
      icon: ArrowUpRight,
      color: "bg-blue-500/10 text-ref-blue",
      onClick: () => {
        onClose();
        onOpenSend();
      },
    },
    {
      title: "Receive Income",
      desc: "Record salary payout",
      icon: ArrowDownLeft,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      onClick: () => {
        onClose();
        onOpenReceive();
      },
    },
    {
      title: "Upcoming Bill",
      desc: "Schedule utilities / dues",
      icon: Receipt,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      onClick: () => {
        onClose();
        onOpenBill();
      },
    },
    {
      title: "Plan Payday",
      desc: "Distribute into 4 pillars",
      icon: CalendarDays,
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      onClick: () => {
        onClose();
        onOpenPlanner();
      },
    },
    {
      title: "Savings Goals",
      desc: "Deposit into goals",
      icon: PiggyBank,
      color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      href: "/savings",
    },
    {
      title: "Loans & Debts",
      desc: "Pay down obligations",
      icon: CreditCard,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      href: "/loans",
    },
    {
      title: "AI Assistant",
      desc: "Ask Gemini finance coach",
      icon: Sparkles,
      color: "bg-ai-rainbow text-white",
      href: "/ai",
    },
    {
      title: "Analytics",
      desc: "View cash flow reports",
      icon: BarChart3,
      color: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
      href: "/reports",
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 select-none touch-manipulation cursor-pointer"
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe cursor-default space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Quick Financial Hub</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select an action to execute instantly
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 active:scale-[0.96] transition-transform"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2x4 Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {actions.map((act) => {
            const Icon = act.icon;
            if (act.href) {
              return (
                <Link
                  key={act.title}
                  href={act.href}
                  onClick={onClose}
                  className="p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-slate-50 dark:hover:bg-slate-800/60 active:scale-[0.96] transition-[transform,background-color] flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${act.color} transition-transform group-hover:scale-105`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {act.desc}
                    </span>
                  </div>
                </Link>
              );
            }

            return (
              <button
                key={act.title}
                type="button"
                onClick={act.onClick}
                className="p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-slate-50 dark:hover:bg-slate-800/60 active:scale-[0.96] transition-[transform,background-color] flex flex-col items-center text-center gap-2 group cursor-pointer touch-manipulation"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${act.color} transition-transform group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {act.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
