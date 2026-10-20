"use client";

import React from "react";
import Link from "next/link";
import { Wallet, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useFinance } from "@/lib/store/finance-context";

export function MobileHeader() {
  const { notifications, isDemoMode } = useFinance();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md md:hidden pt-safe">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
          PayWise
          {isDemoMode && (
            <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1 py-0.2 text-[9px] font-semibold">
              Demo
            </span>
          )}
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground active:scale-95"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
        <ThemeToggle className="h-8 w-8" />
      </div>
    </header>
  );
}
